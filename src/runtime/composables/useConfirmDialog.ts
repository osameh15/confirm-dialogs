import { ref } from 'vue'

export type ConfirmDialogType = 'success' | 'warning' | 'error' | 'info'

export interface ConfirmDialogButton {
  /** Visible text on the button. */
  text: string
  /**
   * Action returned to the caller when this button is clicked.
   * - `'confirm'` → `show()` resolves with `'confirm'`; `confirmDelete()` etc. resolve with `true`.
   * - `'cancel'` → `show()` resolves with `'cancel'`; convenience methods resolve with `false`.
   * - any other string → `show()` resolves with that string.
   */
  action?: string
  /**
   * Visual style. `'flat'` is the default for confirm-style buttons.
   * `'outlined'` is the default for cancel-style buttons.
   */
  variant?: 'flat' | 'outlined'
  /** Override the button color. Defaults to the dialog `type` color for confirm buttons. */
  color?: ConfirmDialogType | 'default'
}

export interface ConfirmDialogOptions {
  type?: ConfirmDialogType
  title: string
  message: string
  /** Optional emphasis line shown below the message (yellow). */
  warningText?: string | null
  /** Text on the default confirm button. Ignored if `buttons` is set. */
  confirmText?: string
  /** Text on the default cancel button. Ignored if `buttons` is set. */
  cancelText?: string
  /** Custom buttons array (1–3). When set, overrides `confirmText`/`cancelText`. */
  buttons?: ConfirmDialogButton[] | null
}

export interface ConfirmDialogInstance extends Required<Omit<ConfirmDialogOptions, 'buttons' | 'warningText'>> {
  warningText: string | null
  buttons: ConfirmDialogButton[] | null
  visible: boolean
}

const currentDialog = ref<ConfirmDialogInstance | null>(null)
let resolveAction: ((action: string) => void) | null = null

export const useConfirmDialog = () => {
  const show = (options: ConfirmDialogOptions): Promise<string> => {
    // If a dialog is already open, cancel it first so its promise settles.
    if (resolveAction) {
      resolveAction('cancel')
      resolveAction = null
    }

    currentDialog.value = {
      type: options.type ?? 'warning',
      title: options.title,
      message: options.message,
      warningText: options.warningText ?? null,
      confirmText: options.confirmText ?? 'Confirm',
      cancelText: options.cancelText ?? 'Cancel',
      buttons: options.buttons ?? null,
      visible: true,
    }

    return new Promise<string>((resolve) => {
      resolveAction = resolve
    })
  }

  const respond = (action: string): void => {
    if (resolveAction) {
      resolveAction(action)
      resolveAction = null
    }
    currentDialog.value = null
  }

  const confirm = (): void => respond('confirm')
  const cancel = (): void => respond('cancel')
  const action = (name: string): void => respond(name)

  /** Convenience: returns `true` if confirmed, `false` otherwise. */
  const confirmDelete = async (
    itemName = 'this item',
    customMessage?: string | null,
    customWarning: string | null = 'This action cannot be undone.',
  ): Promise<boolean> => {
    const result = await show({
      type: 'error',
      title: 'Confirm Deletion',
      message: customMessage ?? `Are you sure you want to delete ${itemName}?`,
      warningText: customWarning,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    })
    return result === 'confirm'
  }

  const confirmAction = async (
    title: string,
    message: string,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
  ): Promise<boolean> => {
    const result = await show({ type: 'warning', title, message, confirmText, cancelText })
    return result === 'confirm'
  }

  const confirmInfo = async (
    title: string,
    message: string,
    confirmText = 'OK',
    cancelText = 'Cancel',
  ): Promise<boolean> => {
    const result = await show({ type: 'info', title, message, confirmText, cancelText })
    return result === 'confirm'
  }

  const confirmSuccess = async (
    title: string,
    message: string,
    confirmText = 'Continue',
    cancelText = 'Cancel',
  ): Promise<boolean> => {
    const result = await show({ type: 'success', title, message, confirmText, cancelText })
    return result === 'confirm'
  }

  return {
    /** The currently visible dialog instance, or null. Reactive. */
    currentDialog,
    /** Open a dialog. Resolves with the action string (`'confirm'`, `'cancel'`, or a custom name). */
    show,
    /** Resolve the active dialog as confirmed. Used by the container — rarely called directly. */
    confirm,
    /** Resolve the active dialog as cancelled. Used by the container — rarely called directly. */
    cancel,
    /** Resolve the active dialog with a custom action name. Used by the container. */
    action,
    /** `Promise<boolean>` — resolves `true` if confirmed. Themed as error (red). */
    confirmDelete,
    /** `Promise<boolean>` — resolves `true` if confirmed. Themed as warning (yellow). */
    confirmAction,
    /** `Promise<boolean>` — resolves `true` if confirmed. Themed as info (cyan). */
    confirmInfo,
    /** `Promise<boolean>` — resolves `true` if confirmed. Themed as success (green). */
    confirmSuccess,
  }
}
