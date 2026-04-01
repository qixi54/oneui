import { computed, h } from "vue";
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import KanbanColumn from "../components/kanban/KanbanColumn.vue";
import GalleryCard from "../components/gallery/GalleryCard.vue";
import type { KanbanColumnData, Task, GalleryItem } from "../types";

let capturedItemHeight: number | ((index: number) => number) = 0;
const measureTextLayoutState = vi.hoisted(() => ({
  measureTextBlockMock: vi.fn((options) => {
    const approximateCharsPerLine = Math.max(1, Math.floor(Math.max(options.maxWidth, 1) / 12));
    const lineCount = Math.max(1, Math.ceil((options.text ?? "").length / approximateCharsPerLine));
    const contentHeight = Math.max(options.lineHeight, lineCount * options.lineHeight);
    return {
      height: Math.max(options.minHeight ?? 0, (options.chromeHeight ?? 0) + contentHeight),
      contentHeight,
      lineCount,
      isApproximate: true,
    };
  }),
}));

vi.mock("../composables/useVirtualList", async () => {
  const actual = await vi.importActual<typeof import("../composables/useVirtualList")>(
    "../composables/useVirtualList",
  );

  return {
    ...actual,
    useVirtualList: vi.fn((options) => {
      capturedItemHeight = options.itemHeight;
      return {
        visibleItems: computed(() =>
          options.items.value.slice(0, 2).map((data: Task, index: number) => ({ data, index })),
        ),
        totalHeight: computed(() => 2048),
        offsetY: computed(() => 0),
        scrollToIndex: vi.fn(),
        scrollToBottom: vi.fn(),
        observeRow: vi.fn(),
      };
    }),
  };
});

vi.mock("../composables/useTextLayout", () => {
  return {
    measureTextBlock: measureTextLayoutState.measureTextBlockMock,
  };
});

function buildTasks(title: string): Task[] {
  return Array.from({ length: 60 }, (_, index) => ({
    id: `TASK-${index + 1}`,
    title: index === 0 ? title : `Task ${index + 1}`,
    status: index % 2 === 0 ? "todo" : "doing",
    priority: index % 3 === 0 ? "P0" : "P1",
    role: index % 4 === 0 ? "Owner" : undefined,
    description: index === 0 ? "Kanban card description with a bit more text to wrap." : undefined,
  }));
}

function buildColumn(title: string): KanbanColumnData {
  return {
    id: "todo",
    title: "Todo",
    tasks: buildTasks(title),
  };
}

function mountVirtualColumn(title: string) {
  return mount(KanbanColumn, {
    props: {
      column: buildColumn(title),
      cardVariant: "default",
    },
  });
}

beforeEach(() => {
  capturedItemHeight = 0;
  measureTextLayoutState.measureTextBlockMock.mockClear();
});

describe("Kanban / Gallery 集成", () => {
  it("KanbanColumn 虚拟模式使用文本驱动的预测高度", () => {
    mountVirtualColumn("Short title");
    const shortHeight =
      typeof capturedItemHeight === "function" ? capturedItemHeight(0) : capturedItemHeight;

    mountVirtualColumn(
      "A very long kanban card title that should wrap onto multiple lines in the predicted height",
    );
    const longHeight =
      typeof capturedItemHeight === "function" ? capturedItemHeight(0) : capturedItemHeight;

    expect(typeof capturedItemHeight).toBe("function");
    expect(longHeight).toBeGreaterThan(shortHeight);
    expect(measureTextLayoutState.measureTextBlockMock).toHaveBeenCalled();
    expect(
      measureTextLayoutState.measureTextBlockMock.mock.calls.some(
        ([options]) =>
          options.text ===
          "A very long kanban card title that should wrap onto multiple lines in the predicted height",
      ),
    ).toBe(true);
  });

  it("KanbanColumn 在非虚拟模式下仍然可以正常渲染自定义 card slot", () => {
    const wrapper = mount(KanbanColumn, {
      props: {
        column: {
          id: "doing",
          title: "Doing",
          tasks: [
            {
              id: "TASK-1",
              title: "Custom slot card",
              status: "doing",
              priority: "P1",
            },
            {
              id: "TASK-2",
              title: "Another card",
              status: "doing",
              priority: "P1",
            },
          ],
        },
      },
      slots: {
        card: ({ task }) => h("div", { class: "custom-kanban-card" }, task.title),
      },
    });

    expect(wrapper.find(".custom-kanban-card").exists()).toBe(true);
    expect(wrapper.text()).toContain("Custom slot card");
  });

  it("GalleryCard 暴露文本驱动的预测高度 hook", () => {
    const shortItem: GalleryItem = {
      id: "G-1",
      title: "Short gallery card",
      status: "todo",
      priority: "P1",
      description: "Short description",
      extraProps: [],
    };
    const longItem: GalleryItem = {
      id: "G-2",
      title: "A much longer gallery card title that should require more than one line",
      status: "todo",
      priority: "P1",
      description:
        "A longer gallery description that gives the predictive layout more text to account for when estimating card height.",
      extraProps: [
        { key: "Owner", value: "Platform" },
        { key: "Stage", value: "Implementation" },
      ],
    };

    const shortCard = mount(GalleryCard, {
      props: { item: shortItem },
    });

    const longCard = mount(GalleryCard, {
      props: { item: longItem },
    });

    const shortHeight = Number(shortCard.attributes("data-gallery-card-predicted-height"));
    const longHeight = Number(longCard.attributes("data-gallery-card-predicted-height"));

    expect(shortHeight).toBeGreaterThan(0);
    expect(longHeight).toBeGreaterThan(shortHeight);
    expect(
      measureTextLayoutState.measureTextBlockMock.mock.calls.some(
        ([options]) =>
          options.text ===
          "A much longer gallery card title that should require more than one line",
      ),
    ).toBe(true);
  });
});
