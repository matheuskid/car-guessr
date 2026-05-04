<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['submit-guess', 'give-up'])

import carsData from '../data/cars.json'

const makes = [...new Set(carsData.map(car => car.make))].sort()
const models = [...new Set(carsData.map(car => car.model))].sort()
const countries = [...new Set(carsData.map(car => car.country))].sort()

const selectedMake = ref('')
const selectedModel = ref('')
const selectedCountry = ref('')

const makeQuery = ref('')
const modelQuery = ref('')
const countryQuery = ref('')

const isMakeOpen = ref(false)
const isModelOpen = ref(false)
const isCountryOpen = ref(false)

const filteredMakes = computed(() => makes.filter(m => m.toLowerCase().includes(makeQuery.value.toLowerCase())))
const filteredModels = computed(() => models.filter(m => m.toLowerCase().includes(modelQuery.value.toLowerCase())))
const filteredCountries = computed(() => countries.filter(m => m.toLowerCase().includes(countryQuery.value.toLowerCase())))

const selectOption = (type, value) => {
  if (type === 'make') {
    selectedMake.value = value
    makeQuery.value = value
    isMakeOpen.value = false
  } else if (type === 'model') {
    selectedModel.value = value
    modelQuery.value = value
    isModelOpen.value = false
  } else if (type === 'country') {
    selectedCountry.value = value
    countryQuery.value = value
    isCountryOpen.value = false
  }
}

const openDropdown = (type) => {
  isMakeOpen.value = type === 'make'
  isModelOpen.value = type === 'model'
  isCountryOpen.value = type === 'country'
}

const closeAll = () => {
  isMakeOpen.value = false
  isModelOpen.value = false
  isCountryOpen.value = false
}

const submitGuess = () => {
  if (selectedMake.value && selectedModel.value && selectedCountry.value) {
    emit('submit-guess', {
      make: selectedMake.value,
      model: selectedModel.value,
      country: selectedCountry.value,
    })
    
    // Reset for next guess
    selectedMake.value = ''
    selectedModel.value = ''
    selectedCountry.value = ''
    makeQuery.value = ''
    modelQuery.value = ''
    countryQuery.value = ''
  } else {
    alert('Por favor, preencha todos os campos.')
  }
}
</script>

<template>
  <div v-if="isMakeOpen || isModelOpen || isCountryOpen" @click="closeAll" class="fixed inset-0 z-10"></div>
  <div class="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 rounded-xl shadow-lg w-full relative overflow-visible z-20" @click="closeAll">
    <h3 class="text-xl font-black mb-4 text-white text-center uppercase tracking-wide drop-shadow-md">
      Qual é este carro?
    </h3>
    
    <div class="flex flex-col gap-4">
      
      <!-- Make Select -->
      <div class="relative z-50" @click.stop>
        <input 
          v-model="makeQuery" 
          @focus="openDropdown('make')"
          @click="openDropdown('make')"
          type="text" 
          placeholder="🌍 Marca do Carro..." 
          class="w-full px-4 py-3 bg-white/95 dark:bg-slate-900/95 border-none rounded-lg focus:ring-4 focus:ring-white/50 focus:outline-none text-slate-800 dark:text-white shadow-inner font-medium placeholder-slate-400"
        >
        <ul v-if="isMakeOpen && filteredMakes.length" class="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-h-40 overflow-y-auto top-full">
          <li 
            v-for="make in filteredMakes" 
            :key="make"
            @click="selectOption('make', make)"
            class="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-800 dark:text-slate-200"
          >
            {{ make }}
          </li>
        </ul>
      </div>

      <!-- Model Select -->
      <div class="relative z-40" @click.stop>
        <input 
          v-model="modelQuery" 
          @focus="openDropdown('model')"
          @click="openDropdown('model')"
          type="text" 
          placeholder="🚗 Modelo..." 
          class="w-full px-4 py-3 bg-white/95 dark:bg-slate-900/95 border-none rounded-lg focus:ring-4 focus:ring-white/50 focus:outline-none text-slate-800 dark:text-white shadow-inner font-medium placeholder-slate-400"
        >
        <ul v-if="isModelOpen && filteredModels.length" class="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-h-40 overflow-y-auto top-full">
          <li 
            v-for="model in filteredModels" 
            :key="model"
            @click="selectOption('model', model)"
            class="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-800 dark:text-slate-200"
          >
            {{ model }}
          </li>
        </ul>
      </div>

      <!-- Country Select -->
      <div class="relative z-30" @click.stop>
        <input 
          v-model="countryQuery" 
          @focus="openDropdown('country')"
          @click="openDropdown('country')"
          type="text" 
          placeholder="📍 País de Origem..." 
          class="w-full px-4 py-3 bg-white/95 dark:bg-slate-900/95 border-none rounded-lg focus:ring-4 focus:ring-white/50 focus:outline-none text-slate-800 dark:text-white shadow-inner font-medium placeholder-slate-400"
        >
        <ul v-if="isCountryOpen && filteredCountries.length" class="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-h-40 overflow-y-auto top-full">
          <li 
            v-for="country in filteredCountries" 
            :key="country"
            @click="selectOption('country', country)"
            class="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-800 dark:text-slate-200"
          >
            {{ country }}
          </li>
        </ul>
      </div>

      <div class="flex gap-3 mt-2">
        <button 
          @click="emit('give-up')"
          class="flex-1 py-3 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-sm text-white font-bold rounded-lg transition-colors border border-red-500/40 shadow-sm uppercase tracking-wide text-sm"
        >
          Desisto
        </button>
        <button 
          @click="submitGuess"
          class="flex-[2] py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold rounded-lg transition-colors border border-white/40 shadow-sm uppercase tracking-wide"
        >
          Enviar Palpite
        </button>
      </div>

    </div>
  </div>
</template>
