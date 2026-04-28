# Design decisions

The major choices behind the module, and why each was picked over the obvious alternatives.

## Why no Vuetify dependency?

The original confirm dialog this module is descended from used Vuetify's `v-dialog`, `v-card`, `v-btn`, `v-icon`, `v-row`, and `v-col`, plus the MDI icon font. Three problems with shipping that as a library:

1. **Hard peer dependency on Vuetify.** Every consumer would need Vuetify installed and registered, ruling out projects on Tailwind, UnoCSS, plain Nuxt UI, or any other ecosystem.
2. **Larger bundle for consumers who already had a UI kit** — `v-btn` for a single confirm button is overkill.
3. **Style coupling.** Vuetify's theme system would need to be respected, adding maintenance.

The library uses plain HTML, scoped CSS, and inline SVG icons (Feather-style stroke icons matching the four MDI icons used). The visual contract — gradient, border colors, top icon-circle with half-arc decoration, sizing, animation — is preserved exactly.

**Trade-off:** the library can't reuse Vuetify's theme variables, so theming is "override CSS" rather than "set Vuetify primary color". For a single-component module this is acceptable.

## Why a separate Vue app for the auto-mount plugin?

Two alternatives:

- **Inject the container into the consumer's app via a Nuxt plugin** — would require reaching into the consumer's app structure. The cleanest way is to ask the consumer to render `<ConfirmDialogContainer />` themselves, which defeats "auto-mount".
- **Use the `vue:setup` Nuxt hook to inject a global component instance.** Possible but the API is unstable and the result is fragile.

The chosen approach: `createApp({ render: () => h(ConfirmDialogContainer) }).mount(bodyDiv)`. The cost is one tiny Vue app instance — irrelevant for a UI element this static. The benefit is total isolation from the consumer's render tree.

This is only viable because of the next decision.

## Why module-level state (not Pinia, not provide/inject)?

The active dialog lives in `useConfirmDialog.ts` as a top-level `const currentDialog = ref(...)`. Three reasons:

1. **Cross-Vue-app state sharing.** With module-level refs, the auto-mount plugin's separate Vue app sees the same `currentDialog.value` as the consumer's main app. Pinia stores are bound to a Pinia instance which is bound to a Vue app — that wouldn't work here.
2. **Zero-config for consumers.** No need to install Pinia, no provider wrapping, no plugin registration.
3. **Simpler API surface.** `useConfirmDialog()` returns plain functions; no instance plumbing.

**Trade-off:** the state is global. A second `dialog.show()` call cancels the first. For confirm dialogs this is the desired behavior — you should never have two stacked confirms competing for user input.

## Why is the dialog single-instance (not a queue)?

Toast notifications stack because they're informational and non-blocking. Confirm dialogs **block the user** — they need to make a choice. Stacking them would create a queue where the user keeps confirming actions they don't fully see, which is bad UX and worse for accessibility (multiple `role="alertdialog"` elements competing for focus).

If you need to ask multiple questions, ask them sequentially:

```ts
const a = await dialog.confirmAction('Step 1', '...')
if (!a) return
const b = await dialog.confirmDelete('item')
if (!b) return
// proceed
```

If you absolutely need a multi-step flow, build a single dialog with an internal stepper — not a queue.

## Why does `show()` resolve always (never reject)?

The original implementation `rejected` the promise on cancel, with a `false` rejection value. That forces every consumer into try/catch:

```ts
// Original — awkward
try {
  await dialog.show({...})
  doConfirmAction()
} catch (e) {
  // user clicked cancel — but also any real error gets swallowed here
}
```

The library's `show()` always resolves with the action name string. Convenience methods always resolve with a boolean.

```ts
// New — natural async/await flow
const action = await dialog.show({...})
if (action === 'confirm') doConfirmAction()

// or
if (await dialog.confirmDelete('user')) {
  await api.deleteUser()
}
```

Real errors (network failures, etc.) come from your own code inside the `if` branch and propagate normally. The dialog itself never rejects.

## Why a custom `buttons` array instead of slots?

Slots (e.g. `<template #buttons>`) would let consumers fully control button rendering, but at the cost of:

- Losing the default visual hierarchy (cancel-vs-confirm spacing, themed colors per type)
- Forcing consumers to wire `@click="emit('confirm')"` etc. by hand
- Complicating the auto-mount plugin's interface (slot pass-through across the separate Vue app boundary is tricky)

The `buttons: ConfirmDialogButton[]` array gives 90% of the flexibility (1–3 buttons, custom text, named actions, color overrides) with a fully declarative API:

```ts
buttons: [
  { text: 'Cancel',     action: 'cancel',  variant: 'outlined' },
  { text: "Don't save", action: 'discard', variant: 'flat', color: 'default' },
  { text: 'Save',       action: 'save',    variant: 'flat', color: 'info' },
]
```

If you need radically different markup (e.g. a button with an inline form), drop down to `<ConfirmDialog>` directly with `v-model` and replace the buttons via your own template.

## Why Teleport on `<ConfirmDialogContainer>`?

`position: fixed` is supposed to anchor to the viewport. But any ancestor with `backdrop-filter`, `transform`, `filter`, `perspective`, `will-change`, or `contain: layout/paint/strict/content` becomes the **containing block** for fixed-position descendants. This is in the spec — see [containing block algorithm](https://www.w3.org/TR/css-position-3/#cb).

This bites real consumers — e.g. a "command palette" pattern where the trigger button sits inside a `backdrop-filter: blur(...)` floating panel. Without `<Teleport to="body">`, opening a confirm dialog from inside that panel would render the overlay **inside** the panel, not over the whole viewport.

`<Teleport to="body">` always escapes the consumer's component tree and lands the container as a direct child of `<body>` — no ancestor can become the containing block. The `:disabled="!teleport"` prop lets users opt out, but the default is `true` because the bug is silent and confusing when it bites.

## Why auto-detect RTL from text content?

Three options were considered:

- **Always LTR.** Persian/Arabic text would have the icon spacing wrong and tab order reversed-from-expected.
- **Explicit `dir` prop on `useConfirmDialog.show({ dir: 'rtl' })`.** More control, but every Persian-only app would have to set it on every call.
- **Auto-detect from title, message, or warningText.** Requires no consumer code, works correctly out of the box for any combination.

The cost is a tiny regex run once at dialog creation, not per render. Worth it for the zero-config experience.

The detection regex covers Arabic, Arabic Supplement, Arabic Extended-A, and Arabic Presentation Forms-A and -B. Hebrew is not included — Persian/Arabic was the explicit requirement and Hebrew has slightly different bidi behavior. PRs to extend this are welcome.

## Why is the backdrop persistent by default?

Confirm dialogs ask users to make a deliberate choice. Closing on backdrop click — the typical "side modal" pattern — produces what looks to the user like an accidental cancel: they meant to click somewhere else and lost their unsaved work / didn't notice.

Industry convention for **confirm** dialogs (vs notification dialogs / drawers / popovers) is **persistent**. The user must explicitly pick a button.

Override per-app or per-container with `closeOnBackdropClick: true` if your specific UI needs the dismiss-on-backdrop semantics.

Esc-to-cancel **is** on by default because it's universal modal-keyboard convention and explicit (the user pressed Esc). Override with `escapeToCancel: false` if your dialog absolutely needs a button choice — e.g. a destructive operation where Esc shouldn't be a one-key way to dismiss.

## Why Inter via Google Fonts but Shabnam bundled?

| Font | Source | Reason |
| --- | --- | --- |
| Inter (Latin) | Google Fonts CDN, opt-out via `loadInterFont: false` | Inter is ubiquitous; many apps already load it. Bundling would be wasted bytes when the consumer already has it. CDN means cached cross-site after first hit. |
| Shabnam (Persian) | Bundled woff2, opt-out via `loadShabnamFont: false` | Shabnam is much less common — most consumers won't have it. Bundling guarantees correct rendering offline and avoids a CDN dep for fewer users. |

Both load with `unicode-range` (Shabnam) or `&display=swap` (Inter) so they don't block first paint.

## Why woff2 only (no woff/ttf fallback)?

Browser support for woff2:

- Chrome 36+ (2014)
- Firefox 39+ (2015)
- Safari 12+ / iOS 12+ (2018)

For a 2026 library targeting Nuxt 3.13+ / Nuxt 4 — which themselves require modern browsers — woff2 is enough. Adding woff fallbacks would roughly double the bundle weight to support browsers no consumer is testing against anyway.

If a downstream consumer needs IE11 or pre-2018 Safari, they can disable `loadShabnamFont` and supply their own font with whatever fallback chain they need.

## Why support Nuxt 3 AND 4 in the peer range?

`compatibility.nuxt: '^3.13.0 || ^4.0.0'`. Reasons:

- Nuxt 4 is the current major; Nuxt 3 is in maintenance but still used widely.
- The module API (`defineNuxtModule`, `addComponent`, `addImports`, `addPlugin`) is identical between 3.13+ and 4.x.
- The runtime API (`useRuntimeConfig`, `defineNuxtPlugin`) is identical.
- No reason to fragment the user base.

Dev dependencies (`nuxt`, `@nuxt/schema`) are pinned to Nuxt 4 because that's what the official module starter uses. The `commander` peer mismatch this caused is documented in `package.json#overrides`.

## Why the icon-circle decoration?

Could have been a simpler inline icon next to the title (e.g. left-of-text, like most toast libraries). The half-arc top circle is more elaborate and unambiguously **announces** the dialog as a confirmation point — visually heavier than a notification, lighter than a full alert page.

Confirm dialogs interrupt the user. The decoration says "this is intentional, please pay attention" without being alarming. It also gives each type a distinct silhouette, so a glance is enough to know if it's success/warning/error/info.
