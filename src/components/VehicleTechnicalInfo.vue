<script setup>
defineProps({
  vehicle: {
    type: Object,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div v-if="isVisible && vehicle" class="w-full mt-6 p-6 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-fade-in shrink-0">
    <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-1">
      {{ vehicle.make }} {{ vehicle.model }}
    </h2>
    <p class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
      📍 {{ vehicle.country }}
    </p>
    <div class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
      <p v-if="vehicle.year">Ano: {{ vehicle.year }}</p>
      <p v-if="vehicle.gen" class="font-medium">Geração: {{ vehicle.gen }}</p>
      <p class="mt-2 text-xs opacity-50 italic">Descrição técnica disponível em breve.</p>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
