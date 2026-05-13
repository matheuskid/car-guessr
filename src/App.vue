<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ThemeToggle from './components/ThemeToggle.vue'
import LanguageToggle from './components/LanguageToggle.vue'

const route = useRoute()
const router = useRouter()

const isHome = computed(() => route.path === '/')

const returnToMenu = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900 transition-colors duration-300 font-sans"
       :class="{ 'lg:h-screen lg:overflow-hidden': !isHome }">
    <!-- Header -->
    <header class="w-full h-16 flex justify-between items-center px-6 bg-white dark:bg-slate-950 shadow-sm z-20 shrink-0">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 cursor-pointer" @click="returnToMenu">
          <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Car<span class="text-blue-500">Guessr</span>
          </h1>
        </div>
        
        <!-- Navigation: Back to Menu (Desktop) -->
        <button v-if="!isHome" 
                @click="returnToMenu" 
                class="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-all uppercase tracking-wider border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Menu
        </button>
      </div>

      <div class="flex items-center gap-4">
        <!-- Navigation: Back to Menu (Mobile) -->
        <button v-if="!isHome" 
                @click="returnToMenu" 
                class="md:hidden p-2 text-slate-500 hover:text-blue-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </header>

    <!-- Page Content -->
    <RouterView />
  </div>
</template>
