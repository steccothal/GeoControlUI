import { createApp } from "vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./assets/styles.css";
import App from "./App.vue";
import router from "@router/index";

createApp(App).use(router).mount("#app");
