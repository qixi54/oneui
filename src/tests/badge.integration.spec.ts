import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import Badge from "../components/base/Badge.vue";

function readStyleVars(wrapper: ReturnType<typeof mount>) {
  const element = wrapper.element as HTMLElement;
  return {
    bg: element.style.getPropertyValue("--one-badge-bg").trim(),
    color: element.style.getPropertyValue("--one-badge-color").trim(),
    border: element.style.getPropertyValue("--one-badge-border").trim(),
    borderWidth: element.style.getPropertyValue("--one-badge-border-width").trim(),
  };
}

describe("Badge variant", () => {
  it("defaults to outlined visuals and keeps existing priority mapping", () => {
    const wrapper = mount(Badge, {
      props: {
        priority: "P2",
      },
    });

    expect(wrapper.classes()).toContain("one-badge--outlined");
    expect(readStyleVars(wrapper)).toEqual({
      bg: "var(--of-badge-blue-bg)",
      color: "var(--of-badge-blue-text)",
      border: "var(--of-badge-blue-border)",
      borderWidth: "1px",
    });
    expect(wrapper.attributes("style") ?? "").not.toContain("#");
  });

  it("applies solid and subtle variants with token-based styles and no border", () => {
    const solidWrapper = mount(Badge, {
      props: {
        color: "green",
        variant: "solid",
      },
    });
    const subtleWrapper = mount(Badge, {
      props: {
        color: "orange",
        variant: "subtle",
      },
    });

    expect(solidWrapper.classes()).toContain("one-badge--solid");
    expect(readStyleVars(solidWrapper)).toEqual({
      bg: "var(--of-color-green-500)",
      color: "var(--of-color-white)",
      border: "transparent",
      borderWidth: "0px",
    });
    expect(solidWrapper.attributes("style") ?? "").not.toContain("#");

    expect(subtleWrapper.classes()).toContain("one-badge--subtle");
    expect(readStyleVars(subtleWrapper)).toEqual({
      bg: "var(--of-badge-orange-bg)",
      color: "var(--of-badge-orange-text)",
      border: "transparent",
      borderWidth: "0px",
    });
    expect(subtleWrapper.attributes("style") ?? "").not.toContain("#");
  });

  it("keeps priority resolution when combined with non-default variants", () => {
    const solidPriority = mount(Badge, {
      props: {
        priority: "P1",
        variant: "solid",
      },
    });
    const subtlePriority = mount(Badge, {
      props: {
        priority: "P3",
        variant: "subtle",
      },
    });

    expect(solidPriority.classes()).toContain("one-badge--solid");
    expect(readStyleVars(solidPriority)).toEqual({
      bg: "var(--of-color-orange-500)",
      color: "var(--of-color-white)",
      border: "transparent",
      borderWidth: "0px",
    });

    expect(subtlePriority.classes()).toContain("one-badge--subtle");
    expect(readStyleVars(subtlePriority)).toEqual({
      bg: "var(--of-badge-green-bg)",
      color: "var(--of-badge-green-text)",
      border: "transparent",
      borderWidth: "0px",
    });
  });
});
