<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['submit-guess', 'give-up'])

import vehiclesData from '../data/vehicles_curated.json'

// ---------- Utilitários ----------

// Conjuntos de valores únicos (base completa)
const allCountries = [...new Set(vehiclesData.filter(c => c.country).map(c => c.country))].sort()

// Nomes de modelos que aparecem em mais de uma marca (ambíguos)
const modelNameCount = vehiclesData.reduce((acc, car) => {
  acc[car.model] = (acc[car.model] || new Set()).add(car.make)
  return acc
}, {})
const ambiguousModels = new Set(
  Object.entries(modelNameCount)
    .filter(([, makes]) => makes.size > 1)
    .map(([model]) => model)
)

// Retorna o rótulo de exibição de um item de modelo
const modelLabel = (item, makeIsSelected) => {
  if (makeIsSelected || !ambiguousModels.has(item.model)) return item.model
  return `${item.model} (${item.make})`
}

// Encontra o país de uma marca (primeira ocorrência)
const getCountryForMake = (make) => {
  const car = vehiclesData.find(c => c.make === make)
  return car?.country ?? ''
}

// Encontra o carro pelo modelo + marca (ou só modelo se único)
const getCarByModelLabel = (label, currentMake) => {
  // Se a marca já está selecionada, busca dentro dela
  if (currentMake) {
    return vehiclesData.find(c => c.make === currentMake && c.model === label)
  }
  // Caso contrário, o label pode conter "(Marca)" para desambiguar
  const match = label.match(/^(.+) \((.+)\)$/)
  if (match) {
    return vehiclesData.find(c => c.model === match[1] && c.make === match[2])
  }
  return vehiclesData.find(c => c.model === label)
}

// ---------- Estado reativo ----------

const selectedCountry = ref('')
const selectedMake = ref('')
const selectedModel = ref('')   // valor real do modelo
const selectedGen = ref('')     // geração selecionada

const countryQuery = ref('')
const makeQuery = ref('')
const modelQuery = ref('')

const isCountryOpen = ref(false)
const isMakeOpen = ref(false)
const isModelOpen = ref(false)

// ---------- Listas filtradas com cascata ----------

// Marcas filtradas pelo país selecionado + query
const availableMakes = computed(() => {
  const base = selectedCountry.value
    ? [...new Set(vehiclesData.filter(c => c.country === selectedCountry.value).map(c => c.make))].sort()
    : [...new Set(vehiclesData.map(c => c.make))].sort()
  return base.filter(m => m.toLowerCase().includes(makeQuery.value.toLowerCase()))
})

// Itens de modelo filtrados pela marca selecionada + query
// Cada item: { model, make, gen, label }
const availableModelItems = computed(() => {
  const base = selectedMake.value
    ? vehiclesData.filter(c => c.make === selectedMake.value)
    : vehiclesData

  // Deduplica por make+model+gen (normalizado)
  const seen = new Set()
  const items = []
  for (const car of base) {
    const m = (car.make || '').trim()
    const mod = (car.model || '').trim()
    const g = (car.gen || '').trim()
    
    const key = `${m}||${mod}||${g}`.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      items.push({ model: mod, make: m, gen: g })
    }
  }
  
  // Ordena por modelo e depois por geração (se existir)
  items.sort((a, b) => {
    const modelComp = a.model.localeCompare(b.model)
    if (modelComp !== 0) return modelComp
    return a.gen.localeCompare(b.gen)
  })

  // Aplica query e gera label
  return items
    .filter(item => {
      const searchStr = `${item.model} ${item.gen}`.toLowerCase()
      return searchStr.includes(modelQuery.value.toLowerCase())
    })
    .map(item => {
      let label = item.model
      if (item.gen) label += ` (${item.gen})`
      
      // Se não houver marca selecionada e o modelo for ambíguo, adiciona a marca
      if (!selectedMake.value && ambiguousModels.has(item.model)) {
        label += ` (${item.make})`
      }
      
      return {
        ...item,
        label
      }
    })
})

const filteredCountries = computed(() =>
  allCountries.filter(c => c.toLowerCase().includes(countryQuery.value.toLowerCase()))
)

// Placeholder dinâmico da Marca
const makePlaceholder = computed(() => {
  if (selectedCountry.value) return `🏭 Marca (em ${selectedCountry.value})...`
  return '🏭 Marca do Carro...'
})

// Placeholder dinâmico do Modelo
const modelPlaceholder = computed(() => {
  if (selectedMake.value) return `🚗 Modelo (${selectedMake.value})...`
  return '🚗 Modelo...'
})

// ---------- Handlers de seleção ----------

const openDropdown = (type) => {
  isCountryOpen.value = type === 'country'
  isMakeOpen.value = type === 'make'
  isModelOpen.value = type === 'model'
}

const closeAll = () => {
  isCountryOpen.value = false
  isMakeOpen.value = false
  isModelOpen.value = false
}

const selectCountry = (country) => {
  selectedCountry.value = country
  countryQuery.value = country
  // Reset marca e modelo ao trocar o país
  selectedMake.value = ''
  makeQuery.value = ''
  selectedModel.value = ''
  selectedGen.value = ''
  modelQuery.value = ''
  selectedModelDisplayLabel.value = ''
  isCountryOpen.value = false
}

const selectMake = (make) => {
  selectedMake.value = make
  makeQuery.value = make
  // Auto-preenche o país
  const country = getCountryForMake(make)
  selectedCountry.value = country
  countryQuery.value = country
  // Reset modelo ao trocar a marca
  selectedModel.value = ''
  selectedGen.value = ''
  modelQuery.value = ''
  selectedModelDisplayLabel.value = ''
  isMakeOpen.value = false
}

// Label fixo do modelo selecionado (para comparação no onModelInput)
const selectedModelDisplayLabel = ref('')

const selectModel = (item) => {
  selectedModel.value = item.model
  selectedGen.value = item.gen
  
  modelQuery.value = item.label
  selectedModelDisplayLabel.value = item.label
  
  // Auto-preenche marca
  selectedMake.value = item.make
  makeQuery.value = item.make
  
  // Auto-preenche país
  const country = getCountryForMake(item.make)
  selectedCountry.value = country
  countryQuery.value = country
  isModelOpen.value = false
}

// Limpa a seleção de país quando o usuário edita o campo manualmente
const onCountryInput = () => {
  if (countryQuery.value !== selectedCountry.value) {
    selectedCountry.value = ''
    selectedMake.value = ''
    makeQuery.value = ''
    selectedModel.value = ''
    selectedGen.value = ''
    modelQuery.value = ''
    selectedModelDisplayLabel.value = ''
  }
}

// Limpa a seleção de marca quando o usuário edita o campo manualmente
const onMakeInput = () => {
  if (makeQuery.value !== selectedMake.value) {
    selectedMake.value = ''
    selectedModel.value = ''
    selectedGen.value = ''
    modelQuery.value = ''
    selectedModelDisplayLabel.value = ''
  }
}

// Limpa a seleção de modelo quando o usuário edita o campo manualmente
const onModelInput = () => {
  if (modelQuery.value !== selectedModelDisplayLabel.value) {
    selectedModel.value = ''
    selectedGen.value = ''
    selectedModelDisplayLabel.value = ''
  }
}

// ---------- Submit ----------

const submitGuess = () => {
  if (selectedMake.value && selectedModel.value && selectedCountry.value) {
    emit('submit-guess', {
      make: selectedMake.value,
      model: selectedModel.value,
      country: selectedCountry.value,
      gen: selectedGen.value,
    })
    // Reset
    selectedCountry.value = ''
    selectedMake.value = ''
    selectedModel.value = ''
    selectedGen.value = ''
    selectedModelDisplayLabel.value = ''
    countryQuery.value = ''
    makeQuery.value = ''
    modelQuery.value = ''
  } else {
    alert('Por favor, preencha todos os campos.')
  }
}
</script>

<template>
  <div v-if="isCountryOpen || isMakeOpen || isModelOpen" @click="closeAll" class="fixed inset-0 z-10"></div>
  <div class="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 rounded-xl shadow-lg w-full relative overflow-visible z-20" @click="closeAll">
    <h3 class="text-xl font-black mb-4 text-white text-center uppercase tracking-wide drop-shadow-md">
      Qual é este carro?
    </h3>

    <div class="flex flex-col gap-4">

      <!-- País -->
      <div class="relative z-50" @click.stop>
        <input
          v-model="countryQuery"
          @input="onCountryInput"
          @focus="openDropdown('country')"
          @click="openDropdown('country')"
          type="text"
          placeholder="🌍 País de Origem..."
          class="w-full px-4 py-3 bg-white/95 dark:bg-slate-900/95 border-none rounded-lg focus:ring-4 focus:ring-white/50 focus:outline-none text-slate-800 dark:text-white shadow-inner font-medium placeholder-slate-400"
        >
        <ul v-if="isCountryOpen && filteredCountries.length" class="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-h-48 overflow-y-auto top-full">
          <li
            v-for="country in filteredCountries"
            :key="country"
            @click="selectCountry(country)"
            class="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-800 dark:text-slate-200"
          >
            {{ country }}
          </li>
        </ul>
      </div>

      <!-- Marca -->
      <div class="relative z-40" @click.stop>
        <input
          v-model="makeQuery"
          @input="onMakeInput"
          @focus="openDropdown('make')"
          @click="openDropdown('make')"
          type="text"
          :placeholder="makePlaceholder"
          class="w-full px-4 py-3 bg-white/95 dark:bg-slate-900/95 border-none rounded-lg focus:ring-4 focus:ring-white/50 focus:outline-none text-slate-800 dark:text-white shadow-inner font-medium placeholder-slate-400"
        >
        <ul v-if="isMakeOpen && availableMakes.length" class="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-h-48 overflow-y-auto top-full">
          <li
            v-for="make in availableMakes"
            :key="make"
            @click="selectMake(make)"
            class="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-800 dark:text-slate-200"
          >
            {{ make }}
          </li>
        </ul>
      </div>

      <!-- Modelo -->
      <div class="relative z-30" @click.stop>
        <input
          v-model="modelQuery"
          @input="onModelInput"
          @focus="openDropdown('model')"
          @click="openDropdown('model')"
          type="text"
          :placeholder="modelPlaceholder"
          class="w-full px-4 py-3 bg-white/95 dark:bg-slate-900/95 border-none rounded-lg focus:ring-4 focus:ring-white/50 focus:outline-none text-slate-800 dark:text-white shadow-inner font-medium placeholder-slate-400"
        >
        <ul v-if="isModelOpen && availableModelItems.length" class="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-h-48 overflow-y-auto top-full">
          <li
            v-for="item in availableModelItems"
            :key="`${item.make}||${item.model}||${item.gen}`"
            @click="selectModel(item)"
            class="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-800 dark:text-slate-200"
          >
            {{ item.label }}
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
