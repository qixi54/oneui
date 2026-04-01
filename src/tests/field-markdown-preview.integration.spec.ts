import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import FieldMarkdownPreview from "../components/field/FieldMarkdownPreview.vue";

const originalClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");
const originalScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight");
const originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
const originalScrollWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollWidth");
const originalResizeObserver = globalThis.ResizeObserver;

class TestResizeObserver {
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: { width: 240, height: 80, x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0 },
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    );
  }

  disconnect() {}

  unobserve() {}
}

function installLayoutMetrics() {
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get() {
      if (!(this instanceof HTMLElement)) return 0;
      if (this.classList.contains("of-field-md-preview__text")) return 48;
      return 0;
    },
  });

  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get() {
      if (!(this instanceof HTMLElement)) return 0;
      if (!this.classList.contains("of-field-md-preview__text")) return 0;
      const textLength = (this.textContent ?? "").trim().length;
      return textLength > 40 ? 96 : 24;
    },
  });

  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() {
      if (!(this instanceof HTMLElement)) return 0;
      if (this.classList.contains("of-field-md-preview__text")) return 240;
      return 0;
    },
  });

  Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
    configurable: true,
    get() {
      if (!(this instanceof HTMLElement)) return 0;
      if (!this.classList.contains("of-field-md-preview__text")) return 0;
      return 240;
    },
  });
}

describe("FieldMarkdownPreview", () => {
  beforeEach(() => {
    globalThis.ResizeObserver = TestResizeObserver as unknown as typeof ResizeObserver;
    installLayoutMetrics();
  });

  afterEach(() => {
    if (originalClientHeight) Object.defineProperty(HTMLElement.prototype, "clientHeight", originalClientHeight);
    if (originalScrollHeight) Object.defineProperty(HTMLElement.prototype, "scrollHeight", originalScrollHeight);
    if (originalClientWidth) Object.defineProperty(HTMLElement.prototype, "clientWidth", originalClientWidth);
    if (originalScrollWidth) Object.defineProperty(HTMLElement.prototype, "scrollWidth", originalScrollWidth);
    globalThis.ResizeObserver = originalResizeObserver;
  });

  it("shows truncation based on measured overflow even when the content length is below the old threshold", async () => {
    const wrapper = mount(FieldMarkdownPreview, {
      props: {
        content: "A".repeat(50),
        maxLines: 2,
      },
    });

    await nextTick();
    await nextTick();

    expect(wrapper.find(".of-field-md-preview__text").text()).toBe("A".repeat(50));
    expect(wrapper.find(".of-field-md-preview__more").exists()).toBe(true);

    wrapper.unmount();
  });

  it("keeps expanded markdown rendering intact", async () => {
    const wrapper = mount(FieldMarkdownPreview, {
      props: {
        content: "**Bold** and [link](https://example.com)",
        expanded: true,
      },
    });

    await nextTick();

    expect(wrapper.find(".of-field-md-preview__more").exists()).toBe(false);
    expect(wrapper.html()).toContain("<strong>Bold</strong>");
    expect(wrapper.html()).toContain("link");

    wrapper.unmount();
  });
});
