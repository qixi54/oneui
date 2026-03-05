import { ref, readonly } from "vue";

export type StreamMode = "raw" | "sse";

export interface UseStreamOptions {
  mode?: StreamMode;
  onChunk?: (text: string) => void;
  onData?: (parsed: unknown) => void; // SSE 模式下每条 data: 解析后回调
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export function useStream(options: UseStreamOptions = {}) {
  const isStreaming = ref(false);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  let abortController: AbortController | null = null;
  let buffer = "";

  async function start(readableStream: ReadableStream<Uint8Array>) {
    isLoading.value = true;
    isStreaming.value = false;
    error.value = null;
    buffer = "";
    abortController = new AbortController();

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
                options.onData?.(parsed);
              } catch {
                options.onChunk?.(data);
              }
            }
          }
        } else {
          options.onChunk?.(chunk);
        }
      }
      options.onDone?.();
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        error.value = e as Error;
        options.onError?.(e as Error);
      }
    } finally {
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
    start,
    cancel,
  };
}
