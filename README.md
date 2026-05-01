# nuxt-confirm-dialog

[![CI](https://github.com/osameh15/confirm-dialogs/actions/workflows/ci.yml/badge.svg)](https://github.com/osameh15/confirm-dialogs/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A beautiful, zero-dependency confirm dialog module for **Nuxt 3 and Nuxt 4** — no Vuetify or icon-font required. Drop it in, call `useConfirmDialog().confirmDelete(...)`, await the result.

![Confirm Deletion dialog: red border, trash icon in a half-arc circle, "This action cannot be undone" warning, Cancel + Delete buttons](https://raw.githubusercontent.com/osameh15/confirm-dialogs/main/docs/images/error.png)

- 🎨 **Polished look** — dark radial gradient, colored borders per type, decorative top icon, blurred backdrop
- 🧩 **Standalone** — no Vuetify, no MDI, no extra CSS framework
- ⚡️ **Auto-mounted** — no boilerplate, just call `useConfirmDialog().confirmDelete('item')`
- 🎯 **Promise-based API** — `await dialog.show({...})` returns the action; convenience methods return `boolean`
- 🧠 **Fully typed** — written in TypeScript with full IntelliSense
- 🔘 **1 / 2 / 3 button layouts** — default Cancel/Confirm or custom buttons with named actions
- ⌨️ **Keyboard friendly** — `Esc` cancels, focus is trapped while open and restored on close
- 🔤 **Modern typography** — bundled **Shabnam** for Persian/Arabic + **Inter** for Latin (both opt-out)
- 🌐 **Auto RTL** — dialogs containing Arabic/Persian script switch to `dir="rtl"` automatically
- ♿ **Accessible** — `role="alertdialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`

---

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Module options](#module-options)
- [Composable API — `useConfirmDialog()`](#composable-api--useconfirmdialog)
- [Custom buttons](#custom-buttons)
- [Component API](#component-api)
- [Types](#types)
- [Theme](#theme)
- [Customization](#customization)
- [TypeScript](#typescript)
- [Development](#development)
- [License](#license)

For deeper technical reference (architecture, design rationale, contributing), see [`docs/`](./docs/README.md).

---

## Installation

```bash
npm install nuxt-confirm-dialog
# or
pnpm add nuxt-confirm-dialog
# or
yarn add nuxt-confirm-dialog
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-confirm-dialog'],
})
```

That's it — `useConfirmDialog()` is auto-imported and a `<ConfirmDialogContainer>` is mounted automatically on the client.

---

## Quick start

```vue
<script setup lang="ts">
const dialog = useConfirmDialog()

const onDelete = async () => {
  if (await dialog.confirmDelete('user "alice"')) {
    await api.deleteUser('alice')
  }
}

const onSave = async () => {
  const action = await dialog.show({
    type: 'info',
    title: 'Save changes?',
    message: 'You have unsaved edits.',
    buttons: [
      { text: 'Cancel',     action: 'cancel',  variant: 'outlined', color: 'default' },
      { text: "Don't save", action: 'discard', variant: 'flat',     color: 'default' },
      { text: 'Save',       action: 'save',    variant: 'flat',     color: 'info' },
    ],
  })
  // action: 'cancel' | 'discard' | 'save'
}
</script>

<template>
  <button @click="onDelete">Delete</button>
  <button @click="onSave">Save</button>
</template>
```

The bundled playground exercises every feature — convenience methods, custom `show()`, custom buttons, and Persian RTL:

![Quick demo page with the four convenience-method buttons and the custom show() controls](https://raw.githubusercontent.com/osameh15/confirm-dialogs/main/docs/images/QuickDemo.png)

---

## Module options

Configure under the `confirmDialog` key in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-confirm-dialog'],
  confirmDialog: {
    autoMount: true,
    closeOnBackdropClick: false,
    escapeToCancel: true,
    prefix: 'Confirm',
    loadShabnamFont: true,
    loadInterFont: true,
  },
})
```

| Option                 | Type      | Default     | Description |
| ---------------------- | --------- | ----------- | ----------- |
| `autoMount`            | `boolean` | `true`      | When `true`, mounts a `<ConfirmDialogContainer>` automatically on the client. Set `false` to mount it yourself. |
| `closeOnBackdropClick` | `boolean` | `false`     | If `true`, clicking the dim backdrop cancels the dialog. Default is persistent (clicks on the backdrop are ignored). |
| `escapeToCancel`       | `boolean` | `true`      | If `true`, pressing the Escape key cancels the dialog. |
| `prefix`               | `string`  | `'Confirm'` | Component name prefix. Default makes components `<ConfirmDialog>` and `<ConfirmDialogContainer>`. |
| `theme`                | `'dark' \| 'light'` | `'dark'` | Initial visual theme. Switch at runtime with `useConfirmDialog().setTheme(...)` or override per-container with the `theme` prop. |
| `loadShabnamFont`      | `boolean` | `true`      | Inject the bundled Persian "Shabnam" font (5 weights, woff2). `unicode-range` ensures the file is only downloaded when Arabic/Persian script appears. |
| `loadInterFont`        | `boolean` | `true`      | Add Inter (Google Fonts) as the modern English UI typeface via a `<link>` in the head. |

---

## Composable API — `useConfirmDialog()`

```ts
const dialog = useConfirmDialog()
```

### `show(options)`

Display a dialog. Returns `Promise<string>` resolving with the action name — `'confirm'`, `'cancel'`, or any custom action you defined in the `buttons` array. The promise **always resolves** — it never rejects.

```ts
const action = await dialog.show({
  type: 'warning',
  title: 'Heads up',
  message: 'Continue?',
  warningText: 'This will replace existing data.',
})
if (action === 'confirm') { /* user confirmed */ }
```

| Option        | Type                                            | Required | Default       |
| ------------- | ----------------------------------------------- | -------- | ------------- |
| `type`        | `'success' \| 'warning' \| 'error' \| 'info'`   | no       | `'warning'`   |
| `title`       | `string`                                        | yes      | —             |
| `message`     | `string`                                        | yes      | —             |
| `warningText` | `string \| null`                                | no       | `null`        |
| `confirmText` | `string`                                        | no       | `'Confirm'`   |
| `cancelText`  | `string`                                        | no       | `'Cancel'`    |
| `buttons`     | `ConfirmDialogButton[] \| null`                 | no       | `null`        |

### Convenience methods

All return `Promise<boolean>` — `true` if the user confirms, `false` otherwise.

```ts
await dialog.confirmDelete(itemName?, customMessage?, customWarning?)  // red theme
await dialog.confirmAction(title, message, confirmText?, cancelText?)  // yellow theme
await dialog.confirmInfo(title, message, confirmText?, cancelText?)    // cyan theme
await dialog.confirmSuccess(title, message, confirmText?, cancelText?) // green theme
```

### `currentDialog`

Reactive `Ref<ConfirmDialogInstance | null>` holding the active dialog. Useful for custom containers or status indicators.

```vue
<span v-if="dialog.currentDialog.value">Dialog is open</span>
```

### Internal action methods

`confirm()`, `cancel()`, `action(name)` — these are called by the container to settle the active promise. You rarely need them directly unless building a custom container.

---

## Custom buttons

Pass a `buttons` array to override the default Cancel/Confirm pair. Supports 1, 2, or 3 buttons. Each button is `{ text, action?, variant?, color? }`:

```ts
await dialog.show({
  type: 'info',
  title: 'Save changes?',
  message: 'You have unsaved edits.',
  buttons: [
    { text: 'Cancel',     action: 'cancel',  variant: 'outlined', color: 'default' },
    { text: "Don't save", action: 'discard', variant: 'flat',     color: 'default' },
    { text: 'Save',       action: 'save',    variant: 'flat',     color: 'info' },
  ],
})
// resolves with 'cancel' | 'discard' | 'save'
```

![Three-button dialog showing Cancel, Don't save, and Save laid out in a CSS grid](https://raw.githubusercontent.com/osameh15/confirm-dialogs/main/docs/images/3%20Buttons.png)

| Field     | Type                                                          | Default                                |
| --------- | ------------------------------------------------------------- | -------------------------------------- |
| `text`    | `string`                                                      | required                               |
| `action`  | `string`                                                      | `'confirm'`                            |
| `variant` | `'flat' \| 'outlined'`                                        | `'outlined'` for cancel, else `'flat'` |
| `color`   | `'success' \| 'warning' \| 'error' \| 'info' \| 'default'`    | dialog `type` for confirm buttons      |

---

## Component API

### `<ConfirmDialogContainer>`

The container that renders the active dialog. Auto-mounted by default — only use this directly if `autoMount: false`.

| Prop                   | Type      | Default | Description |
| ---------------------- | --------- | ------- | ----------- |
| `teleport`             | `boolean` | `true`  | Render into `document.body` via `<Teleport>` so the overlay always covers the viewport. Disable only for special cases. |
| `closeOnBackdropClick` | `boolean` | `false` | Backdrop click cancels the dialog. |
| `escapeToCancel`       | `boolean` | `true`  | Escape key cancels the dialog. |

### `<ConfirmDialog>`

The single-dialog component. You normally don't render this directly — `useConfirmDialog()` and `<ConfirmDialogContainer>` handle it. Exposed for static / non-composable usage.

Props mirror `show(options)` plus `modelValue` (boolean) for `v-model`. Emits: `update:modelValue`, `confirm`, `cancel`, `action`.

```vue
<ConfirmDialog
  v-model="open"
  type="error"
  title="Delete file?"
  message="This is permanent."
  @confirm="handleConfirm"
  @cancel="handleCancel"
/>
```

---

## Types

| Type        | Color (border + icon) | Recommended use                                |
| ----------- | --------------------- | ---------------------------------------------- |
| `success`   | `#30e0a1` (green)     | Positive confirmation (publish, complete)      |
| `warning`   | `#FFD700` (yellow)    | Default — caution required                     |
| `error`     | `#DC143C` (red)       | Destructive actions (delete, reset)            |
| `info`      | `#00FFFF` (cyan)      | Informational confirmations                    |

Each type has a matching inline SVG icon (no icon-font required).

<table>
  <tr>
    <td align="center"><strong>success</strong></td>
    <td align="center"><strong>warning</strong></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/osameh15/confirm-dialogs/main/docs/images/success.png" alt="Success dialog — green border, checkmark icon, All set / Continue" /></td>
    <td><img src="https://raw.githubusercontent.com/osameh15/confirm-dialogs/main/docs/images/Warning.png" alt="Warning dialog — yellow border, alert-triangle icon, Apply changes / Confirm" /></td>
  </tr>
  <tr>
    <td align="center"><strong>error</strong></td>
    <td align="center"><strong>info</strong></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/osameh15/confirm-dialogs/main/docs/images/error.png" alt="Error dialog — red border, trash icon, Confirm Deletion / Delete" /></td>
    <td><img src="https://raw.githubusercontent.com/osameh15/confirm-dialogs/main/docs/images/info.png" alt="Info dialog — cyan border, info icon, Cookie usage / OK" /></td>
  </tr>
</table>

---

## Theme

Ships with a **dark** theme (default) and a **light** theme. Switch globally at runtime, or override per-container.

```ts
// nuxt.config.ts — initial theme
confirmDialog: { theme: 'light' }
```

```vue
<script setup lang="ts">
const dialog = useConfirmDialog()

console.log(dialog.theme.value) // 'dark' or 'light'

dialog.setTheme('light')

// Optional: follow the user's system preference
const sync = () => dialog.setTheme(
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
)
sync()
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync)
</script>
```

Per-container override (useful for an always-light dialog inside a dark dashboard):

```vue
<ConfirmDialogContainer theme="light" />
```

The `theme` prop, when set, takes precedence over `useConfirmDialog().theme`. The four type-color borders (`#30e0a1` / `#FFD700` / `#DC143C` / `#00FFFF`) stay constant in both themes — only the card background, overlay backdrop, message text, and outlined button neutrals swap.

---

## Customization

The auto-mounted container lives at `#nuxt-confirm-dialog-root`. Override styles globally by targeting that root:

```css
/* assets/css/main.css */
#nuxt-confirm-dialog-root .dialog-card {
  max-width: 560px;
  border-radius: 16px;
}

#nuxt-confirm-dialog-root .dialog-error {
  border-color: #ef4444;
}
```

### Fonts

Two fonts are loaded by default:

- **Inter** (English / Latin) — Google Fonts via `<link>`. Disable with `loadInterFont: false`.
- **Shabnam** (Persian / Arabic) — bundled woff2 (5 weights), gated by `unicode-range`. Disable with `loadShabnamFont: false`.

The dialog uses the same stack as the `nuxt-toast-notification` library:

```css
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
```

### Right-to-left support

When the title, message, or warning text contains Arabic / Persian script, the dialog auto-switches to `dir="rtl"`. The detection is per-instance — you can mix LTR and RTL dialogs in the same app without configuration.

![Persian delete confirmation: red border, trash icon, "حذف فایل" title, RTL button order with حذف on the left and انصراف on the right, rendered with the bundled Shabnam font](https://raw.githubusercontent.com/osameh15/confirm-dialogs/main/docs/images/RTL.png)

### Manual mounting

```ts
// nuxt.config.ts
confirmDialog: { autoMount: false }
```

```vue
<!-- app.vue -->
<template>
  <NuxtLayout><NuxtPage /></NuxtLayout>
  <ConfirmDialogContainer />
</template>
```

The state is global — multiple containers all subscribe to the same active dialog (only one dialog can be active at a time, by design).

---

## TypeScript

The module ships full type definitions:

```ts
import type {
  ConfirmDialogType,         // 'success' | 'warning' | 'error' | 'info'
  ConfirmDialogOptions,      // arg shape for show()
  ConfirmDialogButton,       // { text, action?, variant?, color? }
  ConfirmDialogInstance,     // shape of currentDialog.value
} from 'nuxt-confirm-dialog'
```

`ModuleOptions` is also exported.

---

## Development

```bash
npm install
npm run dev:prepare
npm run dev            # playground at http://localhost:3000

npm run lint
npm run test
npm run prepack        # build dist/
```

The playground at `playground/` exercises every feature — types, button configurations, real-world examples, and Persian / RTL.

### CI

GitHub Actions runs lint (Node 22) and tests + build (Node 20 and 22) on every push and PR against `main`.

---

## License

[MIT](./LICENSE)
