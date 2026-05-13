<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['submit-guess', 'give-up'])

import { allVehicles as vehiclesData } from '../utils/vehicleData'
import { useI18n } from '../i18n/useI18n.js'

const { t } = useI18n()

// ---------- Utilities ----------

// ---------- Utilities (Computed once outside of computeds) ----------

// Unique value sets (full base)
const allCountries = [...new Set(vehiclesData.filter(c => c.country).map(c => c.country))].sort()

const countryFlags = {
  'Australia': 'au',
  'France': 'fr',
  'Germany': 'de',
  'Italy': 'it',
  'Japan': 'jp',
  'South Korea': 'kr',
  'Sweden': 'se',
  'UK': 'gb',
  'USA': 'us'
}

// Makes pre-computed by country for fast lookup
const makesByCountry = vehiclesData.reduce((acc, car) => {
  if (!acc[car.country]) acc[car.country] = new Set()
  acc[car.country].add(car.make)
  return acc
}, {})

const allMakesList = [...new Set(vehiclesData.map(c => c.make))].sort()

// Model names that appear in more than one make (ambiguous)
const modelNameCount = vehiclesData.reduce((acc, car) => {
  acc[car.model] = (acc[car.model] || new Set()).add(car.make)
  return acc
}, {})
const ambiguousModels = new Set(
  Object.entries(modelNameCount)
    .filter(([, makes]) => makes.size > 1)
    .map(([model]) => model)
)

// Returns the display label for a model item
const modelLabel = (item, makeIsSelected) => {
  if (makeIsSelected || !ambiguousModels.has(item.model)) return item.model
  return `${item.model} (${item.make})`
}

// Finds the country for a make (first occurrence)
const getCountryForMake = (make) => {
  const car = vehiclesData.find(c => c.make === make)
  return car?.country ?? ''
}

// ---------- Reference for click outside ----------
const guessInputRef = ref(null)

const handleClickOutside = (event) => {
  // Close if the click is outside the component
  if (guessInputRef.value && !guessInputRef.value.contains(event.target)) {
    closeAll()
  }
}

onMounted(() => {
  window.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('mousedown', handleClickOutside)
})

// ---------- Estado reativo ----------

const selectedCountry = ref('')
const selectedMake = ref('')
const selectedModel = ref('')   // valor real do modelo
const selectedGen = ref('')     // selected generation
const selectedYear = ref(null)    // ano selecionado
const selectedGroupName = ref('') // grupo selecionado

const countryQuery = ref('')
const makeQuery = ref('')
const modelQuery = ref('')

const isCountryOpen = ref(false)
const isMakeOpen = ref(false)
const isModelOpen = ref(false)

// Index of the keyboard-focused item in suggestions
const activeIndex = ref(0)

// ---------- Listas filtradas com cascata ----------

// Makes filtered by selected country + query
const availableMakes = computed(() => {
  const query = makeQuery.value.toLowerCase()
  const base = selectedCountry.value
    ? [...(makesByCountry[selectedCountry.value] || [])].sort()
    : allMakesList
    
  return base.filter(m => m.toLowerCase().includes(query))
})

// Base list of unique models for the selected make (or all)
// This only re-computes when the selected MAKE changes, not when the user types.
const baseModelItems = computed(() => {
  const base = selectedMake.value
    ? vehiclesData.filter(c => c.make === selectedMake.value)
    : vehiclesData

  const seen = new Set()
  const items = []
  
  for (const car of base) {
    const m = (car.make || '').trim()
    const mod = (car.model || '').trim()
    const g = (car.gen || '').trim()
    const y = car.year
    
    const key = `${m}||${mod}||${g}||${y}`.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      items.push({ 
        model: mod, 
        make: m, 
        gen: g, 
        year: y,
        groupName: (car.groupName || '').trim() 
      })
    }
  }

  // Sort once
  return items.sort((a, b) => {
    const modelComp = a.model.localeCompare(b.model)
    if (modelComp !== 0) return modelComp
    const yearComp = b.year - a.year
    if (yearComp !== 0) return yearComp
    return a.gen.localeCompare(b.gen)
  })
})

// Filters the pre-processed list based on the query (fast!)
const availableModelItems = computed(() => {
  let filtered = baseModelItems.value
  
  if (modelQuery.value) {
    const queryWords = modelQuery.value.toLowerCase().split(' ').filter(w => w.length > 0)
    filtered = filtered.filter(item => {
      const searchStr = `${item.model} ${item.gen} ${item.year} ${item.make}`.toLowerCase()
      return queryWords.every(word => searchStr.includes(word))
    })
  }

  // Retorna todos os resultados filtrados (o virtual scroller cuida da performance)
  return filtered.map(item => {
    return {
      ...item,
      id: `${item.make}||${item.model}||${item.gen}||${item.year}`, // Unique ID for the virtual scroller
      label: `${item.model}${item.gen ? ' ' + item.gen : ''}${item.year ? ' ' + item.year : ''}`
    }
  })
})

const isModelSelected = computed(() => !!selectedModel.value)

const filteredCountries = computed(() =>
  allCountries.filter(c => c.toLowerCase().includes(countryQuery.value.toLowerCase()))
)

// Dynamic Make placeholder
const makePlaceholder = computed(() => {
  if (selectedCountry.value) return t('guess.makeIn', { value: selectedCountry.value })
  return t('guess.makeDefault')
})

// Dynamic Model placeholder
const modelPlaceholder = computed(() => {
  if (selectedMake.value) return t('guess.modelIn', { value: selectedMake.value })
  return t('guess.modelDefault')
})

// ---------- Selection handlers ----------

const openDropdown = (type) => {
  isCountryOpen.value = type === 'country'
  isMakeOpen.value = type === 'make'
  isModelOpen.value = type === 'model'
  activeIndex.value = 0 // Reset focus on open
}

const closeAll = () => {
  isCountryOpen.value = false
  isMakeOpen.value = false
  isModelOpen.value = false
  activeIndex.value = 0
}

// Keyboard navigation functions
const onKeyDown = (e, type, list) => {
  if (!list || list.length === 0) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % list.length
    scrollActiveIntoView()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + list.length) % list.length
    scrollActiveIntoView()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (list[activeIndex.value]) {
      if (type === 'country') selectCountry(list[activeIndex.value])
      else if (type === 'make') selectMake(list[activeIndex.value])
      else if (type === 'model') selectModel(list[activeIndex.value])
    }
  } else if (e.key === 'Escape') {
    closeAll()
  }
}

const scrollActiveIntoView = () => {
  // Small delay to ensure the DOM has updated
  setTimeout(() => {
    const activeEl = document.querySelector('.dropdown-item-active')
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, 10)
}

const selectCountry = (country) => {
  selectedCountry.value = country
  countryQuery.value = country
  // Reset make and model when changing country
  clearMakeSelection()
  isCountryOpen.value = false
}

const clearCountrySelection = () => {
  selectedCountry.value = ''
  countryQuery.value = ''
  clearMakeSelection()
}

const selectMake = (make) => {
  selectedMake.value = make
  makeQuery.value = make
  // Auto-fill country
  const country = getCountryForMake(make)
  selectedCountry.value = country
  countryQuery.value = country
  // Reset model when changing make
  clearModelSelection()
  isMakeOpen.value = false
}

const clearMakeSelection = () => {
  selectedMake.value = ''
  makeQuery.value = ''
  clearModelSelection()
}

const resetModelAll = () => {
  selectedModel.value = ''
  selectedGen.value = ''
  selectedYear.value = null
  selectedGroupName.value = ''
  modelQuery.value = ''
}

const clearModelSelection = () => {
  selectedModel.value = ''
  selectedGen.value = ''
  selectedYear.value = null
  selectedGroupName.value = ''
}

const removeGen = () => {
  selectedGen.value = ''
}

const removeYear = () => {
  selectedYear.value = null
}

const selectModel = (item) => {
  selectedModel.value = item.model
  selectedGen.value = item.gen
  selectedYear.value = item.year
  selectedGroupName.value = item.groupName
  
  modelQuery.value = item.model
  
  // Auto-fill make
  selectedMake.value = item.make
  makeQuery.value = item.make
  
  // Auto-fill country
  const country = getCountryForMake(item.make)
  selectedCountry.value = country
  countryQuery.value = country
  isModelOpen.value = false
}

// Clears the country selection when the user manually edits the field
const onCountryInput = () => {
  if (countryQuery.value !== selectedCountry.value) {
    selectedCountry.value = ''
    clearMakeSelection()
  }
}

// Clears the make selection when the user manually edits the field
const onMakeInput = () => {
  if (makeQuery.value !== selectedMake.value) {
    selectedMake.value = ''
    clearModelSelection()
  }
}

// Clears the model selection when the user manually edits the field, but keeps the text
const onModelInput = () => {
  clearModelSelection()
}

// ---------- Submit ----------

const submitGuess = () => {
  if (selectedMake.value && selectedModel.value && selectedCountry.value) {
    emit('submit-guess', {
      make: selectedMake.value,
      model: selectedModel.value || modelQuery.value, // Use the text if there's no formal selection
      country: selectedCountry.value,
      gen: selectedGen.value,
      year: selectedYear.value,
      groupName: selectedGroupName.value,
    })
    // Reset
    selectedCountry.value = ''
    selectedMake.value = ''
    resetModelAll()
    countryQuery.value = ''
    makeQuery.value = ''
  } else {
    alert(t('guess.fillAll'))
  }
}
</script>

<template>
  <div ref="guessInputRef" @click="closeAll" class="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 rounded-xl shadow-lg w-full relative overflow-visible z-20">
    <h3 class="text-xl font-black mb-4 text-white text-center uppercase tracking-wide drop-shadow-md">
      {{ t('guess.whatCar') }}
    </h3>

    <div class="flex flex-col gap-4">

      <!-- País -->
      <div class="relative z-50" @click.stop>
        <div class="relative flex items-center bg-white/95 dark:bg-slate-900/95 rounded-lg focus-within:ring-4 focus-within:ring-white/50 transition-all shadow-inner overflow-hidden">
          <div v-if="selectedCountry && countryFlags[selectedCountry]" class="pl-4 shrink-0 flex items-center">
            <img 
              :src="`https://flagcdn.com/w40/${countryFlags[selectedCountry]}.png`" 
              class="w-6 h-auto rounded-sm shadow-sm"
              :alt="selectedCountry"
            />
          </div>
          <input
            v-model="countryQuery"
            @input="onCountryInput"
            @focus="openDropdown('country')"
            @click="openDropdown('country')"
            @keydown="onKeyDown($event, 'country', filteredCountries)"
            type="text"
            :placeholder="t('guess.countryPlaceholder')"
            class="w-full px-4 py-3 bg-transparent border-none focus:outline-none text-slate-800 dark:text-white font-medium placeholder-slate-400"
            :class="{ 'pl-2': selectedCountry && countryFlags[selectedCountry] }"
          >
          <button v-if="countryQuery" @click="clearCountrySelection" class="pr-3 text-slate-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <ul v-if="isCountryOpen && filteredCountries.length" class="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-h-48 overflow-y-auto top-full">
          <li
            v-for="(country, index) in filteredCountries"
            :key="country"
            @click="selectCountry(country)"
            class="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-800 dark:text-slate-200 flex items-center gap-3"
            :class="{ 'bg-slate-100 dark:bg-slate-700 dropdown-item-active': index === activeIndex }"
          >
            <img 
              v-if="countryFlags[country]"
              :src="`https://flagcdn.com/w40/${countryFlags[country]}.png`" 
              class="w-5 h-auto rounded-sm"
            />
            <span v-else class="text-xl">🏳️</span>
            <span>{{ country }}</span>
          </li>
        </ul>
      </div>

      <!-- Marca -->
      <div class="relative z-40" @click.stop>
        <div class="relative flex items-center">
          <input
            v-model="makeQuery"
            @input="onMakeInput"
            @focus="openDropdown('make')"
            @click="openDropdown('make')"
            @keydown="onKeyDown($event, 'make', availableMakes)"
            type="text"
            :placeholder="makePlaceholder"
            class="w-full px-4 py-3 pr-10 bg-white/95 dark:bg-slate-900/95 border-none rounded-lg focus:ring-4 focus:ring-white/50 focus:outline-none text-slate-800 dark:text-white shadow-inner font-medium placeholder-slate-400"
          >
          <button v-if="makeQuery" @click="clearMakeSelection" class="absolute right-3 text-slate-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <ul v-if="isMakeOpen && availableMakes.length" class="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-h-48 overflow-y-auto top-full">
          <li
            v-for="(make, index) in availableMakes"
            :key="make"
            @click="selectMake(make)"
            class="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-800 dark:text-slate-200"
            :class="{ 'bg-slate-100 dark:bg-slate-700 dropdown-item-active': index === activeIndex }"
          >
            {{ make }}
          </li>
        </ul>
      </div>

      <!-- Modelo -->
      <div class="relative z-30" @click.stop>
        <div class="relative flex items-center bg-white/95 dark:bg-slate-900/95 rounded-lg pr-3 focus-within:ring-4 focus-within:ring-white/50 transition-all shadow-inner">
          <input
            v-model="modelQuery"
            @input="onModelInput"
            @focus="openDropdown('model')"
            @click="openDropdown('model')"
            @keydown="onKeyDown($event, 'model', availableModelItems)"
            type="text"
            :placeholder="modelPlaceholder"
            class="flex-1 px-4 py-3 bg-transparent border-none focus:outline-none text-slate-800 dark:text-white font-medium placeholder-slate-400"
          >
          
          <div class="flex items-center gap-1 shrink-0">
            <div v-if="selectedGen" class="tag tag-gen flex items-center h-7 px-2">
              {{ selectedGen }}
            </div>
            
            <div v-if="selectedYear" class="tag tag-year flex items-center h-7 px-2">
              {{ selectedYear }}
            </div>
            
            <button v-if="modelQuery || selectedGen || selectedYear" @click="resetModelAll" class="ml-1 text-slate-400 hover:text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
        
        <!-- Lista de Modelos com Virtual Scroll -->
        <div v-if="isModelOpen && availableModelItems.length" class="absolute z-50 w-full mt-1 top-full">
          <RecycleScroller
            class="bg-white dark:bg-slate-800 rounded-lg shadow-2xl h-64 border border-slate-200 dark:border-slate-700"
            :items="availableModelItems"
            :item-size="64"
            key-field="id"
            v-slot="{ item, index }"
          >
            <div
              @click="selectModel(item)"
              class="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-800 dark:text-slate-200 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 last:border-0 h-[64px]"
              :class="{ 'bg-slate-100 dark:bg-slate-700 dropdown-item-active': index === activeIndex }"
            >
              <div class="flex flex-col">
                <span class="font-bold text-sm">{{ item.model }}</span>
                <span class="text-[10px] text-slate-400 uppercase tracking-tighter">{{ item.make }}</span>
              </div>
              <div class="flex gap-2">
                <span v-if="item.gen" class="tag tag-gen">{{ item.gen }}</span>
                <span class="tag tag-year">{{ item.year }}</span>
              </div>
            </div>
          </RecycleScroller>
        </div>
      </div>

      <div class="flex gap-3 mt-2">
        <button
          @click="emit('give-up')"
          class="flex-1 py-3 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-sm text-white font-bold rounded-lg transition-colors border border-red-500/40 shadow-sm uppercase tracking-wide text-sm"
        >
          {{ t('guess.giveUp') }}
        </button>
        <button
          @click="submitGuess"
          class="flex-[2] py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold rounded-lg transition-colors border border-white/40 shadow-sm uppercase tracking-wide"
        >
          {{ t('guess.submitGuess') }}
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.tag {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.tag-year {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.tag-gen {
  background: rgba(168, 85, 247, 0.1);
  color: #a78bfa;
  border: 1px solid rgba(168, 85, 247, 0.2);
}

/* Dark mode overrides if needed */
.dark .tag-year {
  background: rgba(30, 64, 175, 0.3);
}
.dark .tag-gen {
  background: rgba(88, 28, 135, 0.3);
}
</style>
