<script setup>
import { useI18n } from '../i18n/useI18n.js'
const { t } = useI18n()
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center bg-slate-900 text-white p-6">
    <div class="max-w-md w-full text-center space-y-6">
      <h2 class="text-5xl font-black uppercase tracking-tighter">{{ t('wip.title') }}</h2>
      <p class="text-slate-400">{{ t('wip.description') }}</p>
      <router-link to="/" class="inline-block px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-blue-500 hover:text-white transition-all uppercase tracking-wider text-sm">
        {{ t('wip.backToMenu') }}
      </router-link>
    </div>
  </div>
</template>
