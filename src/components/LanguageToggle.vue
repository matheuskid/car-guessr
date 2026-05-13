<script setup>
import { useI18n } from '../i18n/useI18n.js'

const { locale, toggleLocale } = useI18n()
</script>

<template>
  <button
    @click="toggleLocale"
    class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border
           text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700
           hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
    :title="locale === 'en' ? 'Mudar para Português' : 'Switch to English'"
  >
    <img
      :src="locale === 'en' ? 'https://flagcdn.com/w40/us.png' : 'https://flagcdn.com/w40/br.png'"
      class="w-5 h-auto rounded-sm shadow-sm"
      :alt="locale === 'en' ? 'English' : 'Português'"
    />
    <span class="hidden sm:inline">{{ locale === 'en' ? 'EN' : 'PT' }}</span>
  </button>
</template>
