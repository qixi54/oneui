import { createApp } from "vue";
import OneflowUI from "../index";
import App from "./App.vue";
import "../styles/markdown.css";

const app = createApp(App);
app.use(OneflowUI);
app.mount("#app");
