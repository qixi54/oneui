import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import Modal from "../components/overlay/Modal.vue";
import Drawer from "../components/overlay/Drawer.vue";
import SidePanel from "../components/overlay/SidePanel.vue";

function runOverlayEscapeCase(
  Component: typeof Modal | typeof Drawer | typeof SidePanel,
  options: { props?: Record<string, unknown> } = {},
) {
  const Host = defineComponent({
    components: { Component },
    setup() {
      const open = ref(true);
      const props = () => options.props ?? {};
      return { open, props };
    },
    template: `
      <Component v-model="open" v-bind="props()">
        <div>overlay body</div>
      </Component>
    `,
  });

  return mount(Host, {
    attachTo: document.body,
  });
}

function runSidePanelCase(options: { props?: Record<string, unknown>; slots?: string } = {}) {
  const Host = defineComponent({
    components: { SidePanel },
    setup() {
      const open = ref(true);
      const props = () => options.props ?? {};
      return { open, props };
    },
    template: `
      <SidePanel v-model="open" v-bind="props()">
        ${options.slots ?? "<div>overlay body</div>"}
      </SidePanel>
    `,
  });

  return mount(Host, {
    attachTo: document.body,
  });
}

describe("Overlay", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.body.style.overflow = "";
  });

  it.each([
    ["Modal", Modal, { title: "标题" }],
    ["Drawer", Drawer, { title: "标题" }],
    ["SidePanel", SidePanel, { title: "标题" }],
  ])("%s 会在打开时锁定 body，按 ESC 关闭并恢复 body", async (_, Component, props) => {
    const wrapper = runOverlayEscapeCase(Component, { props });

    await nextTick();
    expect(document.body.style.overflow).toBe("hidden");

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();

    expect((wrapper.vm as { open: boolean }).open).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("SidePanel 在 lockScroll=false 时不会锁定 body，按 ESC 后保持可恢复", async () => {
    const wrapper = runSidePanelCase({
      props: { title: "标题", lockScroll: false },
    });

    await nextTick();
    expect(document.body.style.overflow).toBe("");

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();

    expect((wrapper.vm as { open: boolean }).open).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("SidePanel 在 trapFocus=false 时不会抢占外部焦点", async () => {
    const outside = document.createElement("button");
    outside.type = "button";
    outside.textContent = "outside";
    document.body.appendChild(outside);
    outside.focus();

    const wrapper = runSidePanelCase({
      props: { title: "标题", trapFocus: false },
      slots: `<button type="button">inside</button>`,
    });

    await nextTick();
    await nextTick();

    expect(document.activeElement).toBe(outside);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();

    expect((wrapper.vm as { open: boolean }).open).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });
});
