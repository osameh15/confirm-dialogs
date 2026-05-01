<template>
  <div
    class="page-shell"
    :data-theme="theme"
  >
    <div class="container">
      <header class="test-card">
        <div class="brand-row">
          <div class="brand-text">
            <h1>nuxt-confirm-dialog</h1>
            <p class="subtitle">
              A modern Nuxt 3 / 4 confirm dialog module — bundled fonts, RTL-aware, full TypeScript.
            </p>
          </div>
          <button
            type="button"
            class="theme-toggle"
            :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
            @click="toggleTheme"
          >
            <svg
              v-if="theme === 'dark'"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            ><circle
              cx="12"
              cy="12"
              r="5"
            /><line
              x1="12"
              y1="1"
              x2="12"
              y2="3"
            /><line
              x1="12"
              y1="21"
              x2="12"
              y2="23"
            /><line
              x1="4.22"
              y1="4.22"
              x2="5.64"
              y2="5.64"
            /><line
              x1="18.36"
              y1="18.36"
              x2="19.78"
              y2="19.78"
            /><line
              x1="1"
              y1="12"
              x2="3"
              y2="12"
            /><line
              x1="21"
              y1="12"
              x2="23"
              y2="12"
            /><line
              x1="4.22"
              y1="19.78"
              x2="5.64"
              y2="18.36"
            /><line
              x1="18.36"
              y1="5.64"
              x2="19.78"
              y2="4.22"
            /></svg>
            <svg
              v-else
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            ><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            <span>{{ theme === 'dark' ? 'Light' : 'Dark' }}</span>
          </button>
        </div>
        <nav class="page-nav">
          <NuxtLink to="/">Quick demo</NuxtLink>
          <NuxtLink to="/test">Test page</NuxtLink>
        </nav>
      </header>

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dialog = useConfirmDialog()
const theme = ref<'dark' | 'light'>(dialog.theme.value)

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  dialog.setTheme(theme.value)
}
</script>
