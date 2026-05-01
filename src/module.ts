import {
  defineNuxtModule,
  addComponent,
  addImports,
  addPlugin,
  createResolver,
} from '@nuxt/kit'

export interface ModuleOptions {
  /** Component name prefix. Defaults to `Confirm` (so components are `<ConfirmDialog>` and `<ConfirmDialogContainer>`). */
  prefix?: string
  /**
   * Initial visual theme. Can be changed at runtime via
   * `useConfirmDialog().setTheme(...)`. Defaults to `'dark'`.
   */
  theme?: 'dark' | 'light'
  /**
   * If true, a `<ConfirmDialogContainer>` is mounted automatically on the
   * client and you only need to call `useConfirmDialog()`. If false, mount
   * `<ConfirmDialogContainer />` yourself somewhere in your app
   * (e.g. `app.vue`). Defaults to `true`.
   */
  autoMount?: boolean
  /**
   * Whether the dialog can be dismissed by clicking the backdrop.
   * Defaults to `false` — the dialog is persistent and only closes on a
   * button action or the Escape key (if `escapeToCancel` is enabled).
   */
  closeOnBackdropClick?: boolean
  /**
   * Whether pressing the Escape key cancels the dialog. Defaults to `true`.
   */
  escapeToCancel?: boolean
  /**
   * Inject bundled Persian "Shabnam" font (5 weights, woff2) via @font-face.
   * Uses unicode-range so the file is only downloaded for documents that
   * actually contain Arabic / Persian script. Defaults to `true`.
   */
  loadShabnamFont?: boolean
  /**
   * Add Inter (Google Fonts) as the modern English UI typeface via a
   * `<link>` in the document head. Set `false` if you self-host fonts or
   * want to avoid the network request. Defaults to `true`.
   */
  loadInterFont?: boolean
}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    confirmDialog: {
      closeOnBackdropClick: boolean
      escapeToCancel: boolean
      theme: 'dark' | 'light'
    }
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-confirm-dialog',
    configKey: 'confirmDialog',
    compatibility: {
      nuxt: '^3.13.0 || ^4.0.0',
    },
  },
  defaults: {
    prefix: 'Confirm',
    autoMount: true,
    closeOnBackdropClick: false,
    escapeToCancel: true,
    theme: 'dark',
    loadShabnamFont: true,
    loadInterFont: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.public.confirmDialog = {
      closeOnBackdropClick: options.closeOnBackdropClick!,
      escapeToCancel: options.escapeToCancel!,
      theme: options.theme!,
    }

    // Theme variables — must always load so var(--confirm-*) resolves.
    nuxt.options.css = nuxt.options.css || []
    nuxt.options.css.push(resolver.resolve('./runtime/assets/styles/confirm-dialog-theme.css'))

    addComponent({
      name: `${options.prefix}Dialog`,
      filePath: resolver.resolve('./runtime/components/ConfirmDialog.vue'),
    })
    addComponent({
      name: `${options.prefix}DialogContainer`,
      filePath: resolver.resolve('./runtime/components/ConfirmDialogContainer.vue'),
    })

    addImports({
      name: 'useConfirmDialog',
      from: resolver.resolve('./runtime/composables/useConfirmDialog'),
    })

    if (options.loadShabnamFont) {
      nuxt.options.css.push(resolver.resolve('./runtime/assets/styles/confirm-dialog-fonts.css'))
    }

    if (options.loadInterFont) {
      nuxt.options.app = nuxt.options.app || {}
      nuxt.options.app.head = nuxt.options.app.head || {}
      nuxt.options.app.head.link = nuxt.options.app.head.link || []
      nuxt.options.app.head.link.push(
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        },
      )
    }

    if (options.autoMount) {
      addPlugin({
        src: resolver.resolve('./runtime/plugin.client'),
        mode: 'client',
      })
    }
  },
})
