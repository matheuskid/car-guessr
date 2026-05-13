<script setup>
import { ref, onMounted } from 'vue'
import GameView from './GameView.vue'
import VehicleTechnicalInfo from '../components/VehicleTechnicalInfo.vue'
import dailyData from '../data/daily_challenges.json'
import { useI18n } from '../i18n/useI18n.js'

const { t } = useI18n()

const dailyChallenge = ref(null)
const isLoading = ref(true)
const error = ref(null)
const completedToday = ref(false)
const gameResults = ref(null)

const todayStr = new Date().toISOString().split('T')[0]
const storageKey = `car-guessr-daily-${todayStr}`

const fetchDailyChallenge = () => {
  try {
    isLoading.value = true
    
    // Find challenge for today
    const challenge = dailyData.find(c => c.date === todayStr)
    
    if (!challenge) {
      throw new Error(t('daily.noChallenge', { date: todayStr }))
    }
    
    dailyChallenge.value = challenge
    
    // Check if already completed
    const savedData = localStorage.getItem(storageKey)
    if (savedData) {
      gameResults.value = JSON.parse(savedData)
      completedToday.value = true
    }
  } catch (err) {
    console.error('Error loading daily challenge:', err)
    error.value = err.message || t('daily.loadError')
  } finally {
    isLoading.value = false
  }
}

const handleGameOver = (results) => {
  gameResults.value = results
  completedToday.value = true
  localStorage.setItem(storageKey, JSON.stringify(results))
}

onMounted(() => {
  fetchDailyChallenge()
})
</script>

<template>
  <div v-if="isLoading" class="flex-1 flex items-center justify-center bg-slate-900 text-white">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
  </div>

  <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center bg-slate-900 text-white p-6">
    <div class="max-w-md w-full text-center space-y-6">
      <h2 class="text-3xl font-black uppercase text-red-500">{{ t('daily.error') }}</h2>
      <p class="text-slate-400">{{ error }}</p>
      <router-link to="/" class="inline-block px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-blue-500 transition-all">
        {{ t('daily.backToMenu') }}
      </router-link>
    </div>
  </div>

  <template v-else>
    <!-- Game Mode -->
    <GameView 
      v-if="!completedToday" 
      :target-vehicle="dailyChallenge.vehicle" 
      :is-daily="true"
      @game-over="handleGameOver"
    />

    <!-- Result Mode -->
    <div v-else class="flex-1 flex flex-col items-center justify-center bg-slate-900 text-white p-6 overflow-y-auto">
      <div class="max-w-2xl w-full space-y-8 py-12">
        <div class="text-center space-y-2">
          <h2 class="text-5xl font-black uppercase tracking-tighter" :class="gameResults.victory ? 'text-green-500' : 'text-red-500'">
            {{ gameResults.victory ? t('daily.challengeComplete') : t('daily.gameOver') }}
          </h2>
          <p class="text-slate-400 text-lg">{{ t('daily.completedToday', { date: todayStr }) }}</p>
        </div>

        <div class="bg-slate-800/50 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div class="flex flex-col md:flex-row gap-8 items-center">
            <div class="w-full md:w-1/2 aspect-video rounded-xl overflow-hidden shadow-lg border border-white/5">
              <img :src="dailyChallenge.vehicle.imageUrl.url" class="w-full h-full object-cover" :alt="t('daily.carOfTheDay')">
            </div>
            <div class="w-full md:w-1/2 space-y-4">
              <div class="inline-block px-3 py-1 bg-amber-500 text-black text-[10px] font-black uppercase rounded-full tracking-widest mb-2">
                {{ t('daily.vehicleOfTheDay') }}
              </div>
              <h3 class="text-3xl font-bold leading-tight">
                {{ dailyChallenge.vehicle.make }} {{ dailyChallenge.vehicle.model }}
              </h3>
              <p v-if="dailyChallenge.description" class="text-slate-300 leading-relaxed italic border-l-4 border-amber-500 pl-4 py-1">
                "{{ dailyChallenge.description }}"
              </p>
              <p v-else class="text-slate-400 leading-relaxed">
                {{ t('daily.defaultDescription') }}
              </p>
              
              <div class="pt-4 flex gap-4">
                <div class="flex-1 bg-white/5 rounded-xl p-3 text-center">
                  <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{{ t('daily.attempts') }}</div>
                  <div class="text-2xl font-black">{{ gameResults.guesses.length }}</div>
                </div>
                <div class="flex-1 bg-white/5 rounded-xl p-3 text-center">
                  <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{{ t('daily.result') }}</div>
                  <div class="text-xl font-black" :class="gameResults.victory ? 'text-green-500' : 'text-red-500'">
                    {{ gameResults.victory ? t('daily.victory') : t('daily.defeat') }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 border-t border-white/10 pt-8">
            <VehicleTechnicalInfo :vehicle="dailyChallenge.vehicle" :is-visible="true" />
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/" class="px-8 py-4 bg-white text-slate-900 font-black rounded-xl hover:bg-blue-500 hover:text-white transition-all uppercase tracking-wider text-sm text-center">
            {{ t('daily.backToMenu') }}
          </router-link>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
/* Custom animations if needed */
</style>
