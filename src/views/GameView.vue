<script setup>
import { ref, onMounted, watch } from 'vue'
import CarImageReveal from '../components/CarImageReveal.vue'
import GuessInput from '../components/GuessInput.vue'
import GuessGrid from '../components/GuessGrid.vue'
import VehicleTechnicalInfo from '../components/VehicleTechnicalInfo.vue'
import ImageModal from '../components/ImageModal.vue'
import GameStats from '../components/GameStats.vue'
import MatchSummary from '../components/MatchSummary.vue'
import { useI18n } from '../i18n/useI18n.js'
import { useMatch } from '../composables/useMatch.js'

const { t } = useI18n()

const props = defineProps({
  difficulty: {
    type: Number,
    default: null
  },
  targetVehicle: {
    type: Object,
    default: null
  },
  isDaily: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['game-over'])

import { playableVehicles, getVehiclesByDifficulty } from '../utils/vehicleData'

// ── Match system ──
const match = useMatch()

// ── Round-level state ──
const guesses = ref([])
const maxGuesses = match.MAX_GUESSES_PER_ROUND
const isRoundOver = ref(false)
const isVictory = ref(false)
const showImageModal = ref(false)

const resolveAsset = (path) => {
  if (path.startsWith('http')) return path
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}

// ── Start a full match ──
const startMatch = () => {
  const pool = props.difficulty
    ? getVehiclesByDifficulty(props.difficulty)
    : playableVehicles

  match.startMatch(pool, null) // difficulty filtering already done above
  resetRound()
}

// ── Reset round-level state for the current round ──
const resetRound = () => {
  guesses.value = []
  isRoundOver.value = false
  isVictory.value = false
}

// ── Legacy single-round mode (for Daily) ──
const startLegacyGame = () => {
  resetRound()
}

onMounted(() => {
  if (props.isDaily && props.targetVehicle) {
    startLegacyGame()
  } else {
    startMatch()
  }
})

// ── Current target car (from match or daily prop) ──
const currentTargetCar = () => {
  if (props.isDaily && props.targetVehicle) {
    return { ...props.targetVehicle }
  }
  return match.currentVehicle.value
}

const handleGiveUp = () => {
  isRoundOver.value = true
  isVictory.value = false

  if (!props.isDaily) {
    match.completeRound(false, maxGuesses)
  }
}

const handleGuess = (guessInput) => {
  if (isRoundOver.value) return

  const target = currentTargetCar()
  if (!target) return

  const makeStatus = guessInput.make.toLowerCase() === target.make.toLowerCase() ? 'correct' : 'incorrect'
  
  let modelStatus = 'incorrect'
  if (guessInput.model.toLowerCase() === target.model.toLowerCase()) {
    if ((guessInput.gen || '').toLowerCase() === (target.gen || '').toLowerCase()) {
      modelStatus = 'correct'
    } else {
      modelStatus = 'partial'
    }
  } else if (guessInput.groupName && target.groupName && 
             guessInput.groupName.toLowerCase() === target.groupName.toLowerCase()) {
    modelStatus = 'partial_group'
  }

  let countryStatus = 'incorrect'
  if (guessInput.country.toLowerCase() === target.country.toLowerCase()) {
    countryStatus = 'correct'
  }

  const newGuess = {
    make: guessInput.make,
    model: guessInput.model,
    gen: guessInput.gen,
    year: guessInput.year,
    country: guessInput.country,
    makeStatus,
    modelStatus,
    countryStatus
  }

  guesses.value.push(newGuess)

  if (makeStatus === 'correct' && modelStatus === 'correct' && countryStatus === 'correct') {
    isRoundOver.value = true
    isVictory.value = true

    if (props.isDaily) {
      emit('game-over', { victory: true, guesses: guesses.value })
    } else {
      match.completeRound(true, guesses.value.length)
    }
  } else if (guesses.value.length >= maxGuesses) {
    isRoundOver.value = true
    isVictory.value = false

    if (props.isDaily) {
      emit('game-over', { victory: false, guesses: guesses.value })
    } else {
      match.completeRound(false, guesses.value.length)
    }
  }
}

// ── Advance to next round ──
const handleNextRound = () => {
  match.advanceRound()
  resetRound()
}

// ── Replay the entire match ──
const handlePlayAgain = () => {
  match.resetMatch()
  startMatch()
}
</script>

<template>
  <main class="flex-1 flex flex-col lg:flex-row lg:overflow-hidden relative">
    <!-- Stats Banner (Mobile Top) -->
    <GameStats 
      v-if="!isDaily"
      class="lg:hidden"
      :current-round="match.currentRound.value"
      :max-rounds="match.MATCH_ROUNDS"
      :score="match.matchScore.value"
      :round-results="match.roundResults.value"
    />

    <!-- Left Column: Image and Info -->
    <div class="flex-1 lg:w-[65%] min-h-[300px] md:min-h-0 lg:h-full p-4 lg:p-6 lg:overflow-y-auto flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 transition-all duration-500">
      <div class="w-full relative shrink-0 transition-all duration-500 flex-1" 
           :class="isRoundOver ? 'min-h-[250px] h-[40%] lg:h-[60%]' : 'h-full min-h-[300px]'">
        <CarImageReveal 
          v-if="currentTargetCar()"
          :key="currentTargetCar()?.imageUrl?.url || currentTargetCar()?.imageUrl"
          :image-url="resolveAsset(currentTargetCar().imageUrl.url)"
          :revealed="isVictory || isRoundOver" 
          :attempts="guesses.length"
          :max-attempts="maxGuesses"
          :zoom-enabled="false"
          @zoom="showImageModal = true"
        />
      </div>

      <!-- Car Info (Visible on Round Over) -->
      <VehicleTechnicalInfo 
        :vehicle="currentTargetCar()" 
        :is-visible="isRoundOver" 
      />
    </div>

    <!-- Right Column: Info and Input Panel -->
    <div class="w-full lg:w-[35%] lg:h-full flex flex-col relative lg:overflow-hidden bg-white dark:bg-slate-950 shadow-[-10px_0_20px_rgba(0,0,0,0.05)] z-10">
      
      <!-- Stats Banner (Desktop) -->
      <GameStats 
        v-if="!isDaily"
        class="hidden lg:flex"
        :current-round="match.currentRound.value"
        :max-rounds="match.MATCH_ROUNDS"
        :score="match.matchScore.value"
        :round-results="match.roundResults.value"
      />

      <!-- Scrollable Area for Input and Guesses -->
      <div class="flex-1 lg:overflow-y-auto flex flex-col">
        <!-- Input Area -->
        <div class="p-6 shrink-0 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <GuessInput @submit-guess="handleGuess" @give-up="handleGiveUp" v-if="!isRoundOver" />
        </div>

        <!-- Guesses Area -->
        <div class="p-6 flex-1">
          <h3 class="text-sm font-bold text-slate-500 uppercase mb-4 tracking-wider">{{ t('game.guessHistory') }}</h3>
          <GuessGrid :guesses="guesses" :max-guesses="maxGuesses" />
        </div>
      </div>

      <!-- Round Over Overlay (non-daily mode — shows score + next round button) -->
      <div v-if="isRoundOver && !isDaily && !match.isMatchOver.value" class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm p-8 shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-fade-in">
        <div class="w-full max-w-sm text-center">
          <!-- Victory / Defeat header -->
          <div class="mb-6" :class="isVictory ? 'text-green-500' : 'text-red-500'">
            <h2 class="text-4xl font-black mb-2 uppercase tracking-tight">
              {{ isVictory ? t('game.youGotIt') : t('game.gameOver') }}
            </h2>
            <p class="text-slate-600 dark:text-slate-400 font-medium text-lg">
              {{ isVictory ? t('game.foundCorrect') : t('game.ranOut') }}
            </p>
          </div>

          <!-- Round score display -->
          <div class="mb-8">
            <div class="bg-slate-100 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{{ t('game.roundScore') }}</div>
              <div class="text-4xl font-black" :class="match.lastRoundScore.value > 0 ? 'text-blue-500' : 'text-slate-400'">
                {{ match.lastRoundScore.value > 0 ? '+' : '' }}{{ match.lastRoundScore.value }}
                <span class="text-sm text-slate-400">{{ t('match.pts') }}</span>
              </div>
            </div>
          </div>

          <!-- Next Round button -->
          <div class="flex flex-col gap-4">
            <button @click="handleNextRound" class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 text-lg uppercase tracking-wider">
              {{ match.currentRound.value >= match.MATCH_ROUNDS ? t('game.finalResult') : t('game.nextRound') }}
            </button>
            <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {{ t('game.roundOf', { current: match.currentRound.value, total: match.MATCH_ROUNDS }) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Daily mode: simple game over overlay (no rounds) -->
      <div v-if="isRoundOver && isDaily" class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm p-8 shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-fade-in">
        <div class="w-full max-w-sm text-center">
          <div class="mb-8" :class="isVictory ? 'text-green-500' : 'text-red-500'">
            <h2 class="text-4xl font-black mb-2 uppercase tracking-tight">
              {{ isVictory ? t('game.youGotIt') : t('game.gameOver') }}
            </h2>
            <p class="text-slate-600 dark:text-slate-400 font-medium text-lg">
              {{ isVictory ? t('game.foundCorrect') : t('game.ranOut') }}
            </p>
          </div>
          <div class="flex flex-col gap-4">
            <router-link to="/" class="w-full py-4 bg-transparent border-2 border-slate-900/20 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-lg text-center">
              {{ t('game.backToMenu') }}
            </router-link>
          </div>
        </div>
      </div>

    </div>

    <!-- Image Fullscreen Modal -->
    <ImageModal 
      v-if="currentTargetCar()"
      :image-url="resolveAsset(currentTargetCar().imageUrl.url)"
      :is-open="showImageModal"
      @close="showImageModal = false"
    />

    <!-- Match Over: Full summary overlay -->
    <MatchSummary
      v-if="match.isMatchOver.value && !isDaily"
      :match-score="match.matchScore.value"
      :round-results="match.roundResults.value"
      :best-score="match.bestScore.value"
      :max-points-per-round="match.MAX_POINTS_PER_ROUND"
      :total-rounds="match.MATCH_ROUNDS"
      @play-again="handlePlayAgain"
    />
  </main>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.4s ease-out;
}
</style>
