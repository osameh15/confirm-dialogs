# Architecture

How the pieces of `nuxt-confirm-dialog` fit together at runtime — useful if you're customizing aggressively, debugging, or contributing.

## File layout

```
src/
├── module.ts                              # Nuxt module entry point
└── runtime/
    ├── components/
    │   ├── ConfirmDialog.vue              # Single dialog UI: backdrop + card
    │   └── ConfirmDialogContainer.vue     # Renders the active dialog from state
    ├── composables/
    │   └── useConfirmDialog.ts            # Public API + module-level state
    ├── assets/
    │   ├── fonts/Shabnam/*.woff2          # Bundled Persian font (5 weights)
    │   └── styles/confirm-dialog-fonts.css
    └── plugin.client.ts                   # Auto-mount client plugin
```

`module.ts` is the only file the consumer's Nuxt build evaluates directly. Everything under `runtime/` is registered with Nuxt as a path string and pulled in lazily by the consumer's app at the right time.

## Module lifecycle (consumer-side)

When a consumer adds `nuxt-confirm-dialog` to `modules` in `nuxt.config.ts`, Nuxt runs `module.ts#setup` once at build time:

1. Merge user options with defaults via `defineNuxtModule({ defaults })`.
2. Push runtime config under `runtimeConfig.public.confirmDialog` so it survives into client-side code.
3. Call `addComponent` twice — registers `<ConfirmDialog>` and `<ConfirmDialogContainer>` so consumers can use them globally without imports.
4. Call `addImports({ name: 'useConfirmDialog', from: ... })` — auto-imports the composable.
5. If `loadShabnamFont`, push `confirm-dialog-fonts.css` onto `nuxt.options.css` so Vite bundles the @font-face declarations and the woff2 files.
6. If `loadInterFont`, append three `<link>` tags to `nuxt.options.app.head.link` (preconnect to fonts.googleapis.com, preconnect to fonts.gstatic.com, stylesheet from googleapis).
7. If `autoMount`, register `runtime/plugin.client.ts` as a client-only plugin.

## Runtime state model

State lives at **module scope** in `useConfirmDialog.ts`:

```ts
const currentDialog = ref<ConfirmDialogInstance | null>(null)
let resolveAction: ((action: string) => void) | null = null
```

Notice the design choice: a single `ref<ConfirmDialogInstance | null>` — not an array. By design, only one dialog can be active at a time. Calling `show()` while another dialog is open cancels the previous one (its promise resolves with `'cancel'`) and replaces it.

The `resolveAction` closure is the link between the open dialog and the caller's awaited promise. When the user clicks a button, the container calls `confirm()` / `cancel()` / `action(name)` on the composable, which invokes `resolveAction(name)` and clears `currentDialog`.

Both bindings are top-level module exports — every `useConfirmDialog()` call returns a fresh object whose methods reach into the same shared state. That choice has two consequences:

1. **Multiple containers all see the same dialog.** Mount one in your default layout, another somewhere else — both render the same active dialog (and clicks anywhere settle the same promise).
2. **State survives across separate Vue app instances on the same page.** This is what makes the auto-mount plugin work (see below).

## Promise resolution flow

```
user code               composable                 container             dialog
─────────────────────────────────────────────────────────────────────────────────
const action =                                                             
  await dialog.show()                                                      
                ──→  set currentDialog                                     
                     create promise → save resolveAction                   
                                       ──→  v-if currentDialog renders     
                                            <ConfirmDialog ... />        ──→ user
                                                                          clicks
                                                                          button
                                       ←──  emit('confirm' | 'cancel' | 'action', name)
                     ←── confirm()/cancel()/action(name)                  
                     resolveAction(name)                                  
                     currentDialog = null                                  
                ←── promise resolves with action string                    
caller's await                                                             
  resumes with action                                                      
```

The promise **always resolves**, never rejects. This is a deliberate API improvement over the original Vuetify version (which rejected with `false` on cancel — forcing every caller to wrap calls in try/catch).

## The auto-mount plugin

If `autoMount: true` (default), `plugin.client.ts` runs once on the client:

```ts
const cfg = useRuntimeConfig().public.confirmDialog

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
```

It pulls the user's module options off `useRuntimeConfig().public.confirmDialog` and creates a **separate Vue application instance** to render `<ConfirmDialogContainer>`, mounted into a div appended to `<body>`. The consumer's main Vue app is not touched.

### Why a separate Vue app?

Two alternatives were considered:

- **Inject into the consumer's app via a Nuxt plugin (`nuxtApp.vueApp.component(...)`)**. Forces the consumer to add `<ConfirmDialogContainer />` somewhere in their template. Defeats the auto-mount goal.
- **Use Nuxt's `app:mounted` hook to find an anchor and inject**. Fragile — depends on app structure.

Mounting a tiny dedicated Vue app on a body-level div is the simplest pattern that works without touching consumer markup. The cost is one extra Vue instance, which is negligible for a UI element this small.

### Why state still syncs across two Vue apps

Because `currentDialog` is a module-level `ref`, both Vue app instances import the same singleton. When `useConfirmDialog().show(...)` (called from the consumer's app) sets `currentDialog.value`, Vue's reactivity system notifies every active effect — including the render effect inside the auto-mount app's `<ConfirmDialogContainer>`. That's why a `dialog.show(...)` call from anywhere in the consumer's app shows up in the auto-mounted container.

## Component layering

```
<ConfirmDialogContainer>             ← reads currentDialog from state, routes events
  └─ <ConfirmDialog>                 ← single dialog: overlay + card + buttons
        ↑ v-if currentDialog
```

`ConfirmDialogContainer` does three things:

1. Reads `currentDialog` from `useConfirmDialog()`. When non-null, renders `<ConfirmDialog>` with its options.
2. Wraps the rendered output in `<Teleport to="body" :disabled="!teleport">` so the overlay always covers the viewport.
3. Routes the dialog's `confirm` / `cancel` / `action` events back into `useConfirmDialog()` via `confirm()`, `cancel()`, `action(name)`. Those resolve the active promise and clear `currentDialog`.

`ConfirmDialog` is the visual component — backdrop overlay, card, top icon-circle, title/message/warningText, action buttons. Two transitions stack: a `dialog-fade` on the overlay, a `dialog-pop` on the card. Standalone — can be used directly with `v-model` if you want a simple modal without the composable plumbing.

## Teleport semantics

`<Teleport to="body">` moves the rendered DOM into `<body>` while keeping the Vue component in its original position in the component tree. That means:

- `position: fixed` on `.dialog-overlay` always references the viewport, even if the consumer mounts `<ConfirmDialogContainer />` inside an ancestor with `backdrop-filter`, `transform`, `filter`, `perspective`, `will-change`, or `contain` (any of which would otherwise create a new containing block — see the spec on [containing blocks](https://www.w3.org/TR/css-position-3/#cb)).
- Reactive bindings still work — props flow normally, events bubble normally up the component tree.

The container's auto-mount instance teleports from `#nuxt-confirm-dialog-root` to `body`, leaving `#nuxt-confirm-dialog-root` as an empty placeholder. Manual `<ConfirmDialogContainer />` mounts teleport from wherever the consumer placed them. Either way the rendered `.dialog-overlay` is a direct child of `<body>`.

## RTL auto-detection

`ConfirmDialog.vue` computes a per-dialog direction:

```ts
const RTL_SCRIPT = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻾]/
const direction = computed(() => {
  const allText = [props.title, props.message, props.warningText ?? ''].join(' ')
  return RTL_SCRIPT.test(allText) ? 'rtl' : 'ltr'
})
```

Detection runs across **title, message, and warningText** combined. If any of them contains Arabic / Persian / Urdu script, the whole dialog flips to RTL. Hebrew is not currently included; if you need it, extend the regex to cover U+0590–05FF.

The `dir` attribute is bound on the `.dialog-card` element. CSS uses `[dir='rtl']` selectors and logical properties (e.g. `margin-inline-end`) where needed so the layout flips automatically. The buttons are arranged in a CSS grid which is direction-agnostic — the visual order follows the source order in LTR and reverses naturally in RTL.

## Focus management

When a dialog opens:

1. The previously-focused element is captured into `previousFocus.value`.
2. Focus moves to the dialog card itself (`tabindex="-1"` allows programmatic focus).
3. Tab navigation cycles through the buttons (browser default behavior).

When the dialog closes:

4. Focus is restored to whatever element had it before the dialog opened.

Plus: Esc key cancels (toggleable via `escapeToCancel`), and click-on-backdrop optionally cancels (toggleable via `closeOnBackdropClick`, default `false`).

## Build pipeline

`@nuxt/module-builder` (which wraps `unbuild`) handles packaging:

- `nuxt-module-build build` — emits `dist/module.mjs`, `dist/module.d.mts`, and copies `runtime/` (compiled `.ts` → `.mjs`, `.vue` files preserved, woff2 / css copied as static assets).
- `nuxt-module-build prepare` — generates type stubs in `.nuxt/` for IDE tooling.
- `nuxt-module-build build --stub` — emits a stub `dist/module.mjs` that defers to source files via jiti, used during dev.

Output ends up in `dist/`, which is the only directory shipped to npm (per `files: ["dist"]`).
