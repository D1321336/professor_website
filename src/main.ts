import { createApp } from 'vue'
import App from './App.vue'
import AdminApp from './AdminApp.vue'

const isAdmin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')

if (isAdmin) import('./admin.css')
else import('./style.css')

const app = createApp(isAdmin ? AdminApp : App)

app.mount('#app')
