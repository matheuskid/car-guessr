<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../i18n/useI18n.js'
import { allVehicles } from '../utils/vehicleData.js'

const router = useRouter()
const { t } = useI18n()

// Compute live stats from data
const stats = computed(() => {
  const makes = new Set(allVehicles.map(v => v.make))
  const countries = new Set(allVehicles.filter(v => v.country).map(v => v.country))
  return {
    vehicles: allVehicles.length,
    brands: makes.size,
    countries: countries.size
  }
})

const goTo = (path) => router.push(path)
</script>

<template>
  <div class="bg-slate-950 text-white overflow-x-hidden">

    <!-- ═══════════════════════════════════════════ -->
    <!-- HERO SECTION                               -->
    <!-- ═══════════════════════════════════════════ -->
    <section class="relative min-h-[100vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      <!-- Animated background -->
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-b from-blue-950/80 via-slate-950 to-slate-950"></div>
        <!-- Animated grid lines -->
        <div class="absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px); background-size: 60px 60px;"></div>
        <!-- Glow orbs -->
        <div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" style="animation-delay: 1s;"></div>
      </div>

      <div class="relative z-10 max-w-3xl mx-auto">
        <!-- Logo -->
        <h1 class="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-4 drop-shadow-2xl">
          Car<span class="text-blue-500">Guessr</span>
        </h1>

        <!-- Tagline -->
        <p class="text-lg sm:text-xl md:text-2xl font-semibold text-blue-400 mb-6 tracking-wide">
          {{ t('home.tagline') }}
        </p>

        <!-- Description -->
        <p class="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed mb-10">
          {{ t('home.heroDescription') }}
        </p>
    <!-- ═══════════════════════════════════════════ -->
    <!-- GAME MODES                                 -->
    <!-- ═══════════════════════════════════════════ -->

        <!-- Primary Modes: Daily + Free Play (big buttons) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <!-- Daily Challenge -->
          <button @click="goTo('/daily')"
                  class="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                         bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40">
            <div class="absolute top-3 right-3 bg-black/20 backdrop-blur-sm text-[10px] font-black text-white/90 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {{ t('home.dailyBadge') }}
            </div>
            <div class="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-2">{{ t('home.dailyLabel') }}</div>
            <div class="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              {{ t('home.daily') }}
              <span class="text-xl transition-transform duration-300 group-hover:translate-x-1">▶</span>
            </div>
          </button>

          <!-- Free Play -->
          <button @click="goTo('/free-play')"
                  class="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                         bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40">
            <div class="absolute top-3 right-3 bg-black/20 backdrop-blur-sm text-[10px] font-black text-white/90 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {{ t('home.freePlayBadge') }}
            </div>
            <div class="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-2">{{ t('home.freePlayLabel') }}</div>
            <div class="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              {{ t('home.freePlay') }}
              <span class="text-xl transition-transform duration-300 group-hover:translate-x-1">▶</span>
            </div>
          </button>
        </div>

        <!-- Secondary Modes: Difficulty levels -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Easy -->
          <button @click="goTo('/easy')"
                  class="group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                         bg-gradient-to-r from-emerald-600 to-green-500 shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/30">
            <div class="text-2xl font-black text-white flex items-center justify-between">
              {{ t('home.easy') }}
              <span class="text-base opacity-60 transition-transform duration-300 group-hover:translate-x-1">▶</span>
            </div>
            <p class="text-xs text-white/70 mt-1.5 leading-snug">{{ t('home.easyDesc') }}</p>
          </button>

          <!-- Medium -->
          <button @click="goTo('/medium')"
                  class="group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                         bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-400/15 hover:shadow-blue-400/30">
            <div class="text-2xl font-black text-white flex items-center justify-between">
              {{ t('home.medium') }}
              <span class="text-base opacity-60 transition-transform duration-300 group-hover:translate-x-1">▶</span>
            </div>
            <p class="text-xs text-white/70 mt-1.5 leading-snug">{{ t('home.mediumDesc') }}</p>
          </button>

          <!-- Hard -->
          <button @click="goTo('/hard')"
                  class="group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                         bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg shadow-purple-500/15 hover:shadow-purple-500/30">
            <div class="text-2xl font-black text-white flex items-center justify-between">
              {{ t('home.hard') }}
              <span class="text-base opacity-60 transition-transform duration-300 group-hover:translate-x-1">▶</span>
            </div>
            <p class="text-xs text-white/70 mt-1.5 leading-snug">{{ t('home.hardDesc') }}</p>
          </button>
        </div>
      </div>
    </section>
    

    <!-- ═══════════════════════════════════════════ -->
    <!-- FOOTER                                     -->
    <!-- ═══════════════════════════════════════════ -->
    <footer class="border-t border-white/5 py-10 px-6">
      <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="text-lg font-black tracking-tight">Car<span class="text-blue-500">Guessr</span></span>
        </div>
        <!-- <p class="text-sm text-slate-500">
          {{ t('home.madeWith') }} ❤️ {{ t('home.forCarLovers') }}
        </p> -->
      </div>
    </footer>

  </div>
</template>
