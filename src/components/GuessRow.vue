<script setup>
import { computed } from 'vue'

const props = defineProps({
  guess: {
    type: Object,
    required: true
  }
})

// Helper to determine tailwind classes based on match status
// status can be: 'correct', 'partial', 'incorrect'
const getStatusClass = (status) => {
  switch (status) {
    case 'correct':
      return 'bg-green-500 text-white border-green-600'
    case 'partial':
      return 'bg-yellow-500 text-white border-yellow-600'
    case 'incorrect':
    default:
      return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
  }
}
</script>

<template>
  <div class="flex gap-2 w-full">
    <!-- Make -->
    <div 
      class="flex-1 flex items-center justify-center p-3 text-sm md:text-base font-bold rounded-lg border shadow-sm transition-colors duration-500"
      :class="getStatusClass(guess.makeStatus)"
    >
      {{ guess.make }}
    </div>

    <!-- Model -->
    <div 
      class="flex-1 flex items-center justify-center p-3 text-sm md:text-base font-bold rounded-lg border shadow-sm transition-colors duration-500 delay-100"
      :class="getStatusClass(guess.modelStatus)"
    >
      {{ guess.model }}
    </div>

    <!-- Country -->
    <div 
      class="flex-1 flex items-center justify-center p-3 text-sm md:text-base font-bold rounded-lg border shadow-sm transition-colors duration-500 delay-200"
      :class="getStatusClass(guess.countryStatus)"
    >
      {{ guess.country }}
    </div>
  </div>
</template>
