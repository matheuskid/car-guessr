<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  imageUrl: {
    type: String,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const lastTouchDistance = ref(0)
const isDragging = ref(false)
const lastMousePos = ref({ x: 0, y: 0 })

const resetZoom = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    resetZoom()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const handleClose = () => {
  emit('close')
}

// Mouse events
const onWheel = (e) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.2 : 0.2
  const newScale = Math.min(Math.max(scale.value + delta, 0.5), 5)
  scale.value = newScale
}

const onMouseDown = (e) => {
  isDragging.value = true
  lastMousePos.value = { x: e.clientX, y: e.clientY }
}

const onMouseMove = (e) => {
  if (!isDragging.value) return
  const dx = e.clientX - lastMousePos.value.x
  const dy = e.clientY - lastMousePos.value.y
  translateX.value += dx
  translateY.value += dy
  lastMousePos.value = { x: e.clientX, y: e.clientY }
}

const onMouseUp = () => {
  isDragging.value = false
}

// Touch events
const onTouchStart = (e) => {
  if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    )
    lastTouchDistance.value = dist
  } else if (e.touches.length === 1) {
    lastMousePos.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    isDragging.value = true
  }
}

const onTouchMove = (e) => {
  if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    )
    const delta = (dist - lastTouchDistance.value) * 0.01
    const newScale = Math.min(Math.max(scale.value + delta, 0.5), 5)
    scale.value = newScale
    lastTouchDistance.value = dist
  } else if (e.touches.length === 1 && isDragging.value) {
    const dx = e.touches[0].clientX - lastMousePos.value.x
    const dy = e.touches[0].clientY - lastMousePos.value.y
    translateX.value += dx
    translateY.value += dy
    lastMousePos.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
}

const onTouchEnd = () => {
  isDragging.value = false
  lastTouchDistance.value = 0
}

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md" @click.self="handleClose">
      <!-- Close Button -->
      <button 
        @click="handleClose" 
        class="absolute top-6 right-6 z-[110] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <!-- Zoom Info -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-[110] px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm pointer-events-none">
        Zoom: {{ Math.round(scale * 100) }}%
      </div>

      <!-- Image Container -->
      <div 
        class="w-full h-full flex items-center justify-center overflow-hidden cursor-move"
        @wheel="onWheel"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseUp"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <img 
          :src="imageUrl" 
          alt="Car Fullscreen" 
          class="max-w-full max-h-full object-contain transition-transform duration-75 select-none pointer-events-none"
          :style="{
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`
          }"
        />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
