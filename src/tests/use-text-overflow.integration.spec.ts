import { defineComponent, h, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const measureTextBlockMock = vi.fn();

vi.mock("../composables/useTextLayout", () => ({
  measureTextBlock: (...args: unknown[]) => measureTextBlockMock(...args),
}));

import { useTextOverflow } from "../composables/useTextOverflow";

describe("useTextOverflow", () => {
  const originalResizeObserver = globalThis.ResizeObserver;

  beforeEach(() => {
    measureTextBlockMock.mockReset();
    class TestResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    globalThis.ResizeObserver = TestResizeObserver as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
  });

  it("detects single-line overflow from element metrics", async () => {
    const Probe = defineComponent({
      setup() {
        const overflow = useTextOverflow({
          text: "single line text",
          font: "14px Inter",
          lineHeight: 20,
          maxLines: 1,
        });

        return () =>
          h("span", {
            ref: overflow.targetRef,
            "data-overflow": String(overflow.isOverflowing.value),
          }, "single line text");
      },
    });

    const wrapper = mount(Probe);
    const el = wrapper.element as HTMLElement;
    Object.defineProperty(el, "clientWidth", { configurable: true, value: 120 });
    Object.defineProperty(el, "scrollWidth", { configurable: true, value: 240 });
    Object.defineProperty(el, "clientHeight", { configurable: true, value: 20 });
    Object.defineProperty(el, "scrollHeight", { configurable: true, value: 20 });

    await nextTick();
    await nextTick();

    expect(wrapper.attributes("data-overflow")).toBe("true");
    expect(measureTextBlockMock).not.toHaveBeenCalled();
  });

  it("predicts multi-line overflow with shared text layout measurement", async () => {
    measureTextBlockMock.mockReturnValue({
      height: 96,
      contentHeight: 96,
      lineCount: 4,
      isApproximate: false,
    });

    const Probe = defineComponent({
      setup() {
        const overflow = useTextOverflow({
          text: "long long long long text",
          font: "14px Inter",
          lineHeight: 24,
          maxLines: 2,
          whiteSpace: "normal",
        });

        return () =>
          h("div", {
            ref: overflow.targetRef,
            "data-overflow": String(overflow.isOverflowing.value),
            "data-predicted-height": String(overflow.predictedHeight.value),
            "data-clamp-height": String(overflow.clampHeight.value),
          }, "long long long long text");
      },
    });

    const wrapper = mount(Probe);
    const el = wrapper.element as HTMLElement;
    Object.defineProperty(el, "clientWidth", { configurable: true, value: 180 });
    Object.defineProperty(el, "scrollHeight", { configurable: true, value: 96 });

    await nextTick();
    await nextTick();

    expect(measureTextBlockMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "long long long long text",
        font: "14px Inter",
        maxWidth: 180,
        lineHeight: 24,
        whiteSpace: "normal",
      }),
    );
    expect(wrapper.attributes("data-predicted-height")).toBe("96");
    expect(wrapper.attributes("data-clamp-height")).toBe("48");
    expect(wrapper.attributes("data-overflow")).toBe("true");
  });
});
