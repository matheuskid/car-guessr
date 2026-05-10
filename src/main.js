import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const app = createApp(App)
app.use(router)
app.use(VueVirtualScroller)
app.mount('#app')
