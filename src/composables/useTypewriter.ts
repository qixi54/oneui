import { ref, readonly } from "vue";

export interface UseTypewriterOptions {
  speed?: number; // ms per character, default 20
  onUpdate?: (text: string) => void;
  onComplete?: () => void;
}

export function useTypewriter(options: UseTypewriterOptions = {}) {
  const displayText = ref("");
  const isTyping = ref(false);
  let fullText = "";
  let currentIndex = 0;
  let rafId: number | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const speed = options.speed ?? 20;

  function clearScheduledWork() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function typeWithTimeout() {
    if (currentIndex >= fullText.length) {
      isTyping.value = false;
      timeoutId = null;
      options.onComplete?.();
      return;
    }
    displayText.value = fullText.slice(0, ++currentIndex);
    options.onUpdate?.(displayText.value);
    if (isTyping.value) {
      timeoutId = setTimeout(typeWithTimeout, speed);
    }
  }

  function startTyping() {
    if (typeof document !== "undefined" && document.hidden) {
      typeWithTimeout();
      return;
    }

    let lastTime = 0;
    function type(timestamp: number) {
      if (!lastTime) lastTime = timestamp;
      if (timestamp - lastTime >= speed) {
        lastTime = timestamp;
        if (currentIndex >= fullText.length) {
          isTyping.value = false;
          rafId = null;
          options.onComplete?.();
          return;
        }
        displayText.value = fullText.slice(0, ++currentIndex);
        options.onUpdate?.(displayText.value);
      }
      if (isTyping.value) {
        rafId = requestAnimationFrame(type);
      }
    }

    rafId = requestAnimationFrame(type);
  }

  function append(text: string) {
    fullText += text;
    if (!isTyping.value) {
      isTyping.value = true;
      startTyping();
    }
  }

  function reset() {
    clearScheduledWork();
    fullText = "";
    currentIndex = 0;
    displayText.value = "";
    isTyping.value = false;
  }

  function flush() {
    clearScheduledWork();
    displayText.value = fullText;
    currentIndex = fullText.length;
    isTyping.value = false;
    options.onUpdate?.(displayText.value);
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
