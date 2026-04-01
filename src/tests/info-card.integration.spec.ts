import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import InfoCard from "../components/base/InfoCard.vue";

function mockOverflowMetrics() {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains("of-info-card__title")) return 120;
    if (this.classList.contains("of-info-card__content")) return 120;
    return 400;
  });

  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains("of-info-card__title")) return 260;
    if (this.classList.contains("of-info-card__content")) return 320;
    return 400;
  });

  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains("of-info-card__content")) return 40;
    return 24;
  });

  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains("of-info-card__content")) return 120;
    return 24;
  });
}

describe("InfoCard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exposes title/content overflow state for long memo content", async () => {
    mockOverflowMetrics();

    const wrapper = mount(InfoCard, {
      props: {
        variant: "memo",
        title: "A very long memo card title that should overflow the single-line title area",
        content:
          "A very long memo summary that should wrap across multiple lines and exceed the clamp height used by the card content area.",
      },
    });

    await nextTick();
    await nextTick();

    expect(wrapper.classes()).toContain("of-info-card--memo");
    expect(wrapper.attributes("data-info-card-title-overflow")).toBe("true");
    expect(wrapper.attributes("data-info-card-content-overflow")).toBe("true");
  });

  it("keeps overflow state false for short titles without content", async () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(320);
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(320);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(24);
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(24);

    const wrapper = mount(InfoCard, {
      props: {
        variant: "notify",
        title: "Short title",
        meta: "通知元信息",
      },
    });

    await nextTick();
    await nextTick();

    expect(wrapper.classes()).toContain("of-info-card--notify");
    expect(wrapper.attributes("data-info-card-title-overflow")).toBe("false");
    expect(wrapper.attributes("data-info-card-content-overflow")).toBe("false");
  });
});
