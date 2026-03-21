import { defineAsyncComponent, type Component } from "vue";

const iconCache = new Map<string, Component | undefined>();
let iconRegistryPromise: Promise<typeof import("./iconRegistry")> | null = null;

function toPascalCase(name: string): string {
  return (
    name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("") + "Icon"
  );
}

function toRegistryKey(name: string): string {
  if (!name) return "";
  if (name.endsWith("Icon")) return name;
  if (name.includes("-")) return toPascalCase(name);
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}Icon`;
}

function loadIconRegistry() {
  iconRegistryPromise ??= import("./iconRegistry");
  return iconRegistryPromise;
}

function createAsyncIcon(loaderKey: string): Component {
  return defineAsyncComponent({
    loader: async () => {
      const { getIconLoader } = await loadIconRegistry();
      const loader = getIconLoader(loaderKey);
      if (!loader) {
        throw new Error(`Unknown icon loader: ${loaderKey}`);
      }
      const mod = await loader();
      return mod.default;
    },
    suspensible: false,
  });
}

export function resolveIcon(icon: string | Component | undefined): Component | undefined {
  if (!icon) return undefined;
  if (typeof icon !== "string") return icon;

  if (iconCache.has(icon)) return iconCache.get(icon);

  const key = toRegistryKey(icon);
  const resolved = key ? createAsyncIcon(key) : undefined;
  iconCache.set(icon, resolved);
  return resolved;
}
