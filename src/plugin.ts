import type { App } from "vue";
import {
  pluginComponentNames,
  pluginComponentRegistry,
  registerOneUIComponents,
} from "./registry/plugin-components";

export { pluginComponentNames, pluginComponentRegistry, registerOneUIComponents };

const installedApps = new WeakSet<App>();

export const OneflowUI = {
  install(app: App) {
    if (installedApps.has(app)) {
      return;
    }
    installedApps.add(app);
    registerOneUIComponents(app);
  },
};

export default OneflowUI;

import "./styles/variables.css";
import "./styles/themes/neutral.css";
import "./styles/themes/ops-console.css";
import "./styles/markdown.css";
