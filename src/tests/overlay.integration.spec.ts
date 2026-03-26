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
});
