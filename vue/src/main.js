import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Impor CSS dari Bootstrap dan Bootstrap Icons
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Impor CSS kustom
import './assets/main.css'

const app = createApp(App)

app.use(router)

app.mount('#app')

// Impor JS Bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js'