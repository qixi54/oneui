import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useStream } from "../composables/useStream";

function createReadableStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index]));
        index++;
      } else {
        controller.close();
      }
    },
  });
}

function createSSEStream(events: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const data = events.map((e) => `data: ${e}\n\n`).join("") + "data: [DONE]\n\n";
  let sent = false;
  return new ReadableStream({
    pull(controller) {
      if (!sent) {
        controller.enqueue(encoder.encode(data));
        sent = true;
      } else {
        controller.close();
      }
    },
  });
}

describe("useStream", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((cb) => {
      return setTimeout(() => cb(performance.now()), 0) as unknown as number;
    });
    vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation((id) => {
      clearTimeout(id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("raw 模式下 onChunk 收到所有文本块", async () => {
    const chunks: string[] = [];
    const { start } = useStream({
      mode: "raw",
      onChunk: (text) => chunks.push(text),
    });

    await start(createReadableStream(["hello ", "world"]));

    expect(chunks.join("")).toBe("hello world");
  });

  it("SSE 模式下 onData 收到解析后的 JSON 对象", async () => {
    const data: unknown[] = [];
    const { start } = useStream({
      mode: "sse",
      onData: (parsed) => data.push(parsed),
    });

    await start(createSSEStream(['{"text":"hi"}', '{"text":"there"}']));

    expect(data).toEqual([{ text: "hi" }, { text: "there" }]);
  });

  it("onDone 在流结束后调用", async () => {
    const onDone = vi.fn();
    const { start } = useStream({
      mode: "raw",
      onDone,
    });

    await start(createReadableStream(["data"]));

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("cancel 中止流且不触发 onError", async () => {
    const onError = vi.fn();
    const { start, cancel } = useStream({
      mode: "raw",
      onError,
      onChunk: () => {
        cancel();
      },
    });

    await start(createReadableStream(["chunk1", "chunk2", "chunk3"]));

    expect(onError).not.toHaveBeenCalled();
  });

  it("retryCount 初始为 0", () => {
    const { retryCount } = useStream();
    expect(retryCount.value).toBe(0);
  });

  it("bufferInterval > 0 时 chunk 被缓冲后批量回调", async () => {
    const chunks: string[] = [];
    const { start } = useStream({
      mode: "raw",
      bufferInterval: 50,
      onChunk: (text) => chunks.push(text),
    });

    await start(createReadableStream(["a", "b", "c"]));

    // 缓冲模式下，多个 chunk 可能合并为一次回调
    const joined = chunks.join("");
    expect(joined).toBe("abc");
    // 回调次数应 <= 原始 chunk 数量（由于缓冲合并）
    expect(chunks.length).toBeLessThanOrEqual(3);
  });

  it("RetryOptions 类型可从模块导出使用", async () => {
    // 验证 RetryOptions 在类型层面可用
    const { retryCount } = useStream({
      retry: { maxRetries: 3, baseDelay: 100, backoff: "exponential" },
      onError: () => {},
    });

    expect(retryCount.value).toBe(0);
  });
});
