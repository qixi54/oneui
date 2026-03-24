import { mount } from "@vue/test-utils";
import { ref } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";

import Navbar from "../components/layout/Navbar.vue";

function mountNavbar(options: Parameters<typeof mount>[1] = {}) {
  return mount(Navbar, {
    global: {
      provide: {
        density: ref("comfortable"),
      },
    },
    ...options,
  });
}

describe("Navbar", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("在未传入新 slot 时保持原有结构和默认布局", () => {
    const wrapper = mountNavbar({
      props: {
        username: "Ada",
        searchPlaceholder: "搜索内容",
        notifyCount: 3,
      },
    });

    const nav = wrapper.element as HTMLElement;
    const children = Array.from(nav.children).map((child) => (child as HTMLElement).className);

    expect(children).toEqual(["of-navbar__left", "of-navbar__center", "of-navbar__right"]);
    expect(wrapper.find(".of-navbar__header").exists()).toBe(false);
    expect(wrapper.get(".of-navbar__logo-default").text()).toBe("OneFlow");
    expect(wrapper.get(".of-navbar__search-input").attributes("placeholder")).toBe("搜索内容");
    expect(wrapper.get(".of-navbar__notify-badge").text()).toBe("3");
    expect(wrapper.get(".of-navbar__avatar").text()).toBe("A");
  });

  it("会按 logo | header-left | search | header-right | notify+avatar 的顺序渲染 slot", () => {
    const wrapper = mountNavbar({
      props: {
        username: "Ada",
      },
      slots: {
        logo: '<span class="logo-slot">Logo</span>',
        "header-left": '<span class="header-left-slot">Left</span>',
        "header-right": '<span class="header-right-slot">Right</span>',
      },
    });

    const left = wrapper.get(".of-navbar__left").element as HTMLElement;
    const center = wrapper.get(".of-navbar__center").element as HTMLElement;
    const right = wrapper.get(".of-navbar__right").element as HTMLElement;

    expect(Array.from(left.children).map((child) => (child as HTMLElement).className)).toEqual([
      "logo-slot",
      "of-navbar__header of-navbar__header--left",
    ]);
    expect(center.querySelector(".of-navbar__search")).toBeTruthy();
    expect(Array.from(right.children).map((child) => (child as HTMLElement).className)).toEqual([
      "of-navbar__header of-navbar__header--right",
      "of-navbar__notify-btn",
      "of-navbar__avatar",
    ]);
    expect(wrapper.find(".header-left-slot").text()).toBe("Left");
    expect(wrapper.find(".header-right-slot").text()).toBe("Right");
  });

  it("现有事件仍然可以正常触发", async () => {
    const onSearch = vi.fn();
    const onNotifyClick = vi.fn();
    const onAvatarClick = vi.fn();
    const wrapper = mountNavbar({
      props: {
        username: "Ada",
        onSearch,
        onNotifyClick,
        onAvatarClick,
      },
    });

    await wrapper.get(".of-navbar__search-input").setValue("alpha");
    await wrapper.get(".of-navbar__notify-btn").trigger("click");
    await wrapper.get(".of-navbar__avatar").trigger("click");

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("alpha");
    expect(onNotifyClick).toHaveBeenCalledTimes(1);
    expect(onAvatarClick).toHaveBeenCalledTimes(1);
  });
});
