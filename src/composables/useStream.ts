import { ref, readonly } from "vue";

export type StreamMode = "raw" | "sse";

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  backoff?: "exponential" | "linear";
}

export interface UseStreamOptions {
  mode?: StreamMode;
  /** chunk 缓冲间隔，>0 时启用 rAF 批量刷新。默认 0（不缓冲） */
  bufferInterval?: number;
  /** 断线重试配置 */
  retry?: RetryOptions;
  /** 流超时时间(ms)，0 = 无超时。默认 0 */
  timeout?: number;
  onChunk?: (text: string) => void;
  onData?: (parsed: unknown) => void; // SSE 模式下每条 data: 解析后回调
  onDone?: () => void;
  onError?: (error: Error) => void;
  onRetry?: (attempt: number) => void;
}

export function useStream(options: UseStreamOptions = {}) {
  const isStreaming = ref(false);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const retryCount = ref(0);
  let abortController: AbortController | null = null;
  let buffer = "";

  async function start(readableStream: ReadableStream<Uint8Array>) {
    isLoading.value = true;
    isStreaming.value = false;
    error.value = null;
    buffer = "";
    abortController = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    if (options.timeout && options.timeout > 0) {
      timeoutId = setTimeout(() => {
        abortController?.abort();
      }, options.timeout);
    }

    let chunkBuffer = "";
    let dataBuffer: unknown[] = [];
    let rafScheduled = false;

    const flushBuffer = () => {
      if (chunkBuffer) {
        options.onChunk?.(chunkBuffer);
        chunkBuffer = "";
      }
      if (dataBuffer.length > 0) {
        for (const item of dataBuffer) {
          options.onData?.(item);
        }
        dataBuffer = [];
      }
      rafScheduled = false;
    };

    const scheduleFlush = () => {
      if (!rafScheduled) {
        rafScheduled = true;
        requestAnimationFrame(flushBuffer);
      }
    };

    try {
      const reader = readableStream.getReader();
      const decoder = new TextDecoder();
      isLoading.value = false;
      isStreaming.value = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        if (options.mode === "sse") {
          buffer += chunk;
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":")) continue;
            if (trimmed.startsWith("data: ")) {
              const data = trimmed.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if ((options.bufferInterval ?? 0) > 0) {
                  dataBuffer.push(parsed);
                  scheduleFlush();
                } else {
                  options.onData?.(parsed);
                }
              } catch {
                if ((options.bufferInterval ?? 0) > 0) {
                  chunkBuffer += data;
                  scheduleFlush();
                } else {
                  options.onChunk?.(data);
                }
              }
            }
          }
        } else {
          if ((options.bufferInterval ?? 0) > 0) {
            chunkBuffer += chunk;
            scheduleFlush();
          } else {
            options.onChunk?.(chunk);
          }
        }
      }
      flushBuffer();
      options.onDone?.();
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        const maxRetries = options.retry?.maxRetries ?? 0;
        if (retryCount.value < maxRetries) {
          const baseDelay = options.retry?.baseDelay ?? 1000;
          const delay =
            options.retry?.backoff === "linear"
              ? baseDelay * (retryCount.value + 1)
              : baseDelay * Math.pow(2, retryCount.value);
          retryCount.value++;
          await new Promise((r) => setTimeout(r, delay));
          options.onRetry?.(retryCount.value);
          return;
        }
        error.value = e as Error;
        options.onError?.(e as Error);
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      isStreaming.value = false;
      isLoading.value = false;
    }
  }

  function cancel() {
    abortController?.abort();
    isStreaming.value = false;
    isLoading.value = false;
  }

  return {
    isStreaming: readonly(isStreaming),
    isLoading: readonly(isLoading),
    error: readonly(error),
    retryCount: readonly(retryCount),
    start,
    cancel,
  };
}
