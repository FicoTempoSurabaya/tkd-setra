/**
 * Frontend Entry Point
 * Sumber: SSoT/00_stack_technology.md (Vue 3, Pinia, Vue Router)
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/index.js';
import './assets/main.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');