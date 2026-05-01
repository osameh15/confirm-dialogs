<template>
  <transition name="dialog-fade">
    <div
      v-if="isVisible"
      class="dialog-overlay"
      :data-theme="theme"
      role="presentation"
      @mousedown.self="onBackdropClick"
    >
      <transition name="dialog-pop">
        <div
          v-if="isVisible"
          ref="cardRef"
          :class="['dialog-card', `dialog-${type}`]"
          :dir="direction"
          role="alertdialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="messageId"
          tabindex="-1"
          @keydown.esc.stop.prevent="onEscape"
        >
          <div :class="['dialog-icon-circle', `dialog-icon-${type}`]">
            <span
              class="dialog-icon"
              :style="{ color: iconColor }"
            >
              <component :is="iconComponent" />
            </span>
          </div>

          <div class="dialog-body">
            <h3
              :id="titleId"
              class="dialog-title"
            >
              {{ title }}
            </h3>
            <p
              :id="messageId"
              class="dialog-message"
            >
              {{ message }}
            </p>
            <p
              v-if="warningText"
              class="dialog-warning-text"
            >
              {{ warningText }}
            </p>

            <div :class="['dialog-actions', `actions-${resolvedButtons.length}`]">
              <button
                v-for="(button, index) in resolvedButtons"
                :key="`${index}-${button.text}`"
                type="button"
                :class="getButtonClass(button)"
                @click="onButtonClick(button)"
              >
                {{ button.text }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, h, nextTick, onMounted, onBeforeUnmount } from 'vue'
import type { FunctionalComponent } from 'vue'

type DialogType = 'success' | 'warning' | 'error' | 'info'

interface DialogButton {
  text: string
  action?: string
  variant?: 'flat' | 'outlined'
  color?: DialogType | 'default'
}

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    type?: DialogType
    title: string
    message: string
    warningText?: string | null
    confirmText?: string
    cancelText?: string
    buttons?: DialogButton[] | null
    closeOnBackdropClick?: boolean
    escapeToCancel?: boolean
    /** Visual theme — `'dark'` (default) or `'light'`. */
    theme?: 'dark' | 'light'
  }>(),
  {
    modelValue: false,
    type: 'warning',
    warningText: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    buttons: null,
    theme: 'dark',
    closeOnBackdropClick: false,
    escapeToCancel: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [boolean]
  'confirm': []
  'cancel': []
  'action': [string]
}>()

const isVisible = ref(props.modelValue)
const cardRef = ref<HTMLElement | null>(null)
const previousFocus = ref<HTMLElement | null>(null)

const titleId = `confirm-dialog-title-${Math.random().toString(36).slice(2, 9)}`
const messageId = `confirm-dialog-message-${Math.random().toString(36).slice(2, 9)}`

watch(() => props.modelValue, (v) => {
  isVisible.value = v
})

watch(isVisible, async (v) => {
  emit('update:modelValue', v)
  if (v) {
    await nextTick()
    previousFocus.value = (document.activeElement as HTMLElement) ?? null
    cardRef.value?.focus()
  }
  else if (previousFocus.value) {
    previousFocus.value.focus()
    previousFocus.value = null
  }
})

const RTL_SCRIPT = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻾]/
const direction = computed<'rtl' | 'ltr'>(() => {
  const allText = [props.title, props.message, props.warningText ?? ''].join(' ')
  return RTL_SCRIPT.test(allText) ? 'rtl' : 'ltr'
})

const iconColor = computed(() => ({
  success: '#30e0a1',
  warning: '#FFD700',
  error: '#DC143C',
  info: '#00FFFF',
}[props.type]))

const svgAttrs = {
  'width': 32,
  'height': 32,
  'viewBox': '0 0 24 24',
  'fill': 'none',
  'stroke': 'currentColor',
  'stroke-width': 2,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'aria-hidden': 'true',
}

const CheckCircle: FunctionalComponent = () =>
  h('svg', svgAttrs, [
    h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
    h('polyline', { points: '22 4 12 14.01 9 11.01' }),
  ])

const Alert: FunctionalComponent = () =>
  h('svg', svgAttrs, [
    h('path', {
      d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
    }),
    h('line', { x1: 12, y1: 9, x2: 12, y2: 13 }),
    h('line', { x1: 12, y1: 17, x2: 12.01, y2: 17 }),
  ])

const Trash: FunctionalComponent = () =>
  h('svg', svgAttrs, [
    h('polyline', { points: '3 6 5 6 21 6' }),
    h('path', { d: 'M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }),
    h('line', { x1: 10, y1: 11, x2: 10, y2: 17 }),
    h('line', { x1: 14, y1: 11, x2: 14, y2: 17 }),
  ])

const InfoIcon: FunctionalComponent = () =>
  h('svg', svgAttrs, [
    h('circle', { cx: 12, cy: 12, r: 10 }),
    h('line', { x1: 12, y1: 16, x2: 12, y2: 12 }),
    h('line', { x1: 12, y1: 8, x2: 12.01, y2: 8 }),
  ])

const iconComponent = computed(() => ({
  success: CheckCircle,
  warning: Alert,
  error: Trash,
  info: InfoIcon,
}[props.type]))

const resolvedButtons = computed<DialogButton[]>(() => {
  if (props.buttons && props.buttons.length > 0) {
    return props.buttons
  }
  return [
    { text: props.cancelText, action: 'cancel', variant: 'outlined', color: 'default' },
    { text: props.confirmText, action: 'confirm', variant: 'flat', color: props.type },
  ]
})

const getButtonClass = (button: DialogButton): string[] => {
  const classes = ['dialog-btn']
  if (button.variant === 'outlined' || button.action === 'cancel') {
    classes.push('dialog-btn-outlined')
  }
  else {
    classes.push('dialog-btn-flat')
    classes.push(`dialog-btn-${button.color ?? props.type}`)
  }
  return classes
}

const onButtonClick = (button: DialogButton): void => {
  const action = button.action ?? 'confirm'
  if (action === 'confirm') emit('confirm')
  else if (action === 'cancel') emit('cancel')
  else emit('action', action)
  isVisible.value = false
}

const onBackdropClick = (): void => {
  if (props.closeOnBackdropClick) {
    emit('cancel')
    isVisible.value = false
  }
}

const onEscape = (): void => {
  if (props.escapeToCancel) {
    emit('cancel')
    isVisible.value = false
  }
}

const handleGlobalEscape = (e: KeyboardEvent): void => {
  if (e.key === 'Escape' && isVisible.value && props.escapeToCancel) {
    e.preventDefault()
    emit('cancel')
    isVisible.value = false
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleGlobalEscape)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleGlobalEscape)
  }
})

defineExpose({
  confirm: () => onButtonClick({ text: '', action: 'confirm' }),
  cancel: () => onButtonClick({ text: '', action: 'cancel' }),
})
</script>

<style scoped>
/* ----- Transitions ----- */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}
.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-pop-enter-active {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}
.dialog-pop-leave-active {
  transition: transform 0.18s ease, opacity 0.15s ease;
}
.dialog-pop-enter-from {
  transform: scale(0.92) translateY(8px);
  opacity: 0;
}
.dialog-pop-leave-to {
  transform: scale(0.96) translateY(4px);
  opacity: 0;
}

/* ----- Overlay ----- */
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--confirm-overlay-bg);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}

/* ----- Card ----- */
.dialog-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  margin-top: 32px;
  padding: 60px 32px 32px;
  background: var(--confirm-card-bg);
  -webkit-backdrop-filter: blur(12.5px);
  backdrop-filter: blur(12.5px);
  border-radius: 12px;
  color: var(--confirm-title-color);
  box-shadow: var(--confirm-card-shadow);
  font-family:
    'Inter',
    'Shabnam',
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI Variable Text',
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  font-feature-settings: 'cv11', 'ss01', 'ss03';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  box-sizing: border-box;
}

.dialog-card:focus { outline: none; }

.dialog-success { border: 2px solid #30e0a1; }
.dialog-warning { border: 2px solid #ffd700; }
.dialog-error   { border: 2px solid #dc143c; }
.dialog-info    { border: 2px solid #00ffff; }

/* ----- Top icon circle ----- */
.dialog-icon-circle {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--confirm-icon-circle-bg);
  -webkit-backdrop-filter: blur(12.5px);
  backdrop-filter: blur(12.5px);
  z-index: 10;
}

.dialog-icon-circle::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
  clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%);
}

.dialog-icon-success::before { border-color: #30e0a1; }
.dialog-icon-warning::before { border-color: #ffd700; }
.dialog-icon-error::before   { border-color: #dc143c; }
.dialog-icon-info::before    { border-color: #00ffff; }

.dialog-icon {
  display: inline-flex;
  align-items: center;
  line-height: 0;
}

/* ----- Body ----- */
.dialog-body {
  padding: 8px 0;
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px;
  color: var(--confirm-title-color);
  text-align: center;
  font-family: inherit;
  line-height: 1.3;
}

.dialog-message {
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
  color: var(--confirm-message-color);
  text-align: center;
  font-family: inherit;
}

.dialog-warning-text {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  margin: 12px 0 0;
  color: var(--confirm-warning-color);
  text-align: center;
  font-family: inherit;
}

/* ----- Actions ----- */
.dialog-actions {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}
.actions-1 { grid-template-columns: 1fr; }
.actions-2 { grid-template-columns: 1fr 1fr; }
.actions-3 { grid-template-columns: 1fr 1fr 1fr; }

.dialog-btn {
  height: 42px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1.5px solid transparent;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  color: var(--confirm-title-color);
}

.dialog-btn:focus-visible {
  outline: 2px solid var(--confirm-focus-outline);
  outline-offset: 2px;
}

.dialog-btn-outlined {
  background: transparent;
  border-color: var(--confirm-btn-outline-border);
  color: var(--confirm-btn-outline-color);
  font-weight: 500;
}
.dialog-btn-outlined:hover {
  background: var(--confirm-btn-outline-hover-bg);
  border-color: var(--confirm-btn-outline-hover-border);
}

.dialog-btn-flat {
  border-color: transparent;
}

.dialog-btn-success { background: #30e0a1; color: #001a14; }
.dialog-btn-success:hover { background: #28c28f; }

.dialog-btn-warning { background: #ffd700; color: #1a1a1a; }
.dialog-btn-warning:hover { background: #e6c200; }

.dialog-btn-error { background: #dc143c; color: white; }
.dialog-btn-error:hover { background: #c01234; }

.dialog-btn-info { background: #00ffff; color: #003c3c; }
.dialog-btn-info:hover { background: #00e6e6; }

.dialog-btn-default {
  background: var(--confirm-btn-default-bg);
  color: var(--confirm-btn-default-color);
}
.dialog-btn-default:hover { background: var(--confirm-btn-default-hover-bg); }
</style>
