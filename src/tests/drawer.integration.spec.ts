import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import Drawer from "../components/overlay/Drawer.vue";

describe("Drawer", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.body.style.overflow = "";
  });

  it('渲染时包含 role="dialog" 和 aria-modal="true"', async () => {
    mount(Drawer, {
      attachTo: document.body,
      props: {
        modelValue: true,
        title: "详情",
      },
      slots: {
        default: "drawer body",
      },
    });

    await nextTick();

    const drawer = document.body.querySelector(".of-drawer");
    expect(drawer?.getAttribute("role")).toBe("dialog");
    expect(drawer?.getAttribute("aria-modal")).toBe("true");
  });

  it("modelValue=false 时不渲染内容", async () => {
    mount(Drawer, {
      attachTo: document.body,
      props: {
        modelValue: false,
        title: "隐藏抽屉",
      },
      slots: {
        default: "hidden content",
      },
    });

    await nextTick();

    expect(document.body.querySelector(".of-drawer")).toBeNull();
    expect(document.body.textContent).not.toContain("hidden content");
  });

  it("内容会通过 Teleport 渲染到 body", async () => {
    const wrapper = mount(Drawer, {
      props: {
        modelValue: true,
      },
      slots: {
        default: '<div class="teleported-content">teleported</div>',
      },
    });

    await nextTick();

    expect(wrapper.find(".teleported-content").exists()).toBe(false);
    expect(document.body.querySelector(".teleported-content")?.textContent).toBe("teleported");
  });

  it("ESC 键触发 update:modelValue false 事件", async () => {
    const Host = defineComponent({
      components: { Drawer },
      setup() {
        const open = ref(true);
        return { open };
      },
      template: `
        <Drawer v-model="open">
          <div>drawer body</div>
        </Drawer>
      `,
    });

    const wrapper = mount(Host, {
      attachTo: document.body,
    });

    await nextTick();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();

    expect((wrapper.vm as { open: boolean }).open).toBe(false);
  });
});
