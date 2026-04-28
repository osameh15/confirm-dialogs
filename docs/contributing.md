# Contributing

Local dev setup, conventions, and the release workflow.

## Prerequisites

- Node.js **20** or **22** (Nuxt 4 requires 20+, the linter needs 22+ for `Object.groupBy` — CI splits these into separate jobs)
- npm 10+ (ships with Node 20+)
- Git

## First-time setup

```bash
git clone https://github.com/osameh15/confirm-dialogs.git
cd confirm-dialogs
npm install
npm run dev:prepare
```

`dev:prepare` does three things:

1. Stubs `dist/` so the playground can resolve `nuxt-confirm-dialog` to `src/`.
2. Generates module type stubs into `.nuxt/`.
3. Runs `nuxt prepare playground` — generates the playground's Nuxt typing.

You only need to re-run `dev:prepare` after pulling changes that touch `package.json` deps or `src/module.ts`. Day-to-day dev doesn't need it.

## Project layout

```
.
├── src/                                # The library itself (shipped to npm)
│   ├── module.ts                       # Nuxt module entry
│   └── runtime/                        # Runtime code, registered with Nuxt
│       ├── components/                 # ConfirmDialog.vue, ConfirmDialogContainer.vue
│       ├── composables/                # useConfirmDialog.ts
│       ├── assets/                     # Bundled fonts + @font-face stylesheet
│       └── plugin.client.ts            # Auto-mount plugin
├── playground/                         # Runnable Nuxt app for live testing
│   ├── app.vue, nuxt.config.ts
│   ├── layouts/default.vue
│   ├── assets/css/playground.css
│   └── pages/                          # /, /test
├── test/                               # Vitest specs for src/
├── docs/                               # This documentation set
├── .github/workflows/ci.yml            # Lint + test + build on push/PR
├── eslint.config.mjs                   # Flat config (@nuxt/eslint-config preset)
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

The README and the `docs/` set are the user-facing reference. `src/` is what gets published; everything else is dev-time only.

## Day-to-day workflow

```bash
npm run dev          # Run the playground at http://localhost:3000

npm test             # Run the full Vitest suite once
npm run test:watch   # Vitest watch mode

npm run lint         # ESLint check
npm run lint:fix     # ESLint check + auto-fix

npm run prepack      # Build the module to dist/ (sanity check before publish)
```

Before opening a PR, run lint + tests + build locally — CI will run them again but local runs are faster to iterate on:

```bash
npm run lint && npm test && npm run prepack
```

## Code conventions

- **TypeScript everywhere.** All `.ts` and `<script setup lang="ts">`.
- **Single quotes, no semis, 2-space indent.** Enforced by `@nuxt/eslint-config` flat preset with stylistic rules in `eslint.config.mjs`. Run `npm run lint:fix` if formatting is off.
- **Comments for the *why*, not the *what*.** Self-documenting names beat comments. Reserve comments for hidden constraints, subtle invariants, or workarounds.
- **No `any` without a comment** — `@typescript-eslint/no-explicit-any` is set to `warn`. If you must use `any`, leave a one-line note about why.
- **Vue templates: multi-word component names off** (so `<ConfirmDialog>` style matches the public component names).

## Testing

Tests live in `test/` and use Vitest + happy-dom + @vue/test-utils.

- `test/useConfirmDialog.test.ts` — composable: `show`, promise resolution, convenience methods, supersession (calling `show` while another dialog is open cancels the previous one).
- `test/ConfirmDialog.test.ts` — single-dialog component: types, button rendering (default + custom), RTL detection, accessibility attributes, warning text rendering.
- `test/ConfirmDialogContainer.test.ts` — container: rendering when state is non-null, button-click → state-update flow, Teleport behavior.

When testing the container, prefer the `mountContainer({ ... })` helper which passes `teleport: false` so the rendered DOM stays inside the wrapper. Use the default `mount(ConfirmDialogContainer)` only when you specifically need to verify Teleport behavior.

When adding tests for the composable, **always cancel any in-flight dialog in `beforeEach`** — module-level state persists across tests within a file:

```ts
beforeEach(() => {
  const { currentDialog, cancel } = useConfirmDialog()
  if (currentDialog.value) cancel()
})
```

## Adding a new feature

A typical feature touches 4 files:

1. **`src/runtime/...`** — implementation (component, composable, plugin, etc.).
2. **`test/...`** — specs covering the feature.
3. **`README.md`** — user-facing docs (feature bullet, options table, API section).
4. **`docs/...`** — if the feature has notable design decisions, add to `design-decisions.md`; if it changes architecture, add to `architecture.md`.

Run the playground to verify visual changes manually:

```bash
npm run dev
# Open http://localhost:3000/test for the comprehensive demo
```

If the feature changes a public API surface, also update relevant tests so the contract is locked in.

## Release workflow

The library uses semver. Versions:

- **patch** (`0.0.x`) — bug fixes, internal-only changes
- **minor** (`0.x.0`) — new features, backwards-compatible
- **major** (`x.0.0`) — breaking changes

Steps:

```bash
# 1. Make sure main is clean and CI is green.
git status
git pull --ff-only
npm run lint && npm test && npm run prepack

# 2. Bump version (creates commit + tag automatically).
npm version <patch|minor|major> -m "Release v%s"
# example:
npm version patch -m "Release v%s"

# 3. Push commits and tag.
git push origin main --follow-tags

# 4. Publish to npm. The prepublishOnly hook re-runs lint + tests.
npm publish

# If 2FA is enabled and you're using a normal token:
npm publish --otp=<6-digit-code>

# If using a granular token with "Bypass 2FA" enabled:
npm publish    # (token in ~/.npmrc — never commit this!)
```

After publishing, verify:

```bash
npm view nuxt-confirm-dialog    # should show the new version
```

## Useful commands

```bash
npm publish --dry-run                      # See what would be published
npm pack                                   # Create a tarball locally for testing
npm view nuxt-confirm-dialog versions      # Show every published version

# Test the published package locally before tagging it as latest:
cd /path/to/some-other-project
npm install /path/to/confirm-dialogs/nuxt-confirm-dialog-X.Y.Z.tgz
```

## Filing issues / PRs

- **Bugs** — open at https://github.com/osameh15/confirm-dialogs/issues. Include Nuxt version, browser, and a minimal reproduction (Stackblitz preferred).
- **Features** — open an issue first to discuss scope before sending a PR. Saves rework.
- **PRs** — fork → branch → commit → PR. Keep commits focused (one logical change per commit) so review and revert are easy.

## CI

`.github/workflows/ci.yml` runs on every push and PR against `main`:

- **Lint job** — Node 22 only (the linter requires `Object.groupBy`).
- **Test/build job** — matrix across Node 20 and 22. Runs `dev:prepare`, tests, then `prepack`.

A green CI run is required before merging. If a Node-20-only failure is environmental (e.g. flaky network), retry the job; otherwise fix the root cause rather than dropping the matrix entry.
