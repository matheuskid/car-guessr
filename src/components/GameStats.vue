<script setup>
defineProps({
  currentRound: {
    type: Number,
    required: true
  },
  maxRounds: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  roundResults: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="flex h-14 w-full text-white font-bold tracking-wide shrink-0 z-20">
    <!-- Round indicator -->
    <div class="flex-1 flex items-center justify-center gap-2 bg-blue-600 shadow-lg" style="clip-path: polygon(0 0, 100% 0, 92% 100%, 0 100%); margin-right: -5%;">
      <span class="text-xs uppercase tracking-wider opacity-80 hidden sm:inline">Round</span>
      <span class="text-2xl tabular-nums">{{ currentRound }}/{{ maxRounds }}</span>
    </div>

    <!-- Score -->
    <div class="flex-1 flex items-center justify-center gap-2 bg-indigo-600 shadow-lg" style="clip-path: polygon(8% 0, 100% 0, 100% 100%, 0 100%);">
      <span class="text-xs uppercase tracking-wider opacity-80 hidden sm:inline">Score</span>
      <span class="text-2xl tabular-nums transition-all duration-300">{{ score }}</span>
    </div>
  </div>
</template>
