import { createApp } from "vue";
import OneflowUI from "../plugin";
import App from "./App.vue";
import "../styles/markdown.css";

document.documentElement.dataset.ofTheme = "neutral";

const app = createApp(App);
app.use(OneflowUI);
app.mount("#app");
