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
      @confirm="onConfirm"
      @cancel="onCancel"
      @action="onAction"
    />
  </Teleport>
</template>

<script setup lang="ts">
import ConfirmDialog from './ConfirmDialog.vue'
import { useConfirmDialog } from '../composables/useConfirmDialog'

withDefaults(
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
  }>(),
  {
    teleport: true,
    closeOnBackdropClick: false,
    escapeToCancel: true,
  },
)

const { currentDialog, confirm, cancel, action } = useConfirmDialog()

const onConfirm = (): void => confirm()
const onCancel = (): void => cancel()
const onAction = (name: string): void => action(name)
</script>
