# Documentation

Technical reference for `nuxt-confirm-dialog`.

The main [README](../README.md) covers installation, options, and the public API. The pages here go deeper for users and contributors who need to understand how the module is built or want to customize it beyond the basics.

## Contents

| Doc | What's in it |
| --- | --- |
| [Architecture](./architecture.md) | How the module, runtime composable, dialog component, and auto-mount plugin fit together. State sharing across Vue app instances. Promise resolution flow. Teleport behavior. RTL detection. |
| [Customization](./customization.md) | Override styles, replace fonts, theme per-type, custom animations, manual mounting, focus and keyboard behavior, accessibility. |
| [Design decisions](./design-decisions.md) | Q&A on the major choices — no Vuetify, single-instance state, Promise-resolves-always API, Teleport, auto-RTL, persistent backdrop default, font strategy, Nuxt 3+4 support. |
| [Contributing](./contributing.md) | Local dev setup, testing, conventions, release workflow. |
