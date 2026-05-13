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
    case 'partial_group':
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
      class="flex-1 flex flex-col items-center justify-center p-2 text-sm md:text-base font-bold rounded-lg border shadow-sm transition-all duration-500 delay-100 gap-1"
      :class="getStatusClass(guess.modelStatus)"
    >
      <span class="text-center leading-tight">{{ guess.model }}</span>
      <div class="flex gap-1 flex-wrap justify-center">
        <span v-if="guess.gen" class="tag tag-gen">{{ guess.gen }}</span>
        <span v-if="guess.year" class="tag tag-year">{{ guess.year }}</span>
      </div>
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

<style scoped>
.tag {
  font-size: 9px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1;
}

.tag-year {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.tag-gen {
  background: rgba(0, 0, 0, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* If the row is neutral (incorrect), tags can have more vivid colors */
.bg-slate-200 .tag-year, .bg-slate-700 .tag-year {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.3);
}

.bg-slate-200 .tag-gen, .bg-slate-700 .tag-gen {
  background: rgba(168, 85, 247, 0.2);
  color: #a78bfa;
  border-color: rgba(168, 85, 247, 0.3);
}
</style>
