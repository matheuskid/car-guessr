<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedModeId = ref(null)

const gameModes = [
  { 
    id: 'easy', 
    name: 'Fácil', 
    description: 'Carros populares e marcas conhecidas. Imagens mais claras.',
    color: 'from-green-500 to-emerald-600',
    path: '/easy',
    wip: false
  },
  { 
    id: 'medium', 
    name: 'Médio', 
    description: 'Uma mistura de clássicos e modernos com detalhes desafiadores.',
    color: 'from-blue-500 to-indigo-600',
    path: '/medium',
    wip: false
  },
  { 
    id: 'hard', 
    name: 'Difícil', 
    description: 'Apenas para especialistas. Modelos raros e protótipos.',
    color: 'from-purple-600 to-pink-600',
    path: '/hard',
    wip: false
  },
  { 
    id: 'daily', 
    name: 'Diário', 
    description: 'Um desafio novo a cada 24 horas. Teste sua constância.',
    color: 'from-amber-400 to-orange-500',
    path: '/daily',
    wip: true
  },
  { 
    id: 'free', 
    name: 'Passeio Livre', 
    description: 'Explore toda a nossa coleção sem limites ou restrições.',
    color: 'from-slate-700 to-slate-900',
    path: '/free-play',
    wip: false
  }
]

const toggleMode = (modeId) => {
  if (selectedModeId.value === modeId) {
    selectedModeId.value = null
  } else {
    selectedModeId.value = modeId
  }
}

const goToMode = (path) => {
  router.push(path)
}
</script>

<template>
  <main class="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-900 relative">
    <div v-for="mode in gameModes" :key="mode.id" 
         @click="toggleMode(mode.id)"
         class="group relative flex flex-col items-center justify-center p-6 transition-all duration-700 ease-in-out overflow-hidden border-b md:border-b-0 md:border-r border-white/5 last:border-0"
         :class="[
           mode.wip ? 'cursor-not-allowed' : 'cursor-pointer',
           selectedModeId === mode.id ? 'flex-[4] md:flex-[2.5]' : 'flex-1 md:hover:flex-[2]'
         ]">
      
      <!-- Background Gradient -->
      <div class="absolute inset-0 bg-gradient-to-b opacity-40 transition-opacity duration-500" 
           :class="[mode.color, selectedModeId === mode.id ? 'opacity-90' : 'group-hover:opacity-80']"></div>
      
      <!-- WIP Overlay -->
      <div v-if="mode.wip" class="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center pointer-events-none">
        <div class="rotate-12 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1 rounded-full">
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-white">Em breve</span>
        </div>
      </div>

      <!-- Content -->
      <div class="relative z-20 flex flex-col items-center text-center w-full transition-all duration-500"
           :class="selectedModeId === mode.id ? '-translate-y-4 md:-translate-y-8' : 'group-hover:-translate-y-8'">
        <h2 class="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-2 transition-transform duration-500"
            :class="selectedModeId === mode.id ? 'scale-110' : 'group-hover:scale-110'">
          {{ mode.name }}
        </h2>
        
        <!-- Revealable Description & Button -->
        <div class="max-w-xs transition-all duration-500 delay-75"
             :class="selectedModeId === mode.id ? 'opacity-100 translate-y-0 h-auto' : 'opacity-0 translate-y-10 h-0 md:h-auto md:group-hover:opacity-100 md:group-hover:translate-y-0'">
          <p class="text-white/80 text-sm font-medium mb-6 md:mb-8 leading-relaxed">
            {{ mode.description }}
          </p>
          
          <button 
            v-if="!mode.wip" 
            @click.stop="goToMode(mode.path)"
            class="px-8 py-3 bg-white text-slate-900 font-black rounded-full hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105 shadow-xl uppercase tracking-wider text-sm"
          >
            JOGAR AGORA
          </button>
          <div v-else class="px-8 py-3 bg-white/10 text-white/40 font-black rounded-full border border-white/10 uppercase tracking-wider text-sm cursor-not-allowed">
            BLOQUEADO
          </div>
        </div>
      </div>

      <!-- Background Image/Icon Placeholder -->
      <div class="absolute -bottom-10 -right-10 text-white/5 text-[150px] font-black pointer-events-none transition-colors duration-500"
           :class="selectedModeId === mode.id ? 'text-white/10' : 'group-hover:text-white/10'">
        {{ mode.name[0] }}
      </div>
    </div>
  </main>
</template>
