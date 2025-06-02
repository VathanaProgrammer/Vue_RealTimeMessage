import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css';
// Font Awesome core
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faComment } from '@fortawesome/free-solid-svg-icons' // The message icon

// Import specific icons you need
import { faXmark } from '@fortawesome/free-solid-svg-icons'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Add icons to the library
library.add(faXmark, faComment);

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)


const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(pinia)
// Register the component globally
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')