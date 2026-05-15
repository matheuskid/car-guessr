<script setup>
import { ref } from 'vue'
import { useI18n } from '../i18n/useI18n.js'
import VehicleTechnicalInfo from './VehicleTechnicalInfo.vue'

const { t } = useI18n()

const props = defineProps({
  matchScore: {
    type: Number,
    required: true
  },
  roundResults: {
    type: Array,
    required: true
  },
  bestScore: {
    type: Number,
    default: 0
  },
  maxPointsPerRound: {
    type: Number,
    default: 1000
  },
  totalRounds: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['play-again', 'back-to-menu'])

const isNewBest = props.matchScore > 0 && props.matchScore >= props.bestScore
const maxPossible = props.maxPointsPerRound * props.totalRounds
const scorePercent = Math.round((props.matchScore / maxPossible) * 100)

const currentSlide = ref(0)

const nextSlide = () => {
  if (currentSlide.value < props.roundResults.length - 1) {
    currentSlide.value++
  } else {
    currentSlide.value = 0
  }
}

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  } else {
    currentSlide.value = props.roundResults.length - 1
  }
}

const resolveAsset = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex bg-slate-950/95 backdrop-blur-md animate-fade-in overflow-hidden">
    
    <!-- Left Column: Carousel (Desktop Only) -->
    <div class="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-8">
      <!-- Background glow -->
      <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 pointer-events-none"></div>
      
      <div class="w-full max-w-2xl h-full flex flex-col justify-center relative z-10">
        
        <!-- Carousel Viewport -->
        <div class="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border-2"
             :class="roundResults[currentSlide].victory ? 'border-green-500/30' : 'border-red-500/30'">
          
          <img v-if="roundResults[currentSlide].vehicleImageUrl" 
               :src="resolveAsset(roundResults[currentSlide].vehicleImageUrl)" 
               class="w-full h-full object-cover transition-opacity duration-300" />
          
          <!-- Round Badge overlay -->
          <div class="absolute top-4 left-4 z-20">
            <div class="px-4 py-1.5 rounded-full flex items-center justify-center text-xs font-black tracking-widest uppercase"
                :class="roundResults[currentSlide].victory ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'">
                Round {{ currentSlide + 1 }}
            </div>
          </div>
          
          <div class="absolute top-4 right-4 z-20">
            <div class="px-3 py-1.5 rounded-full flex items-center justify-center text-xs font-black backdrop-blur-md bg-black/50 text-white border border-white/20">
                {{ roundResults[currentSlide].score }} pts
            </div>
          </div>

          <!-- Navigation Controls -->
          <button @click="prevSlide" class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 backdrop-blur-sm transition-all border border-white/20 hover:scale-110 z-20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <button @click="nextSlide" class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 backdrop-blur-sm transition-all border border-white/20 hover:scale-110 z-20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        <!-- Dot Indicators -->
        <div class="flex justify-center gap-2 mt-4 mb-2">
          <button v-for="(_, index) in roundResults" :key="index" @click="currentSlide = index"
            class="w-2.5 h-2.5 rounded-full transition-all"
            :class="currentSlide === index ? 'bg-blue-500 w-8' : 'bg-white/30 hover:bg-white/50'">
          </button>
        </div>

        <!-- Technical Info -->
        <div class="w-full">
          <VehicleTechnicalInfo 
            v-if="roundResults[currentSlide].vehicle"
            :vehicle="roundResults[currentSlide].vehicle" 
            :is-visible="true" 
          />
        </div>

      </div>
    </div>

    <!-- Right Column: Content -->
    <div class="w-full lg:w-[450px] xl:w-[500px] flex flex-col p-8 overflow-y-auto bg-slate-900/80 lg:backdrop-blur-none border-l border-white/5 relative z-10 shadow-2xl shrink-0">
      <div class="my-auto">
        <!-- Title -->
        <div class="text-center mb-8">
          <h2 class="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white mb-2 drop-shadow-lg">
            {{ t('match.matchComplete') }}
          </h2>
          <div v-if="isNewBest" class="inline-block px-4 py-1 bg-amber-500 text-black text-xs font-black uppercase rounded-full tracking-widest animate-bounce-in">
            🏆 {{ t('match.newBestScore') }}
          </div>
        </div>

        <!-- Score Circle -->
        <div class="flex justify-center mb-10">
          <div class="relative w-48 h-48">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" stroke-width="8" class="text-white/10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="url(#scoreGradient)" stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="`${scorePercent * 3.267} 326.7`"
                class="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#3b82f6" />
                  <stop offset="100%" stop-color="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-5xl font-black text-white">{{ matchScore }}</span>
              <span class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{{ t('match.pts') }}</span>
            </div>
          </div>
        </div>

        <!-- Round Summary List -->
        <div class="mb-10">
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">{{ t('match.roundSummary') }}</h3>
          <div class="space-y-2">
            <div
              v-for="(round, i) in roundResults"
              :key="i"
              @click="currentSlide = i"
              class="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              :class="{ 'border-blue-500/50 bg-blue-500/10': currentSlide === i }"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  :class="round.victory ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'">
                  {{ i + 1 }}
                </div>
                <div>
                  <div class="text-sm font-bold text-white">{{ round.vehicleMake }} {{ round.vehicleModel }}</div>
                  <div class="text-[10px] uppercase font-bold tracking-wider"
                    :class="round.victory ? 'text-green-400' : 'text-red-400'">
                    {{ round.victory ? t('match.correct') : t('match.missed') }}
                    <span class="text-slate-500 ml-1">· {{ round.guessCount }} {{ round.guessCount === 1 ? 'guess' : 'guesses' }}</span>
                  </div>
                </div>
              </div>
              <div class="text-lg font-black" :class="round.score > 0 ? 'text-blue-400' : 'text-slate-600'">
                {{ round.score }}
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-3">
          <button @click="emit('play-again')"
            class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 text-lg uppercase tracking-wider">
            {{ t('match.playAgain') }}
          </button>
          <router-link to="/"
            class="w-full py-4 bg-transparent border-2 border-white/20 text-slate-300 font-bold rounded-xl hover:bg-white/10 transition-colors text-lg text-center uppercase tracking-wider">
            {{ t('match.backToMenu') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.4s ease-out;
}

@keyframes bounce-in {
  0% { transform: scale(0); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
.animate-bounce-in {
  animation: bounce-in 0.5s ease-out 0.3s both;
}
</style>
