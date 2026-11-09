import { createApp } from 'vue'
import App from './App.vue'
import AdminApp from './AdminApp.vue'
import adminStylesUrl from './admin.css?url'
import siteStylesUrl from './style.css?url'

const isAdmin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')

const stylesheet = document.createElement('link')
stylesheet.rel = 'stylesheet'
stylesheet.href = isAdmin ? adminStylesUrl : siteStylesUrl
document.head.appendChild(stylesheet)

const app = createApp(isAdmin ? AdminApp : App)

app.mount('#app')
