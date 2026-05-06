<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  imageUrl: {
    type: String,
    required: true
  },
  revealed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 5
  },
  zoomEnabled: {
    type: Boolean,
    default: true
  }
})

// Generate a random focal point once when the component is mounted
const focalX = ref(50)
const focalY = ref(50)

onMounted(() => {
  // X: 20% a 80% (evita os 20% das bordas laterais)
  focalX.value = Math.floor(Math.random() * 60) + 20
  
  // Y: 30% a 70% (evita os 30% das bordas superiores/inferiores, mantendo mais ao centro)
  focalY.value = Math.floor(Math.random() * 50) + 25
})

const transformOrigin = computed(() => `${focalX.value}% ${focalY.value}%`)

const zoomLevel = computed(() => {
  if (props.revealed || !props.zoomEnabled) return 1
  
  /* Logica antiga de zoom (comentada conforme solicitado)
  const baseZoom = 4 // Starting high zoom
  const step = (baseZoom - 1) / props.maxAttempts
  return Math.max(1, baseZoom - (props.attempts * step))
  */
  
  return 1 // Retornando 1 pois o zoom está desativado para este modo
})
</script>

<template>
  <div class="relative w-full h-full bg-slate-200 dark:bg-slate-800 rounded-xl lg:rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
    <!-- Image -->
    <img 
      :src="imageUrl" 
      alt="Car to guess" 
      draggable="false"
      :class="[
        'w-full h-full transition-transform duration-1000 ease-in-out pointer-events-none select-none',
        revealed ? 'object-contain' : 'object-cover'
      ]"
      :style="{
        transform: `scale(${zoomLevel})`,
        transformOrigin: transformOrigin
      }"
    />
    
    <!-- Optional: a small subtle crosshair icon could go here if you wanted to show where the focus is, but keeping it clean is better -->
  </div>
</template>
