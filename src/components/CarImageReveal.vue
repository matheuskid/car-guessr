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
const emit = defineEmits(['zoom'])

const handleImageClick = () => {
  emit('zoom')
}
</script>

<template>
  <div 
    class="relative w-full h-full bg-slate-200 dark:bg-slate-800 rounded-xl lg:rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 cursor-zoom-in"
    @click="handleImageClick"
  >
    <!-- Image -->
    <img 
      :src="imageUrl" 
      alt="Car to guess" 
      draggable="false"
      :class="[
        'w-full h-full transition-transform duration-1000 ease-in-out select-none object-contain',
      ]"
      :style="{
        transform: `scale(${zoomLevel})`,
        transformOrigin: transformOrigin
      }"
    />
    
    <!-- Info overlay (tap to zoom hint) -->
    <div class="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/30 backdrop-blur-sm text-white/70 lg:hidden">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
    </div>
  </div>
</template>
