<template>
  <section class="test-card">
    <h2>
      <span class="section-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
      </span>
      Convenience methods
    </h2>
    <p class="hint">
      <code>confirmDelete</code>, <code>confirmAction</code>,
      <code>confirmInfo</code>, <code>confirmSuccess</code> all return
      <code>Promise&lt;boolean&gt;</code> — <code>true</code> if the user
      confirms, <code>false</code> otherwise.
    </p>
    <div class="grid cols-4">
      <button
        class="btn btn-success"
        @click="onSuccess"
      >
        confirmSuccess()
      </button>
      <button
        class="btn btn-warning"
        @click="onAction"
      >
        confirmAction()
      </button>
      <button
        class="btn btn-error"
        @click="onDelete"
      >
        confirmDelete()
      </button>
      <button
        class="btn btn-info"
        @click="onInfo"
      >
        confirmInfo()
      </button>
    </div>
    <div
      v-if="lastResult !== null"
      class="result-box"
    >
      Last result: <code>{{ String(lastResult) }}</code>
    </div>
  </section>

  <section class="test-card">
    <h2>
      <span class="section-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
      </span>
      Custom <code>show()</code>
    </h2>
    <p class="hint">
      <code>useConfirmDialog().show({ ... })</code> resolves with the
      action name (<code>'confirm'</code>, <code>'cancel'</code>, or any
      custom action you defined).
    </p>
    <div class="grid cols-3">
      <button
        class="btn btn-outline"
        @click="onCustomShow"
      >
        With warningText
      </button>
      <button
        class="btn btn-outline"
        @click="onThreeButtons"
      >
        3 custom buttons
      </button>
      <button
        class="btn btn-outline"
        @click="onPersian"
      >
        Persian (RTL)
      </button>
    </div>
    <div
      v-if="lastAction !== null"
      class="result-box"
    >
      Last action: <code>{{ lastAction }}</code>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dialog = useConfirmDialog()

const lastResult = ref<boolean | null>(null)
const lastAction = ref<string | null>(null)

const onSuccess = async () => {
  lastResult.value = await dialog.confirmSuccess(
    'All set',
    'Your changes have been applied. Continue to the next step?',
  )
}
const onAction = async () => {
  lastResult.value = await dialog.confirmAction(
    'Apply changes',
    'Do you want to apply your changes? You can undo from settings.',
  )
}
const onDelete = async () => {
  lastResult.value = await dialog.confirmDelete('the user record')
}
const onInfo = async () => {
  lastResult.value = await dialog.confirmInfo(
    'Cookie usage',
    'This site uses cookies to improve your experience. Continue?',
  )
}

const onCustomShow = async () => {
  lastAction.value = await dialog.show({
    type: 'warning',
    title: 'Unsaved changes',
    message: 'You have unsaved changes that will be lost.',
    warningText: 'Save your work before leaving.',
    confirmText: 'Discard',
    cancelText: 'Keep editing',
  })
}

const onThreeButtons = async () => {
  lastAction.value = await dialog.show({
    type: 'info',
    title: 'Save changes?',
    message: 'You\'ve made edits to this document.',
    buttons: [
      { text: 'Cancel', action: 'cancel', variant: 'outlined', color: 'default' },
      { text: 'Don\'t save', action: 'discard', variant: 'flat', color: 'default' },
      { text: 'Save', action: 'save', variant: 'flat', color: 'info' },
    ],
  })
}

const onPersian = async () => {
  lastAction.value = await dialog.show({
    type: 'error',
    title: 'حذف فایل',
    message: 'آیا از حذف این فایل اطمینان دارید؟',
    warningText: 'این عملیات قابل بازگشت نیست.',
    confirmText: 'حذف',
    cancelText: 'انصراف',
  })
}
</script>
