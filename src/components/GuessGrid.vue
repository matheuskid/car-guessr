<script setup>
import GuessRow from './GuessRow.vue'

const props = defineProps({
  guesses: {
    type: Array,
    required: true
  },
  maxGuesses: {
    type: Number,
    default: 5
  }
})
</script>

<template>
  <div class="flex flex-col gap-2 w-full max-w-2xl mx-auto">
    <!-- Header -->
    <div class="flex gap-2 w-full mb-1 px-2">
      <div class="flex-1 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Marca</div>
      <div class="flex-1 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Modelo</div>
      <div class="flex-1 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">País</div>
    </div>

    <!-- Guesses -->
    <GuessRow 
      v-for="(guess, index) in guesses" 
      :key="index" 
      :guess="guess" 
    />

    <!-- Empty Slots -->
    <div 
      v-for="i in Math.max(0, maxGuesses - guesses.length)" 
      :key="'empty-' + i"
      class="flex gap-2 w-full opacity-50"
    >
      <div class="flex-1 h-12 bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg"></div>
      <div class="flex-1 h-12 bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg"></div>
      <div class="flex-1 h-12 bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg"></div>
    </div>
  </div>
</template>
