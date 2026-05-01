<template>
  <Teleport
    to="body"
    :disabled="!teleport"
  >
    <ConfirmDialog
      v-if="currentDialog"
      :model-value="currentDialog.visible"
      :type="currentDialog.type"
      :title="currentDialog.title"
      :message="currentDialog.message"
      :warning-text="currentDialog.warningText"
      :confirm-text="currentDialog.confirmText"
      :cancel-text="currentDialog.cancelText"
      :buttons="currentDialog.buttons"
      :close-on-backdrop-click="closeOnBackdropClick"
      :escape-to-cancel="escapeToCancel"
      :theme="effectiveTheme"
      @confirm="onConfirm"
      @cancel="onCancel"
      @action="onAction"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { useConfirmDialog } from '../composables/useConfirmDialog'

const props = withDefaults(
  defineProps<{
    /**
     * Render into `document.body` via `<Teleport>` so the overlay always
     * covers the viewport even if the container is mounted inside an
     * ancestor that creates a containing block. Defaults to `true`.
     */
    teleport?: boolean
    /** Click on the dim backdrop cancels the dialog. Defaults to `false`. */
    closeOnBackdropClick?: boolean
    /** Pressing Escape cancels the dialog. Defaults to `true`. */
    escapeToCancel?: boolean
    /**
     * Override the global theme for this container. When set, takes
     * precedence over `useConfirmDialog().theme`. Defaults to following
     * the global theme (which is `'dark'` until changed via `setTheme`).
     */
    theme?: 'dark' | 'light'
  }>(),
  {
    teleport: true,
    closeOnBackdropClick: false,
    escapeToCancel: true,
    theme: undefined,
  },
)

const { currentDialog, confirm, cancel, action, theme: globalTheme } = useConfirmDialog()

const effectiveTheme = computed<'dark' | 'light'>(() => props.theme ?? globalTheme.value)

const onConfirm = (): void => confirm()
const onCancel = (): void => cancel()
const onAction = (name: string): void => action(name)
</script>
