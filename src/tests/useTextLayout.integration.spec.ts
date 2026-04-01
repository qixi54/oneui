import { afterEach, describe, expect, it, vi } from "vitest";

const {
  prepareMock,
  layoutMock,
  clearCacheMock,
  setLocaleMock,
} = vi.hoisted(() => ({
  prepareMock: vi.fn(),
  layoutMock: vi.fn(),
  clearCacheMock: vi.fn(),
  setLocaleMock: vi.fn(),
}));

vi.mock("@chenglou/pretext", () => ({
  prepare: prepareMock,
  layout: layoutMock,
  clearCache: clearCacheMock,
  setLocale: setLocaleMock,
}));

import {
  clearTextLayoutCache,
  measureTextBlock,
  setTextLayoutLocale,
} from "../composables/useTextLayout";

describe("useTextLayout", () => {
  afterEach(() => {
    prepareMock.mockReset();
    layoutMock.mockReset();
    clearCacheMock.mockReset();
    setLocaleMock.mockReset();
  });

  it("reuses prepared text cache for the same text/font/whitespace tuple", () => {
    prepareMock.mockReturnValue({ prepared: true });
    layoutMock.mockReturnValue({ height: 48, lineCount: 2 });

    const first = measureTextBlock({
      text: "hello world",
      font: '16px "Helvetica Neue"',
      maxWidth: 240,
      lineHeight: 24,
    });
    const second = measureTextBlock({
      text: "hello world",
      font: '16px "Helvetica Neue"',
      maxWidth: 240,
      lineHeight: 24,
    });

    expect(first.height).toBe(48);
    expect(second.height).toBe(48);
    expect(prepareMock).toHaveBeenCalledTimes(1);
    expect(layoutMock).toHaveBeenCalledTimes(2);
  });

  it("adds chrome height and min height on top of measured content", () => {
    prepareMock.mockReturnValue({ prepared: true });
    layoutMock.mockReturnValue({ height: 40, lineCount: 2 });

    const result = measureTextBlock({
      text: "AI message",
      font: "14px Inter",
      maxWidth: 180,
      lineHeight: 20,
      chromeHeight: 36,
      minHeight: 90,
    });

    expect(result.contentHeight).toBe(40);
    expect(result.lineCount).toBe(2);
    expect(result.height).toBe(90);
    expect(result.isApproximate).toBe(false);
  });

  it("falls back to approximate measurement when pretext throws", () => {
    prepareMock.mockImplementation(() => {
      throw new Error("canvas unavailable");
    });

    const result = measureTextBlock({
      text: "中英 mixed emoji 🚀 text",
      font: "16px Inter",
      maxWidth: 100,
      lineHeight: 22,
    });

    expect(result.height).toBeGreaterThanOrEqual(22);
    expect(result.lineCount).toBeGreaterThanOrEqual(1);
    expect(result.isApproximate).toBe(true);
  });

  it("clears local cache and forwards locale/cache resets to pretext", () => {
    prepareMock.mockReturnValue({ prepared: true });
    layoutMock.mockReturnValue({ height: 20, lineCount: 1 });

    measureTextBlock({
      text: "cached",
      font: "16px Inter",
      maxWidth: 120,
      lineHeight: 20,
    });
    clearTextLayoutCache();
    setTextLayoutLocale("zh-CN");
    measureTextBlock({
      text: "cached",
      font: "16px Inter",
      maxWidth: 120,
      lineHeight: 20,
    });

    expect(clearCacheMock).toHaveBeenCalledTimes(1);
    expect(setLocaleMock).toHaveBeenCalledWith("zh-CN");
    expect(prepareMock).toHaveBeenCalledTimes(2);
  });
});
