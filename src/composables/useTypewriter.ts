import { ref, readonly } from "vue";

export interface UseTypewriterOptions {
  speed?: number; // ms per character, default 20
  onComplete?: () => void;
}

export function useTypewriter(options: UseTypewriterOptions = {}) {
  const displayText = ref("");
  const isTyping = ref(false);
  let fullText = "";
  let currentIndex = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const speed = options.speed ?? 20;

  function type() {
    if (currentIndex >= fullText.length) {
      isTyping.value = false;
      options.onComplete?.();
      return;
    }
    displayText.value = fullText.slice(0, ++currentIndex);
    timer = setTimeout(type, speed);
  }

  function append(text: string) {
    fullText += text;
    if (!isTyping.value) {
      isTyping.value = true;
      type();
    }
  }

  function reset() {
    if (timer) clearTimeout(timer);
    fullText = "";
    currentIndex = 0;
    displayText.value = "";
    isTyping.value = false;
  }

  function flush() {
    if (timer) clearTimeout(timer);
    displayText.value = fullText;
    currentIndex = fullText.length;
    isTyping.value = false;
    options.onComplete?.();
  }

  return {
    displayText: readonly(displayText),
    isTyping: readonly(isTyping),
    append,
    reset,
    flush,
  };
}
