<script setup>
import { ref, onMounted } from 'vue'
import CarImageReveal from '../components/CarImageReveal.vue'
import GuessInput from '../components/GuessInput.vue'
import GuessGrid from '../components/GuessGrid.vue'
import VehicleTechnicalInfo from '../components/VehicleTechnicalInfo.vue'
const props = defineProps({
  difficulty: {
    type: Number,
    default: null
  }
})

import { playableVehicles, getVehiclesByDifficulty } from '../utils/vehicleData'

const vehiclesData = props.difficulty ? getVehiclesByDifficulty(props.difficulty) : playableVehicles

const targetCar = ref(null)
const guesses = ref([])
const maxGuesses = 5
const isGameOver = ref(false)
const isVictory = ref(false)

const resolveAsset = (path) => {
  if (path.startsWith('http')) return path
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}

const startGame = () => {
  if (!vehiclesData || vehiclesData.length === 0) return

  let randomIndex
  // Evita pegar o mesmo carro duas vezes seguidas se houver mais de um carro disponível
  do {
    randomIndex = Math.floor(Math.random() * vehiclesData.length)
  } while (vehiclesData.length > 1 && targetCar.value && 
           vehiclesData[randomIndex].make === targetCar.value.make && 
           vehiclesData[randomIndex].model === targetCar.value.model)

  const car = vehiclesData[randomIndex]
  const randomImageUrl = car.imageUrls[Math.floor(Math.random() * car.imageUrls.length)]
  
  targetCar.value = {
    ...car,
    imageUrl: randomImageUrl
  }
  
  guesses.value = []
  isGameOver.value = false
  isVictory.value = false
}

onMounted(() => {
  startGame()
})

const handleGiveUp = () => {
  isGameOver.value = true
  isVictory.value = false
}

const handleGuess = (guessInput) => {
  if (isGameOver.value) return

  const makeStatus = guessInput.make.toLowerCase() === targetCar.value.make.toLowerCase() ? 'correct' : 'incorrect'
  
  let modelStatus = 'incorrect'
  if (guessInput.model.toLowerCase() === targetCar.value.model.toLowerCase()) {
    if ((guessInput.gen || '').toLowerCase() === (targetCar.value.gen || '').toLowerCase()) {
      modelStatus = 'correct'
    } else {
      modelStatus = 'partial'
    }
  } else if (guessInput.groupName && targetCar.value.groupName && 
             guessInput.groupName.toLowerCase() === targetCar.value.groupName.toLowerCase()) {
    modelStatus = 'partial_group'
  }

  let countryStatus = 'incorrect'
  if (guessInput.country.toLowerCase() === targetCar.value.country.toLowerCase()) {
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
    isGameOver.value = true
    isVictory.value = true
  } else if (guesses.value.length >= maxGuesses) {
    isGameOver.value = true
    isVictory.value = false
  }
}
</script>

<template>
  <main class="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
    <!-- Left Column: Image and Info -->
    <div class="flex-1 lg:w-[65%] min-h-[300px] md:min-h-0 h-full p-4 lg:p-6 overflow-y-auto flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 transition-all duration-500">
      <div class="w-full relative shrink-0 transition-all duration-500 flex-1" 
           :class="isGameOver ? 'min-h-[250px] h-[40%] lg:h-[60%]' : 'h-full min-h-[300px]'">
        <CarImageReveal 
          v-if="targetCar"
          :key="targetCar.imageUrl"
          :image-url="resolveAsset(targetCar.imageUrl.url)"
          :revealed="isVictory || isGameOver" 
          :attempts="guesses.length"
          :max-attempts="maxGuesses"
          :zoom-enabled="false"
        />
      </div>

      <!-- Car Info (Visible on Game Over) -->
      <VehicleTechnicalInfo 
        :vehicle="targetCar" 
        :is-visible="isGameOver" 
      />
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
            <router-link to="/" class="w-full py-4 bg-transparent border-2 border-slate-900/20 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-lg text-center">
              VOLTAR AO MENU
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
