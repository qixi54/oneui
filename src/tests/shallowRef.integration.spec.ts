import { isReadonly } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useAiChat } from "../composables/useAiChat";
import { useTable } from "../composables/useTable";
import { useTableFilter } from "../composables/useTableFilter";

function createEmptyStream(): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.close();
    },
  });
}

describe("shallowRef regressions", () => {
  it("useTable 的 rawData 为 shallowRef，替换数组后 processedData 会更新", () => {
    const table = useTable({
      data: [{ id: 1, name: "old" }],
    });

    expect(isReadonly(table.rawData)).toBe(true);
    expect(table.data.value).toEqual([{ id: 1, name: "old" }]);

    table.setData([{ id: 2, name: "new" }]);

    expect(table.rawData.value).toEqual([{ id: 2, name: "new" }]);
    expect(table.data.value).toEqual([{ id: 2, name: "new" }]);
  });

  it("useTable 的 setData 后数据正确反映", () => {
    const table = useTable({
      data: [
        { id: 1, name: "a" },
        { id: 2, name: "b" },
      ],
      pageSize: 1,
    });

    expect(table.data.value).toEqual([{ id: 1, name: "a" }]);
    expect(table.pagination.value.page).toBe(1);
    expect(table.pagination.value.total).toBe(2);

    table.setData([{ id: 3, name: "c" }]);

    expect(table.rawData.value).toEqual([{ id: 3, name: "c" }]);
    expect(table.data.value).toEqual([{ id: 3, name: "c" }]);
    expect(table.pagination.value.page).toBe(1);
    expect(table.pagination.value.total).toBe(1);
  });

  it("useAiChat 的 messages 在 send 后更新", async () => {
    const sendRequest = vi.fn(async () => createEmptyStream());
    const chat = useAiChat({ sendRequest });

    await chat.send("你好");

    expect(sendRequest).toHaveBeenCalledTimes(1);
    expect(chat.messages.value).toHaveLength(2);
    expect(chat.messages.value[0]).toMatchObject({
      role: "user",
      content: "你好",
    });
    expect(chat.messages.value[1]).toMatchObject({
      role: "ai",
      content: "",
      isStreaming: false,
    });
  });

  it("useTableFilter 的 addCondition 后 conditions 数组更新", () => {
    const filter = useTableFilter({
      columns: [{ key: "title", label: "标题", type: "string" }],
    });

    expect(isReadonly(filter.conditions)).toBe(true);
    expect(filter.conditions.value).toEqual([]);

    filter.addCondition("title");

    expect(filter.conditions.value).toHaveLength(1);
    expect(filter.conditions.value[0]).toMatchObject({
      field: "title",
      operator: "contains",
      value: "",
    });
  });
});
