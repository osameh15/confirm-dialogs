<template>
  <!-- Dialog Types -->
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
        ><circle
          cx="12"
          cy="12"
          r="10"
        /><line
          x1="12"
          y1="8"
          x2="12"
          y2="12"
        /><line
          x1="12"
          y1="16"
          x2="12.01"
          y2="16"
        /></svg>
      </span>
      Dialog Types
    </h2>
    <div class="grid cols-4">
      <button
        class="btn btn-success"
        @click="showSuccess"
      >
        Success
      </button>
      <button
        class="btn btn-warning"
        @click="showWarning"
      >
        Warning
      </button>
      <button
        class="btn btn-error"
        @click="showError"
      >
        Error / Delete
      </button>
      <button
        class="btn btn-info"
        @click="showInfo"
      >
        Info
      </button>
    </div>
  </section>

  <!-- Button Configurations -->
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
        ><rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
        /></svg>
      </span>
      Button Configurations
    </h2>
    <div class="grid cols-3">
      <button
        class="btn btn-outline"
        @click="showOneButton"
      >
        1 button
      </button>
      <button
        class="btn btn-outline"
        @click="showTwoButtons"
      >
        2 buttons (default)
      </button>
      <button
        class="btn btn-outline"
        @click="showThreeButtons"
      >
        3 buttons
      </button>
    </div>
  </section>

  <!-- Real-world examples -->
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
        ><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      </span>
      Real-world Examples
    </h2>
    <div class="grid cols-3">
      <button
        class="btn btn-outline"
        @click="rwDelete"
      >
        Delete record
      </button>
      <button
        class="btn btn-outline"
        @click="rwLogout"
      >
        Logout
      </button>
      <button
        class="btn btn-outline"
        @click="rwOverwrite"
      >
        Overwrite file
      </button>
      <button
        class="btn btn-outline"
        @click="rwUnsaved"
      >
        Unsaved changes
      </button>
      <button
        class="btn btn-outline"
        @click="rwPublish"
      >
        Publish to production
      </button>
      <button
        class="btn btn-outline"
        @click="rwReset"
      >
        Factory reset
      </button>
    </div>
  </section>

  <!-- Persian / RTL -->
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
        ><circle
          cx="12"
          cy="12"
          r="10"
        /><line
          x1="2"
          y1="12"
          x2="22"
          y2="12"
        /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
      </span>
      Persian / RTL test (Shabnam font)
    </h2>
    <p class="hint">
      Dialogs whose title, message, or warning text contain Arabic /
      Persian script auto-detect and switch to <code>dir="rtl"</code>.
      Layout flips and Shabnam renders the text.
    </p>
    <div class="grid cols-2">
      <button
        class="btn btn-error"
        @click="rtlDelete"
      >
        حذف فایل
      </button>
      <button
        class="btn btn-warning"
        @click="rtlSave"
      >
        ذخیره تغییرات
      </button>
    </div>
  </section>

  <div
    v-if="lastEvent !== null"
    class="result-box"
    style="max-width: 1080px; margin: 0 auto;"
  >
    Last event: <code>{{ lastEvent }}</code>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dialog = useConfirmDialog()
const lastEvent = ref<string | null>(null)

const wrap = async (label: string, fn: () => Promise<unknown>) => {
  const result = await fn()
  lastEvent.value = `${label} → ${JSON.stringify(result)}`
}

const showSuccess = () =>
  wrap('confirmSuccess', () =>
    dialog.confirmSuccess('Operation successful', 'Your task completed without errors.'))

const showWarning = () =>
  wrap('confirmAction', () =>
    dialog.confirmAction('Are you sure?', 'Please review your input before continuing.'))

const showError = () =>
  wrap('confirmDelete', () => dialog.confirmDelete('this record'))

const showInfo = () =>
  wrap('confirmInfo', () =>
    dialog.confirmInfo('Information', 'Here is some information you should know.'))

const showOneButton = () =>
  wrap('1-button', () => dialog.show({
    type: 'info',
    title: 'Notice',
    message: 'This dialog has only one button — an OK acknowledgement.',
    buttons: [{ text: 'OK', action: 'confirm', variant: 'flat', color: 'info' }],
  }))

const showTwoButtons = () =>
  wrap('2-button', () => dialog.show({
    type: 'warning',
    title: 'Standard confirm',
    message: 'This is the default 2-button (Cancel / Confirm) layout.',
  }))

const showThreeButtons = () =>
  wrap('3-button', () => dialog.show({
    type: 'info',
    title: 'Save changes?',
    message: 'You have unsaved work in this document.',
    buttons: [
      { text: 'Cancel', action: 'cancel', variant: 'outlined', color: 'default' },
      { text: 'Don\'t save', action: 'discard', variant: 'flat', color: 'default' },
      { text: 'Save', action: 'save', variant: 'flat', color: 'info' },
    ],
  }))

const rwDelete = () =>
  wrap('delete-user', () => dialog.confirmDelete('user "alice"'))

const rwLogout = () =>
  wrap('logout', () => dialog.confirmAction(
    'Sign out',
    'Are you sure you want to sign out of your account?',
    'Sign out', 'Stay'))

const rwOverwrite = () =>
  wrap('overwrite', () => dialog.show({
    type: 'warning',
    title: 'File already exists',
    message: 'A file named "report.pdf" already exists in this folder.',
    warningText: 'The existing file will be replaced.',
    confirmText: 'Overwrite',
    cancelText: 'Keep both',
  }))

const rwUnsaved = () =>
  wrap('unsaved', () => dialog.show({
    type: 'warning',
    title: 'Unsaved changes',
    message: 'Your edits will be lost if you leave this page.',
    confirmText: 'Leave page',
    cancelText: 'Stay',
  }))

const rwPublish = () =>
  wrap('publish', () => dialog.confirmSuccess(
    'Publish to production?',
    'This release will be visible to all users immediately.',
    'Publish', 'Cancel'))

const rwReset = () =>
  wrap('reset', () => dialog.show({
    type: 'error',
    title: 'Factory reset',
    message: 'All settings, user data, and configuration will be erased.',
    warningText: 'This is irreversible — there is no undo.',
    confirmText: 'Reset everything',
    cancelText: 'Cancel',
  }))

const rtlDelete = () =>
  wrap('rtl-delete', () => dialog.show({
    type: 'error',
    title: 'حذف فایل',
    message: 'آیا از حذف این فایل اطمینان دارید؟',
    warningText: 'این عملیات قابل بازگشت نیست.',
    confirmText: 'حذف',
    cancelText: 'انصراف',
  }))

const rtlSave = () =>
  wrap('rtl-save', () => dialog.show({
    type: 'warning',
    title: 'ذخیره تغییرات',
    message: 'تغییرات اعمال‌شده روی این سند را ذخیره می‌کنید؟',
    confirmText: 'ذخیره',
    cancelText: 'انصراف',
  }))
</script>
