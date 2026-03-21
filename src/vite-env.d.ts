/// <reference types="vite/client" />

declare module "lucide-vue-next/dist/esm/icons/*.js" {
  import type { Component } from "vue";

  const component: Component;
  export default component;
}

declare module "lucide-vue-next/dist/esm/icons/*.js";
