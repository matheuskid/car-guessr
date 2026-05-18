<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '../i18n/useI18n.js'
import dailyData from '../data/daily_challenges.json'

const { t } = useI18n()

const emit = defineEmits(['select-date', 'close'])

// Calendar state
const currentMonth = ref(new Date())

const challengesByDate = computed(() => {
  const map = {}
  dailyData.forEach(c => {
    map[c.date] = c
  })
  return map
})

const getDayStatus = (dateStr) => {
  // Avoid timezone offsets when getting "today" string
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000
  const todayStr = new Date(now.getTime() - tzOffset).toISOString().split('T')[0]

  if (dateStr > todayStr) return 'future'
  
  const challenge = challengesByDate.value[dateStr]
  if (!challenge) return 'no-challenge'
  
  const storageKey = `car-guessr-daily-${dateStr}`
  const savedData = localStorage.getItem(storageKey)
  
  if (savedData) {
    try {
      const results = JSON.parse(savedData)
      return { status: 'completed', challenge, results }
    } catch {
      return { status: 'missed', challenge }
    }
  }
  
  return { status: 'missed', challenge } // means it exists but wasn't played
}

const daysInMonth = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  
  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, dateStr: null, state: null })
  }
  
  for (let i = 1; i <= lastDate; i++) {
    const date = new Date(year, month, i)
    // Avoid timezone offset issues when calling toISOString()
    const tzOffset = date.getTimezoneOffset() * 60000
    const dateStr = new Date(date.getTime() - tzOffset).toISOString().split('T')[0]
    
    days.push({ 
      day: i, 
      dateStr,
      state: getDayStatus(dateStr)
    })
  }
  
  return days
})

const nextMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
}

const prevMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
}

const resolveAsset = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}

const selectDay = (day) => {
  if (!day.state) return
  if (day.state === 'future' || day.state === 'no-challenge') return
  emit('select-date', day.dateStr)
}
</script>

<template>
  <div class="flex-1 flex flex-col items-center p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-900 animate-fade-in w-full">
    <div class="w-full max-w-5xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white">
          {{ t('daily.calendarTitle') }}
        </h2>
        <button @click="emit('close')" class="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-bold uppercase tracking-wider text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {{ t('daily.backToMenu') }}
        </button>
      </div>

      <!-- Calendar Box -->
      <div class="bg-slate-800/50 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden mb-8">
        
        <!-- Month Nav -->
        <div class="flex items-center justify-between p-6 bg-white/5 border-b border-white/10">
          <button @click="prevMonth" class="p-2 rounded-full hover:bg-white/10 text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h3 class="text-2xl font-black text-white uppercase tracking-wider">
            {{ t('daily.months')[currentMonth.getMonth()] }} {{ currentMonth.getFullYear() }}
          </h3>
          <button @click="nextMonth" class="p-2 rounded-full hover:bg-white/10 text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <!-- Weekdays -->
        <div class="grid grid-cols-7 border-b border-white/10 bg-black/20">
          <div v-for="day in t('daily.weekdays')" :key="day" class="p-3 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
            {{ day }}
          </div>
        </div>

        <!-- Grid -->
        <div class="grid grid-cols-7 bg-slate-900/50">
          <div v-for="(day, index) in daysInMonth" :key="index"
               class="aspect-square sm:aspect-[4/3] border-b border-r border-white/5 relative group p-1 sm:p-2 transition-colors"
               :class="{
                 'bg-black/20': !day.day,
                 'hover:bg-white/5 cursor-pointer': day.state?.status === 'missed' || day.state?.status === 'completed',
                 'opacity-50': day.state === 'future' || day.state === 'no-challenge'
               }"
               @click="selectDay(day)">
            
            <template v-if="day.day">
              <span class="absolute top-2 left-2 text-xs font-bold z-20"
                    :class="(day.dateStr === new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]) ? 'text-blue-400 font-black' : 'text-slate-500'">
                {{ day.day }}
              </span>

              <!-- Completed State -->
              <div v-if="day.state?.status === 'completed'" class="w-full h-full relative rounded-xl overflow-hidden border-2 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                   :class="day.state.results.victory ? 'border-green-500/50' : 'border-red-500/50'">
                <img :src="resolveAsset(day.state.challenge.vehicle.imageUrl.url)" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                <div class="absolute inset-0 bg-gradient-to-t" :class="day.state.results.victory ? 'from-green-900/80' : 'from-red-900/80'"></div>
                <div class="absolute bottom-1 right-2 text-white flex gap-1">
                  <svg v-if="day.state.results.victory" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </div>
                <!-- Overlay for View Result -->
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <span class="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider text-center px-1">
                    {{ t('daily.viewResult') }}
                  </span>
                </div>
              </div>

              <!-- Missed / Playable State -->
              <div v-else-if="day.state?.status === 'missed'" class="w-full h-full relative rounded-xl overflow-hidden border border-blue-500/30 bg-blue-500/5 group-hover:bg-blue-500/20 flex flex-col items-center justify-center transition-all">
                <span class="text-3xl sm:text-4xl font-black text-blue-500/50 group-hover:text-blue-400 group-hover:scale-110 transition-all">?</span>
                <div class="absolute inset-x-0 bottom-0 py-1 bg-blue-600 text-center text-[8px] sm:text-[10px] font-black text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity translate-y-full group-hover:translate-y-0 overflow-hidden">
                  {{ t('daily.playMissed') }}
                </div>
              </div>

            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
</style>
