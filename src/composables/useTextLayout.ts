import { clearCache, layout, prepare, setLocale } from "@chenglou/pretext";

export interface MeasureTextBlockOptions {
  text: string;
  font: string;
  maxWidth: number;
  lineHeight: number;
  whiteSpace?: "normal" | "pre-wrap";
  chromeHeight?: number;
  minHeight?: number;
  measureTextWidth?: (text: string) => number;
}

export interface MeasureTextBlockResult {
  height: number;
  contentHeight: number;
  lineCount: number;
  isApproximate: boolean;
}

const preparedCache = new Map<string, ReturnType<typeof prepare>>();

function normalizeWhiteSpace(whiteSpace?: "normal" | "pre-wrap"): "normal" | "pre-wrap" {
  return whiteSpace === "pre-wrap" ? "pre-wrap" : "normal";
}

function normalizeWidth(width: number): number {
  if (!Number.isFinite(width)) return 0;
  return Math.max(0, width);
}

function normalizeLineHeight(lineHeight: number): number {
  if (!Number.isFinite(lineHeight) || lineHeight <= 0) return 20;
  return lineHeight;
}

function normalizeChromeHeight(chromeHeight?: number): number {
  if (!Number.isFinite(chromeHeight)) return 0;
  return Math.max(0, chromeHeight ?? 0);
}

function normalizeMinHeight(minHeight?: number): number {
  if (!Number.isFinite(minHeight)) return 0;
  return Math.max(0, minHeight ?? 0);
}

function getCacheKey(text: string, font: string, whiteSpace: "normal" | "pre-wrap"): string {
  return `${font}::${whiteSpace}::${text}`;
}

function getPreparedText(text: string, font: string, whiteSpace: "normal" | "pre-wrap") {
  const cacheKey = getCacheKey(text, font, whiteSpace);
  const cached = preparedCache.get(cacheKey);
  if (cached) return cached;

  const prepared = prepare(text, font, { whiteSpace });
  preparedCache.set(cacheKey, prepared);
  return prepared;
}

function extractFontSize(font: string): number {
  const matched = font.match(/(\d+(?:\.\d+)?)px/);
  if (!matched) return 16;
  const parsed = Number.parseFloat(matched[1] ?? "16");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 16;
}

function measureFallbackText(
  text: string,
  font: string,
  width: number,
  lineHeight: number,
  measureTextWidth?: (text: string) => number,
) {
  const normalizedWidth = Math.max(width, 1);
  const fontSize = extractFontSize(font);
  const maxUnitsPerLine = Math.max(1, Math.floor(normalizedWidth / Math.max(fontSize * 0.56, 1)));
  const segments = text.split("\n");

  let lineCount = 0;
  for (const segment of segments) {
    if (!segment) {
      lineCount += 1;
      continue;
    }

    let units = 0;
    let currentLineUnits = 0;
    for (const char of segment) {
      const charWidth = measureTextWidth?.(char);
      const charUnits = charWidth != null
        ? Math.max(1, Math.ceil(charWidth / Math.max(fontSize * 0.56, 1)))
        : /[\u0000-\u00ff]/.test(char)
          ? 1
          : 2;
      units += charUnits;
      currentLineUnits += charUnits;
      if (currentLineUnits >= maxUnitsPerLine) {
        lineCount += 1;
        currentLineUnits = 0;
      }
    }

    if (currentLineUnits > 0 || units === 0) {
      lineCount += 1;
    }
  }

  return {
    lineCount: Math.max(1, lineCount),
    height: Math.max(lineHeight, lineCount * lineHeight),
  };
}

export function measureTextBlock(options: MeasureTextBlockOptions): MeasureTextBlockResult {
  const whiteSpace = normalizeWhiteSpace(options.whiteSpace);
  const maxWidth = normalizeWidth(options.maxWidth);
  const lineHeight = normalizeLineHeight(options.lineHeight);
  const chromeHeight = normalizeChromeHeight(options.chromeHeight);
  const minHeight = normalizeMinHeight(options.minHeight);
  const text = options.text ?? "";

  if (maxWidth <= 0) {
    return {
      height: Math.max(minHeight, chromeHeight + lineHeight),
      contentHeight: lineHeight,
      lineCount: 1,
      isApproximate: true,
    };
  }

  try {
    const prepared = getPreparedText(text, options.font, whiteSpace);
    const measured = layout(prepared, maxWidth, lineHeight);
    const contentHeight = Math.max(lineHeight, measured.height);
    return {
      height: Math.max(minHeight, chromeHeight + contentHeight),
      contentHeight,
      lineCount: Math.max(1, measured.lineCount),
      isApproximate: false,
    };
  } catch {
    const fallback = measureFallbackText(
      text,
      options.font,
      maxWidth,
      lineHeight,
      options.measureTextWidth,
    );
    return {
      height: Math.max(minHeight, chromeHeight + fallback.height),
      contentHeight: fallback.height,
      lineCount: fallback.lineCount,
      isApproximate: true,
    };
  }
}

export function clearTextLayoutCache(): void {
  preparedCache.clear();
  clearCache();
}

export function setTextLayoutLocale(locale?: string): void {
  preparedCache.clear();
  setLocale(locale);
}
