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
  }
})
</script>

<template>
  <div class="flex h-14 w-full text-white font-bold tracking-wide shrink-0 z-20">
    <div class="flex-1 flex items-center justify-center bg-blue-600 shadow-lg" style="clip-path: polygon(0 0, 100% 0, 92% 100%, 0 100%); margin-right: -5%;">
      ROUND <span class="text-2xl ml-2">{{ currentRound }}/{{ maxRounds }}</span>
    </div>
    <div class="flex-1 flex items-center justify-center bg-indigo-600 shadow-lg" style="clip-path: polygon(8% 0, 100% 0, 100% 100%, 0 100%);">
      SCORE <span class="text-2xl ml-2">{{ score }}</span>
    </div>
  </div>
</template>
