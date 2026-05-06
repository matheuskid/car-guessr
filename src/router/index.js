import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FreePlayView from '../views/FreePlayView.vue'

// Placeholder views for other modes
const EasyView = () => import('../views/EasyView.vue')
const MediumView = () => import('../views/MediumView.vue')
const HardView = () => import('../views/HardView.vue')
const DailyView = () => import('../views/DailyView.vue')

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/free-play',
      name: 'free-play',
      component: FreePlayView
    },
    {
      path: '/easy',
      name: 'easy',
      component: EasyView
    },
    {
      path: '/medium',
      name: 'medium',
      component: MediumView
    },
    {
      path: '/hard',
      name: 'hard',
      component: HardView
    },
    {
      path: '/daily',
      name: 'daily',
      component: DailyView
    }
  ]
})

export default router
