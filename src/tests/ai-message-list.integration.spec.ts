import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { computed, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import AiMessageList from "../components/ai/AiMessageList.vue";
import type { MeasureTextBlockOptions } from "../composables/useTextLayout";

const AI_MESSAGE_LAYOUT = {
  font: "14px Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
  lineHeightPx: 22.4,
  bubblePaddingX: 14,
  bubblePaddingY: 10,
  avatarAndGapPx: 44,
} as const;

const useVirtualListMock = vi.fn();
const scrollToBottomMock = vi.fn();
const measureTextBlockMock = vi.fn((options: MeasureTextBlockOptions) => ({
  height: Math.max(
    options.minHeight ?? 0,
    (options.chromeHeight ?? 0) +
      options.lineHeight +
      Math.ceil(options.text.length / 8) +
      options.maxWidth / 100,
  ),
  contentHeight: options.lineHeight,
  lineCount: Math.max(1, Math.ceil(options.text.length / 8)),
  isApproximate: false,
}));

vi.mock("../composables/useTextLayout", () => ({
  measureTextBlock: (options: MeasureTextBlockOptions) => measureTextBlockMock(options),
}));

vi.mock("../composables/useVirtualList", async () => {
  const actual = await vi.importActual<typeof import("../composables/useVirtualList")>(
    "../composables/useVirtualList",
  );

  return {
    ...actual,
    createVirtualListState: actual.createVirtualListState,
    useVirtualList: (...args: Parameters<typeof actual.useVirtualList>) => {
      useVirtualListMock(...args);
      return {
        visibleItems: computed(() => []),
        totalHeight: computed(() => 0),
        offsetY: computed(() => 0),
        scrollToBottom: scrollToBottomMock,
        observeRow: vi.fn(),
      };
    },
  };
});

describe("AiMessageList", () => {
  const originalResizeObserver = globalThis.ResizeObserver;

  beforeEach(() => {
    useVirtualListMock.mockClear();
    scrollToBottomMock.mockClear();
    measureTextBlockMock.mockClear();

    class TestResizeObserver {
      private readonly callback: ResizeObserverCallback;

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }

      observe(target: Element) {
        this.callback(
          [
            {
              target,
              contentRect: { width: 240, height: 320, x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0 },
            } as ResizeObserverEntry,
          ],
          this as unknown as ResizeObserver,
        );
      }

      disconnect() {}

      unobserve() {}
    }

    globalThis.ResizeObserver = TestResizeObserver as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
  });

  it("uses the text layout adapter instead of a raw character-count heuristic", async () => {
    const wrapper = mount(AiMessageList, {
      props: {
        messages: [
          { id: "1", role: "ai", content: "hello world hello world hello world" },
        ],
      },
    });

    await nextTick();

    expect(useVirtualListMock).toHaveBeenCalledTimes(1);
    const options = useVirtualListMock.mock.calls[0][0] as {
      itemHeight: (index: number) => number;
    };
    const height = options.itemHeight(0);
    expect(measureTextBlockMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "hello world hello world hello world",
        font: AI_MESSAGE_LAYOUT.font,
        maxWidth: 240 - AI_MESSAGE_LAYOUT.avatarAndGapPx - AI_MESSAGE_LAYOUT.bubblePaddingX * 2,
        lineHeight: AI_MESSAGE_LAYOUT.lineHeightPx,
        whiteSpace: "pre-wrap",
        chromeHeight: AI_MESSAGE_LAYOUT.bubblePaddingY * 2,
        minHeight: AI_MESSAGE_LAYOUT.bubblePaddingY * 2 + AI_MESSAGE_LAYOUT.lineHeightPx,
      }),
    );

    expect(height).toBeGreaterThan(0);
    expect(height).toBe(measureTextBlockMock.mock.results[0].value.height);

    wrapper.unmount();
  });

  it("keeps scrollToBottom wiring intact", async () => {
    const wrapper = mount(AiMessageList, {
      props: {
        messages: [{ id: "1", role: "user", content: "first" }],
        isThinking: false,
      },
    });

    await nextTick();

    expect(scrollToBottomMock).toHaveBeenCalled();

    await wrapper.setProps({
      messages: [
        { id: "1", role: "user", content: "first" },
        { id: "2", role: "ai", content: "second" },
      ],
    });

    await nextTick();

    expect(scrollToBottomMock).toHaveBeenCalledTimes(2);
    wrapper.unmount();
  });
});
