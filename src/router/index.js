import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GameView from '../views/GameView.vue'

// Placeholder views for other modes
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
      component: GameView
    },
    {
      path: '/easy',
      name: 'easy',
      component: GameView,
      props: { difficulty: 1 }
    },
    {
      path: '/medium',
      name: 'medium',
      component: GameView,
      props: { difficulty: 2 }
    },
    {
      path: '/hard',
      name: 'hard',
      component: GameView,
      props: { difficulty: 3 }
    },
    {
      path: '/daily',
      name: 'daily',
      component: DailyView
    }
  ]
})

export default router
