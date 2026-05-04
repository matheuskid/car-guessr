<script setup>
import { ref, computed } from 'vue'
import ThemeToggle from './components/ThemeToggle.vue'
import CarImageReveal from './components/CarImageReveal.vue'
import GuessInput from './components/GuessInput.vue'
import GuessGrid from './components/GuessGrid.vue'
import carsData from './data/cars.json'

const gameState = ref('MENU') // 'MENU' or 'PLAYING'
const targetCar = ref(null)

const resolveAsset = (path) => {
  return import.meta.env.BASE_URL + "car-guessr/" + path.replace(/^\//, '')
}

const guesses = ref([])
const maxGuesses = 5
const isGameOver = ref(false)
const isVictory = ref(false)

const startGame = () => {
  const randomIndex = Math.floor(Math.random() * carsData.length)
  targetCar.value = carsData[randomIndex]
  guesses.value = []
  isGameOver.value = false
  isVictory.value = false
  gameState.value = 'PLAYING'
}

const returnToMenu = () => {
  gameState.value = 'MENU'
}

const handleGiveUp = () => {
  isGameOver.value = true
  isVictory.value = false
}

const handleGuess = (guessInput) => {
  if (isGameOver.value) return

  // Compare guess with target
  const makeStatus = guessInput.make === targetCar.value.make ? 'correct' : 'incorrect'
  const modelStatus = guessInput.model === targetCar.value.model ? 'correct' : 'incorrect'
  let countryStatus = 'incorrect'
  
  if (guessInput.country === targetCar.value.country) {
    countryStatus = 'correct'
  } else if (guessInput.country === 'Italy' || guessInput.country === 'UK') {
    countryStatus = 'partial'
  }

  const newGuess = {
    make: guessInput.make,
    model: guessInput.model,
    country: guessInput.country,
    makeStatus,
    modelStatus,
    countryStatus
  }

  guesses.value.push(newGuess)

  // Check win condition
  if (makeStatus === 'correct' && modelStatus === 'correct' && countryStatus === 'correct') {
    isGameOver.value = true
    isVictory.value = true
  } else if (guesses.value.length >= maxGuesses) {
    isGameOver.value = true
    isVictory.value = false
  }
}
</script>

<template>
  <div class="h-screen flex flex-col bg-slate-100 dark:bg-slate-900 transition-colors duration-300 font-sans overflow-hidden">
    <!-- Header -->
    <header class="w-full h-16 flex justify-between items-center px-6 bg-white dark:bg-slate-950 shadow-sm z-20 shrink-0">
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Car<span class="text-blue-500">Guessr</span>
        </h1>
      </div>
      <div class="flex items-center gap-4">
        <button class="px-4 py-1.5 text-sm font-semibold border border-slate-300 dark:border-slate-600 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors dark:text-slate-200">
          Sign in
        </button>
        <ThemeToggle />
      </div>
    </header>

    <!-- Start Menu -->
    <main v-if="gameState === 'MENU'" class="flex-1 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-6 relative overflow-hidden">
      <!-- Background blur effect elements -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="max-w-md w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800 text-center z-10">
        <h2 class="text-3xl font-black mb-2 text-slate-900 dark:text-white uppercase tracking-wider">
          Escolha a Dificuldade
        </h2>
        <p class="text-slate-500 dark:text-slate-400 mb-8 text-sm font-medium">O quão bem você conhece os carros?</p>
        
        <div class="flex flex-col gap-4">
          <button @click="startGame" class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 text-lg flex items-center justify-center gap-2">
            <span>Modo Fácil</span>
          </button>
          
          <button disabled class="w-full py-4 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 font-bold rounded-xl cursor-not-allowed border border-slate-200 dark:border-slate-800 text-lg relative overflow-hidden group">
            <span class="relative z-10 opacity-50">Modo Médio</span>
            <div class="absolute inset-0 flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-[2px]">
               <span class="text-[10px] font-black uppercase tracking-wider bg-slate-800 dark:bg-slate-700 text-white px-2 py-1 rounded-md shadow-sm">Em breve</span>
            </div>
          </button>
          
          <button disabled class="w-full py-4 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 font-bold rounded-xl cursor-not-allowed border border-slate-200 dark:border-slate-800 text-lg relative overflow-hidden group">
            <span class="relative z-10 opacity-50">Modo Difícil</span>
            <div class="absolute inset-0 flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-[2px]">
               <span class="text-[10px] font-black uppercase tracking-wider bg-slate-800 dark:bg-slate-700 text-white px-2 py-1 rounded-md shadow-sm">Em breve</span>
            </div>
          </button>
        </div>
      </div>
    </main>

    <!-- Main Content -->
    <main v-else-if="gameState === 'PLAYING'" class="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
      
      <!-- Left Column: Image and Info -->
      <div class="flex-1 lg:w-[65%] h-full p-4 lg:p-6 overflow-y-auto flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 transition-all duration-500">
        <div class="w-full relative shrink-0 transition-all duration-500" :class="isGameOver ? 'h-[50%] lg:h-[60%]' : 'h-full'">
          <CarImageReveal 
            v-if="targetCar"
            :key="targetCar.imageUrl"
            :image-url="resolveAsset(targetCar.imageUrl)"
            :revealed="isVictory || isGameOver" 
            :attempts="guesses.length"
            :max-attempts="maxGuesses"
          />
        </div>

        <!-- Car Info (Visible on Game Over) -->
        <div v-if="isGameOver && targetCar" class="w-full mt-6 p-6 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-fade-in shrink-0">
          <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {{ targetCar.make }} {{ targetCar.model }}
          </h2>
          <p class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
            📍 {{ targetCar.country }}
          </p>
          <div class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </div>
        </div>
      </div>

      <!-- Right Column: Info and Input Panel -->
      <div class="w-full lg:w-[35%] h-full flex flex-col relative overflow-hidden bg-white dark:bg-slate-950 shadow-[-10px_0_20px_rgba(0,0,0,0.05)] z-10">
        
        <!-- Stats Banner -->
        <div class="flex h-14 w-full text-white font-bold tracking-wide shrink-0">
          <div class="flex-1 flex items-center justify-center bg-blue-600" style="clip-path: polygon(0 0, 100% 0, 90% 100%, 0 100%); margin-right: -10%;">
            ROUND <span class="text-2xl ml-2">{{ guesses.length + 1 }}/{{ maxGuesses }}</span>
          </div>
          <div class="flex-1 flex items-center justify-center bg-indigo-600" style="clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%);">
            SCORE <span class="text-2xl ml-2">0</span>
          </div>
        </div>

        <!-- Scrollable Area for Input and Guesses -->
        <div class="flex-1 overflow-y-auto flex flex-col">
          <!-- Input Area -->
          <div class="p-6 shrink-0 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <GuessInput @submit-guess="handleGuess" @give-up="handleGiveUp" v-if="!isGameOver" />
          </div>

          <!-- Guesses Area -->
          <div class="p-6 flex-1">
            <h3 class="text-sm font-bold text-slate-500 uppercase mb-4 tracking-wider">Histórico de Palpites</h3>
            <GuessGrid :guesses="guesses" :max-guesses="maxGuesses" />
          </div>
        </div>

        <!-- Game Over Overlay (Right Column Only) -->
        <div v-if="isGameOver" class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm p-8 shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-fade-in">
          <div class="w-full max-w-sm text-center">
            <div class="mb-8" :class="isVictory ? 'text-green-500' : 'text-red-500'">
              <h2 class="text-4xl font-black mb-2 uppercase tracking-tight">
                {{ isVictory ? 'VOCÊ ACERTOU!' : 'FIM DE JOGO' }}
              </h2>
              <p class="text-slate-600 dark:text-slate-400 font-medium text-lg">
                {{ isVictory ? 'Você descobriu o carro correto!' : 'Suas tentativas acabaram.' }}
              </p>
            </div>
            
            <div class="flex flex-col gap-4">
              <button @click="startGame" class="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-md text-lg">
                JOGAR NOVAMENTE
              </button>
              <button @click="returnToMenu" class="w-full py-4 bg-transparent border-2 border-slate-900/20 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-lg">
                VOLTAR AO MENU
              </button>
            </div>
          </div>
        </div>
      </div>

    </main>

  </div>
</template>
