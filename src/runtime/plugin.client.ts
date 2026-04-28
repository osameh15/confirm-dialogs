import { createApp, h } from 'vue'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import ConfirmDialogContainer from './components/ConfirmDialogContainer.vue'

export default defineNuxtPlugin(() => {
  const cfg = useRuntimeConfig().public.confirmDialog as {
    closeOnBackdropClick: boolean
    escapeToCancel: boolean
  }

  const root = document.createElement('div')
  root.id = 'nuxt-confirm-dialog-root'
  document.body.appendChild(root)

  const app = createApp({
    render: () => h(ConfirmDialogContainer, {
      closeOnBackdropClick: cfg.closeOnBackdropClick,
      escapeToCancel: cfg.escapeToCancel,
    }),
  })
  app.mount(root)
})
