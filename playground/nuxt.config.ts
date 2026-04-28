export default defineNuxtConfig({
  modules: ['../src/module'],

  devtools: { enabled: true },

  css: ['~/assets/css/playground.css'],
  compatibilityDate: '2025-01-01',

  confirmDialog: {
    autoMount: true,
    closeOnBackdropClick: false,
    escapeToCancel: true,
  },
})
