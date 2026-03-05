import * as LucideIcons from "lucide-vue-next";
import type { Component } from "vue";

/**
 * 将 kebab-case 图标名转换为 PascalCase + Icon 后缀
 * 例如: 'trash-2' → 'Trash2Icon'
 */
function toPascalCase(name: string): string {
  return (
    name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("") + "Icon"
  );
}

/**
 * 解析图标：支持 lucide 图标名字符串或直接传入 Vue 组件
 * @param icon lucide icon name (kebab-case) 或 Component
 * @returns Vue Component 或 undefined
 */
export function resolveIcon(icon: string | Component | undefined): Component | undefined {
  if (!icon) return undefined;
  if (typeof icon !== "string") return icon as Component;
  const key = toPascalCase(icon);
  return (LucideIcons as unknown as Record<string, Component>)[key];
}
