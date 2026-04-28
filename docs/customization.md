# Customization

The dialog component is intentionally easy to override at every level — color per type, sizes, animation, fonts, even the icons. This page is the deep dive; the README's "Customization" section is the quick version.

## Where styles live

| Stylesheet | Scope | Loaded by |
| --- | --- | --- |
| `<style scoped>` inside `ConfirmDialog.vue` | Component-scoped (Vue scoped CSS hash) | Bundled with the component |
| `runtime/assets/styles/confirm-dialog-fonts.css` | Global `@font-face` rules for Shabnam | Pushed onto `nuxt.options.css` when `loadShabnamFont: true` |
| Inter via Google Fonts | Global stylesheet `<link>` | Appended to head when `loadInterFont: true` |

Because the component CSS is scoped, you can't override a class by name from a parent component's `<style scoped>`. Use one of the patterns below instead.

## Override pattern 1 — global stylesheet targeting the root

The auto-mounted container lives in a body-level div with id `nuxt-confirm-dialog-root`. Any global stylesheet (e.g. `assets/css/main.css` registered via `nuxt.config.ts#css`) can target descendants of that root:

```css
/* assets/css/main.css */
#nuxt-confirm-dialog-root .dialog-card {
  max-width: 560px;
  border-radius: 16px;
}

#nuxt-confirm-dialog-root .dialog-error {
  border-color: #ef4444;
}

#nuxt-confirm-dialog-root .dialog-title {
  font-weight: 700;
  letter-spacing: -0.02em;
}
```

This works because Vue's scoped CSS adds a data-attribute selector to internal rules but does **not** prevent global CSS from matching the same elements.

## Override pattern 2 — `:deep()` from a parent component

If you mount `<ConfirmDialogContainer />` manually inside one of your own components, you can pierce its scope using `:deep()`:

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
    <ConfirmDialogContainer />
  </NuxtLayout>
</template>

<style scoped>
:deep(.dialog-card) {
  border-radius: 20px;
}
:deep(.dialog-warning) {
  border-color: #f59e0b;
}
</style>
```

This is more localized than option 1 — it only applies if the dialog is rendered through a manual mount inside this component's tree.

## Class reference

| Class | Where | Description |
| --- | --- | --- |
| `.dialog-overlay` | `ConfirmDialog` root | Full-viewport dim backdrop |
| `.dialog-card` | inside `.dialog-overlay` | The dialog card itself |
| `.dialog-{type}` | on `.dialog-card` | One of `dialog-success`, `dialog-warning`, `dialog-error`, `dialog-info` — sets the border color |
| `.dialog-icon-circle` | inside `.dialog-card` | The decorative top circle that holds the icon |
| `.dialog-icon-{type}` | on `.dialog-icon-circle` | Per-type half-arc border on the icon circle |
| `.dialog-icon` | inside `.dialog-icon-circle` | Wraps the SVG; color set inline per type |
| `.dialog-body` | inside `.dialog-card` | Padding wrapper for title/message/buttons |
| `.dialog-title` | inside `.dialog-body` | The title `<h3>` |
| `.dialog-message` | inside `.dialog-body` | The message `<p>` |
| `.dialog-warning-text` | inside `.dialog-body` | Optional yellow emphasis line below the message |
| `.dialog-actions` | inside `.dialog-body` | CSS grid holding the action buttons |
| `.actions-{n}` | on `.dialog-actions` | `actions-1`, `actions-2`, `actions-3` — sets grid column count |
| `.dialog-btn` | each button | Base button class |
| `.dialog-btn-outlined` | on `.dialog-btn` | Outlined style (default for cancel) |
| `.dialog-btn-flat` | on `.dialog-btn` | Solid style (default for confirm) |
| `.dialog-btn-{color}` | on `.dialog-btn-flat` | Color: `success`, `warning`, `error`, `info`, `default` |

The card also sets `[dir='rtl']` when title, message, or warning text contains Arabic / Persian script. Use that attribute selector for direction-specific tweaks.

## Theming per type

Each type's color appears in three places: the card border, the icon-circle half-arc, and the icon. The cleanest swap is to override the border on the type class.

```css
/* In a global stylesheet */
#nuxt-confirm-dialog-root .dialog-success      { border-color: #10b981; }
#nuxt-confirm-dialog-root .dialog-warning      { border-color: #f59e0b; }
#nuxt-confirm-dialog-root .dialog-error        { border-color: #ef4444; }
#nuxt-confirm-dialog-root .dialog-info         { border-color: #3b82f6; }

#nuxt-confirm-dialog-root .dialog-icon-success::before { border-color: #10b981; }
#nuxt-confirm-dialog-root .dialog-icon-warning::before { border-color: #f59e0b; }
#nuxt-confirm-dialog-root .dialog-icon-error::before   { border-color: #ef4444; }
#nuxt-confirm-dialog-root .dialog-icon-info::before    { border-color: #3b82f6; }

#nuxt-confirm-dialog-root .dialog-btn-error    { background: #ef4444; }
/* ... etc */
```

The icon color itself is set as an inline style (`:style="{ color: iconColor }"` in `ConfirmDialog.vue`), so global CSS can't override it directly. The cleanest path: wrap the dialog or set `--dialog-icon-color` on the wrapper. For most use cases the default colors look fine — overriding just the border + button background is enough for branding.

## Custom animations

Two transitions:

- `dialog-fade` on the overlay (opacity)
- `dialog-pop` on the card (scale + translateY + opacity, with a slight overshoot via `cubic-bezier(0.34, 1.56, 0.64, 1)`)

Override globally:

```css
/* Replace pop with a slide-down */
#nuxt-confirm-dialog-root .dialog-pop-enter-from {
  transform: translateY(-24px);
  opacity: 0;
}
#nuxt-confirm-dialog-root .dialog-pop-leave-to {
  transform: translateY(8px);
  opacity: 0;
}
#nuxt-confirm-dialog-root .dialog-pop-enter-active,
#nuxt-confirm-dialog-root .dialog-pop-leave-active {
  transition: transform 0.25s ease, opacity 0.2s ease;
}
```

## Font replacement

### Disable the bundled fonts

```ts
// nuxt.config.ts
confirmDialog: {
  loadShabnamFont: false,
  loadInterFont: false,
}
```

With both off, the dialog inherits whatever font the consumer's body uses (or falls back to the system stack `system-ui, -apple-system, ...` defined in the component CSS).

### Replace with your own

After disabling the bundled options, register your own fonts globally and target the dialog classes:

```css
/* assets/css/main.css */
@font-face {
  font-family: 'Vazirmatn';
  src: url('/fonts/Vazirmatn.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}

#nuxt-confirm-dialog-root .dialog-card,
#nuxt-confirm-dialog-root .dialog-title,
#nuxt-confirm-dialog-root .dialog-message,
#nuxt-confirm-dialog-root .dialog-warning-text {
  font-family: 'Vazirmatn', system-ui, sans-serif;
}
```

## Backdrop and Esc behavior

By default the dialog is **persistent** — clicking the backdrop does nothing, only a button click or Esc dismisses it. This matches industry convention for confirm dialogs (you want the user to make a deliberate choice).

Override per-container:

```vue
<ConfirmDialogContainer
  :close-on-backdrop-click="true"
  :escape-to-cancel="false"
/>
```

Or globally via `nuxt.config.ts`:

```ts
confirmDialog: {
  closeOnBackdropClick: true,
  escapeToCancel: false,
}
```

When `closeOnBackdropClick: true`, the cancel emit fires (so the awaiting promise resolves with `'cancel'` and `confirmDelete` resolves with `false`).

## Manual mounting

Set `autoMount: false` to take full control:

```ts
// nuxt.config.ts
confirmDialog: { autoMount: false }
```

```vue
<!-- app.vue or a layout -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <ConfirmDialogContainer />
</template>
```

You can mount more than one container, but only one dialog can be active at a time — the state is global. All containers will render the same dialog when one is open. (Useful for split layouts where you want the dialog rendered into a specific subtree.)

If you mount a container inside an element that creates a containing block (`backdrop-filter`, `transform`, `filter`, `perspective`, `will-change`, or `contain`), `position: fixed` would normally measure against that ancestor instead of the viewport. The container handles that by default — its template wraps everything in `<Teleport to="body">`. To opt out (e.g. for testing), pass `:teleport="false"`.

## Accessibility

- The card has `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` (pointing at the title), and `aria-describedby` (pointing at the message).
- Focus moves to the card on open (`tabindex="-1"` makes it programmatically focusable). Tab cycles through the buttons.
- Focus is restored to the previously-focused element when the dialog closes.
- Esc cancels by default. Disable with `escapeToCancel: false` if your use case needs a forced choice.
- The close icon-circle and SVG icons are marked `aria-hidden="true"` — screen readers don't announce decorative imagery.

If you alter the markup heavily, preserve those attributes so assistive tech still works.

## Localized labels

`title`, `message`, `warningText`, and per-button `text` are all plain strings — feed them through your i18n layer:

```ts
const { t } = useI18n()
const dialog = useConfirmDialog()

const ok = await dialog.show({
  type: 'error',
  title: t('confirm.delete.title'),
  message: t('confirm.delete.message', { name }),
  warningText: t('confirm.delete.warning'),
  confirmText: t('common.delete'),
  cancelText: t('common.cancel'),
})
```

Auto-RTL detection picks up Persian/Arabic text whether it comes from i18n keys or hardcoded strings.

For the convenience methods (`confirmDelete` etc.), the default English labels are baked in — pass custom messages or override the convenience method with your own wrapper:

```ts
const { t } = useI18n()
const dialog = useConfirmDialog()

const confirmDelete = (item: string) =>
  dialog.show({
    type: 'error',
    title: t('confirm.delete.title'),
    message: t('confirm.delete.message', { item }),
    warningText: t('confirm.delete.warning'),
    confirmText: t('common.delete'),
    cancelText: t('common.cancel'),
  }).then(action => action === 'confirm')
```
