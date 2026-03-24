import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";

import FieldDate from "../components/field/FieldDate.vue";
import FieldMultiSelect from "../components/field/FieldMultiSelect.vue";
import FieldRichText from "../components/field/FieldRichText.vue";
import FieldSelect from "../components/field/FieldSelect.vue";
import FieldText from "../components/field/FieldText.vue";

describe("Field standalone mode", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("FieldText standalone supports wrapper UX and v-model commits", async () => {
    const onCommit = vi.fn();
    const onUpdate = vi.fn();
    const wrapper = mount(FieldText, {
      attachTo: document.body,
      props: {
        modelValue: "alpha",
        label: "标题",
        required: true,
        error: "必填",
        "onUpdate:modelValue": onUpdate,
        onCommit,
      },
    });

    expect(wrapper.find(".of-field-standalone").exists()).toBe(true);
    expect(wrapper.find(".of-field-standalone__label").text()).toContain("标题");
    expect(wrapper.find(".of-field-standalone__required").text()).toBe("*");
    expect(wrapper.find(".of-field-standalone__error").text()).toBe("必填");

    const input = wrapper.get("input");
    await input.setValue("beta");
    await input.trigger("blur");

    expect(onCommit).toHaveBeenLastCalledWith("beta");
    expect(onUpdate).toHaveBeenLastCalledWith("beta");
  });

  it("FieldText table mode keeps original DOM path without standalone wrapper", async () => {
    mount(FieldText, {
      attachTo: document.body,
      props: {
        value: "row-value",
        field: {
          id: "title",
          type: "text",
          label: "标题",
        },
      },
    });

    await nextTick();

    expect(document.body.querySelector(".of-field-standalone")).toBeNull();
    expect(document.activeElement?.getAttribute("aria-label")).toBe("标题");
  });

  it("FieldSelect standalone resolves options from props and updates value after selection", async () => {
    const onCommit = vi.fn();
    const onUpdate = vi.fn();
    const wrapper = mount(FieldSelect, {
      attachTo: document.body,
      props: {
        modelValue: "todo",
        label: "状态",
        options: [
          { value: "todo", label: "待处理" },
          { value: "done", label: "已完成", color: "rgb(34, 197, 94)" },
        ],
        "onUpdate:modelValue": onUpdate,
        onCommit,
      },
    });

    expect(document.body.querySelector(".of-field-select__dropdown")).toBeNull();
    await wrapper.get("button.of-field-select").trigger("click");
    await nextTick();
    expect(document.body.querySelector(".of-field-select__dropdown")).toBeTruthy();

    const options = document.body.querySelectorAll(".of-field-select__option");
    (options[2] as HTMLElement).click();
    await nextTick();

    expect(onCommit).toHaveBeenLastCalledWith("done");
    expect(onUpdate).toHaveBeenLastCalledWith("done");
  });

  it("FieldMultiSelect standalone commits selected values through update:modelValue", async () => {
    const onCommit = vi.fn();
    const onUpdate = vi.fn();
    const wrapper = mount(FieldMultiSelect, {
      attachTo: document.body,
      props: {
        modelValue: ["todo"],
        label: "标签",
        options: [
          { value: "todo", label: "待处理" },
          { value: "review", label: "待评审" },
        ],
        "onUpdate:modelValue": onUpdate,
        onCommit,
      },
    });

    await wrapper.get("button.of-field-multiselect").trigger("click");
    await nextTick();

    const options = document.body.querySelectorAll(".of-field-multiselect__option");
    (options[1] as HTMLElement).click();
    await nextTick();
    (document.body.querySelector(".of-field-multiselect__btn--primary") as HTMLElement).click();
    await nextTick();

    expect(onCommit).toHaveBeenLastCalledWith(["todo", "review"]);
    expect(onUpdate).toHaveBeenLastCalledWith(["todo", "review"]);
  });

  it("FieldDate standalone skips auto-focus and syncs model on blur", async () => {
    const onUpdate = vi.fn();
    const wrapper = mount(FieldDate, {
      attachTo: document.body,
      props: {
        modelValue: "2026-03-24",
        label: "截止日期",
        "onUpdate:modelValue": onUpdate,
      },
    });

    await nextTick();
    const input = wrapper.get("input");
    expect(document.activeElement).not.toBe(input.element);

    await input.setValue("2026-03-25");
    await input.trigger("blur");

    expect(onUpdate).toHaveBeenLastCalledWith("2026-03-25");
  });

  it("FieldRichText standalone skips auto-focus and emits v-model updates on blur", async () => {
    const onCommit = vi.fn();
    const onUpdate = vi.fn();
    const wrapper = mount(FieldRichText, {
      attachTo: document.body,
      props: {
        modelValue: "<p>alpha</p>",
        label: "描述",
        "onUpdate:modelValue": onUpdate,
        onCommit,
      },
    });

    await nextTick();
    const editor = wrapper.get(".of-field-richtext-editor");
    expect(document.activeElement).not.toBe(editor.element);

    (editor.element as HTMLDivElement).innerHTML = "<p>beta</p>";
    await editor.trigger("blur");

    expect(onCommit).toHaveBeenLastCalledWith("<p>beta</p>");
    expect(onUpdate).toHaveBeenLastCalledWith("<p>beta</p>");
  });
});
