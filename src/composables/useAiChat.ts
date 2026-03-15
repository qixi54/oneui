import { ref, readonly, shallowRef, triggerRef } from "vue";
import { useStream } from "./useStream";
import { useTypewriter } from "./useTypewriter";

export interface ChatMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  isStreaming?: boolean;
  timestamp?: string;
  error?: boolean;
}

export interface UseAiChatOptions {
  /**
   * 发送消息的函数，返回 ReadableStream 或 Response
   * 业务层自己实现具体的 API 调用
   */
  sendRequest: (
    content: string,
    history: ChatMessage[],
  ) => Promise<ReadableStream<Uint8Array> | Response>;
  /**
   * SSE 模式下解析每条 data 并返回文本增量，返回 null 则跳过
   */
  parseChunk?: (data: unknown) => string | null;
  /** 是否启用打字机效果，默认 false（直接追加） */
  typewriter?: boolean;
  typewriterSpeed?: number;
  onError?: (error: Error) => void;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function useAiChat(options: UseAiChatOptions) {
  const messages = shallowRef<ChatMessage[]>([]);
  const isGenerating = ref(false);
  const currentAiMessageId = ref<string | null>(null);

  const tw = options.typewriter
    ? useTypewriter({
        speed: options.typewriterSpeed ?? 15,
        onUpdate: (text: string) => {
          if (currentAiMessageId.value) {
            const idx = messages.value.findIndex((m) => m.id === currentAiMessageId.value);
            if (idx !== -1) {
              messages.value[idx].content = text;
              triggerRef(messages);
            }
          }
        },
      })
    : null;

  function addUserMessage(content: string): ChatMessage {
    const msg: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };
    messages.value.push(msg);
    triggerRef(messages);
    return msg;
  }

  function addAiMessage(): ChatMessage {
    const msg: ChatMessage = {
      id: generateId(),
      role: "ai",
      content: "",
      isStreaming: true,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };
    messages.value.push(msg);
    triggerRef(messages);
    currentAiMessageId.value = msg.id;
    return msg;
  }

  function updateAiMessage(id: string, update: Partial<ChatMessage>) {
    const idx = messages.value.findIndex((m) => m.id === id);
    if (idx !== -1) {
      messages.value[idx] = { ...messages.value[idx], ...update };
      triggerRef(messages);
    }
  }

  function appendToAiMessage(id: string, text: string) {
    const idx = messages.value.findIndex((m) => m.id === id);
    if (idx !== -1) {
      messages.value[idx].content += text;
      triggerRef(messages);
    }
  }

  const {
    start: startStream,
    cancel: cancelStream,
    isStreaming,
  } = useStream({
    mode: options.parseChunk ? "sse" : "raw",
    onData: options.parseChunk
      ? (data: unknown) => {
          const text = options.parseChunk!(data);
          if (text && currentAiMessageId.value) {
            if (tw) {
              tw.append(text);
            } else {
              appendToAiMessage(currentAiMessageId.value, text);
            }
          }
        }
      : undefined,
    onChunk: !options.parseChunk
      ? (chunk: string) => {
          if (currentAiMessageId.value) {
            if (tw) {
              tw.append(chunk);
            } else {
              appendToAiMessage(currentAiMessageId.value, chunk);
            }
          }
        }
      : undefined,
    onDone: () => {
      if (currentAiMessageId.value) {
        if (tw) tw.flush();
        updateAiMessage(currentAiMessageId.value, { isStreaming: false });
      }
      isGenerating.value = false;
      currentAiMessageId.value = null;
    },
    onError: (error: Error) => {
      if (currentAiMessageId.value) {
        updateAiMessage(currentAiMessageId.value, {
          isStreaming: false,
          error: true,
          content: `错误：${error.message}`,
        });
      }
      isGenerating.value = false;
      currentAiMessageId.value = null;
      options.onError?.(error);
    },
  });

  async function send(content: string) {
    if (isGenerating.value || !content.trim()) return;

    addUserMessage(content);
    const aiMsg = addAiMessage();
    isGenerating.value = true;
    if (tw) tw.reset();

    try {
      const result = await options.sendRequest(content, messages.value.slice(0, -2));
      const stream = result instanceof Response ? result.body! : result;
      await startStream(stream);
    } catch (e) {
      updateAiMessage(aiMsg.id, {
        isStreaming: false,
        error: true,
        content: `请求失败：${(e as Error).message}`,
      });
      isGenerating.value = false;
      currentAiMessageId.value = null;
      options.onError?.(e as Error);
    }
  }

  function cancel() {
    cancelStream();
    if (currentAiMessageId.value) {
      updateAiMessage(currentAiMessageId.value, { isStreaming: false });
    }
    isGenerating.value = false;
    currentAiMessageId.value = null;
  }

  function clear() {
    cancel();
    messages.value = [];
    triggerRef(messages);
  }

  return {
    messages: readonly(messages),
    isGenerating: readonly(isGenerating),
    isStreaming,
    send,
    cancel,
    clear,
  };
}
