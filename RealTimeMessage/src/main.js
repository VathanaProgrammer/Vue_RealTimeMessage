import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css' // or main.css — wherever you put the Tailwind directives


const app = createApp(App)
app.use(router)
app.mount('#app')