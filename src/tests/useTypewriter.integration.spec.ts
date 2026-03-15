import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useTypewriter } from "../composables/useTypewriter";

describe("useTypewriter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock requestAnimationFrame to use setTimeout(cb, 16) for testability
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((cb) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation((id) => {
      clearTimeout(id);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("append 后 isTyping 变为 true", () => {
    const tw = useTypewriter({ speed: 10 });

    expect(tw.isTyping.value).toBe(false);
    tw.append("hello");
    expect(tw.isTyping.value).toBe(true);
  });

  it("flush 立即显示全部文本并停止 typing", () => {
    const tw = useTypewriter({ speed: 10 });

    tw.append("hello world");
    tw.flush();

    expect(tw.displayText.value).toBe("hello world");
    expect(tw.isTyping.value).toBe(false);
  });

  it("reset 清空所有状态", () => {
    const tw = useTypewriter({ speed: 10 });

    tw.append("hello");
    tw.flush();
    tw.reset();

    expect(tw.displayText.value).toBe("");
    expect(tw.isTyping.value).toBe(false);
  });

  it("onUpdate 回调在文本更新时被调用", () => {
    const onUpdate = vi.fn();
    const tw = useTypewriter({ speed: 10, onUpdate });

    tw.append("hi");
    tw.flush();

    expect(onUpdate).toHaveBeenCalledWith("hi");
  });

  it("onComplete 回调在打字完成后被调用", () => {
    const onComplete = vi.fn();
    const tw = useTypewriter({ speed: 10, onComplete });

    tw.append("ab");
    tw.flush();

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("多次 append 文本累积", () => {
    const tw = useTypewriter({ speed: 10 });

    tw.append("hello ");
    tw.append("world");
    tw.flush();

    expect(tw.displayText.value).toBe("hello world");
  });
});
