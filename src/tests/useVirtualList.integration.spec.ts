import { describe, expect, it } from "vitest";
import { ref, nextTick } from "vue";
import { createVirtualListState, useVirtualList } from "../composables/useVirtualList";
import { createVirtualListState as createVirtualListStateFromRoot, useVirtualList as useVirtualListFromRoot } from "../index";
import type { VirtualListState } from "../index";

function createMockContainer(clientHeight: number): HTMLElement {
  const el = document.createElement("div");
  Object.defineProperty(el, "clientHeight", { value: clientHeight, writable: true });
  Object.defineProperty(el, "scrollTop", { value: 0, writable: true });
  Object.defineProperty(el, "scrollHeight", { value: 0, writable: true });
  return el;
}

describe("useVirtualList", () => {
  it("固定行高模式下只返回可见区域内的项", async () => {
    const items = ref(Array.from({ length: 100 }, (_, i) => ({ id: i })));
    const container = createMockContainer(200);
    const containerRef = ref<HTMLElement | null>(null);

    const { visibleItems, totalHeight } = useVirtualList({
      items,
      itemHeight: 40,
      overscan: 2,
      containerRef,
    });

    // 绑定容器
    containerRef.value = container;
    await nextTick();

    // totalHeight = 100 * 40 = 4000
    expect(totalHeight.value).toBe(4000);

    // 可见项数量应远小于总数（200px / 40px = 5 可见 + 2*2 overscan = 9）
    expect(visibleItems.value.length).toBeLessThanOrEqual(10);
    expect(visibleItems.value.length).toBeGreaterThan(0);

    // 第一项应从 index 0 开始
    expect(visibleItems.value[0].index).toBe(0);
  });

  it("动态行高模式计算正确的 totalHeight", async () => {
    const items = ref([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const containerRef = ref<HTMLElement | null>(null);
    const heights = [50, 80, 120];

    const { totalHeight } = useVirtualList({
      items,
      itemHeight: (index: number) => heights[index] ?? 50,
      overscan: 1,
      containerRef,
    });

    containerRef.value = createMockContainer(200);
    await nextTick();

    expect(totalHeight.value).toBe(250); // 50 + 80 + 120
  });

  it("空数据时返回空 visibleItems", async () => {
    const items = ref<{ id: number }[]>([]);
    const containerRef = ref<HTMLElement | null>(null);

    const { visibleItems, totalHeight } = useVirtualList({
      items,
      itemHeight: 40,
      containerRef,
    });

    containerRef.value = createMockContainer(200);
    await nextTick();

    expect(visibleItems.value).toEqual([]);
    expect(totalHeight.value).toBe(0);
  });

  it("items 变化时 visibleItems 自动更新", async () => {
    const items = ref(Array.from({ length: 5 }, (_, i) => ({ id: i })));
    const containerRef = ref<HTMLElement | null>(null);

    const { visibleItems, totalHeight } = useVirtualList({
      items,
      itemHeight: 40,
      containerRef,
    });

    containerRef.value = createMockContainer(200);
    await nextTick();

    items.value = Array.from({ length: 50 }, (_, i) => ({ id: i }));
    await nextTick();

    expect(totalHeight.value).toBe(2000);
    // 可见项数量仍受容器高度限制
    expect(visibleItems.value.length).toBeLessThanOrEqual(15);
  });

  it("scrollToBottom 将 scrollTop 设置到底部", async () => {
    const items = ref(Array.from({ length: 100 }, (_, i) => ({ id: i })));
    const container = createMockContainer(200);
    const containerRef = ref<HTMLElement | null>(null);

    const { scrollToBottom } = useVirtualList({
      items,
      itemHeight: 40,
      containerRef,
    });

    containerRef.value = container;
    await nextTick();

    scrollToBottom();

    // scrollTop 应设置为 totalHeight - clientHeight = 4000 - 200 = 3800
    expect(container.scrollTop).toBe(3800);
  });

  it("scrollToIndex 滚动到指定索引位置", async () => {
    const items = ref(Array.from({ length: 100 }, (_, i) => ({ id: i })));
    const container = createMockContainer(200);
    const containerRef = ref<HTMLElement | null>(null);

    const { scrollToIndex } = useVirtualList({
      items,
      itemHeight: 40,
      containerRef,
    });

    containerRef.value = container;
    await nextTick();

    scrollToIndex(10);

    // scrollTop = 10 * 40 = 400
    expect(container.scrollTop).toBe(400);
  });

  it("共享 virtual state 时可以跨实例保留滚动位置并响应容器重绑", async () => {
    const items = ref(Array.from({ length: 100 }, (_, i) => ({ id: i })));
    const state = createVirtualListState();

    const firstContainer = createMockContainer(200);
    const firstContainerRef = ref<HTMLElement | null>(null);
    const firstList = useVirtualList({
      items,
      itemHeight: 40,
      containerRef: firstContainerRef,
      state,
    });

    firstContainerRef.value = firstContainer;
    await nextTick();

    firstList.scrollToIndex(10);
    expect(firstContainer.scrollTop).toBe(400);
    expect(state.scrollTop.value).toBe(400);

    const secondContainer = createMockContainer(120);
    const secondContainerRef = ref<HTMLElement | null>(null);
    const secondList = useVirtualList({
      items,
      itemHeight: 40,
      containerRef: secondContainerRef,
      state,
    });

    secondContainerRef.value = secondContainer;
    await nextTick();

    expect(secondContainer.scrollTop).toBe(400);
    expect(state.containerHeight.value).toBe(120);
    expect(secondList.visibleItems.value.some((item) => item.index === 10)).toBe(true);
  });

  it("包入口对外暴露 createVirtualListState 和 VirtualListState", async () => {
    const items = ref(Array.from({ length: 20 }, (_, i) => ({ id: i })));
    const state: VirtualListState = createVirtualListStateFromRoot();
    const containerRef = ref<HTMLElement | null>(null);
    const container = createMockContainer(120);

    const { scrollToIndex, visibleItems } = useVirtualListFromRoot({
      items,
      itemHeight: 40,
      containerRef,
      state,
    });

    containerRef.value = container;
    await nextTick();

    scrollToIndex(3);

    expect(container.scrollTop).toBe(120);
    expect(state.scrollTop.value).toBe(120);
    expect(visibleItems.value.some((item) => item.index === 3)).toBe(true);
  });
});
