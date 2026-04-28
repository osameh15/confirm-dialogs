import { describe, it, expect, beforeEach } from 'vitest'
import { useConfirmDialog } from '../src/runtime/composables/useConfirmDialog'

describe('useConfirmDialog', () => {
  beforeEach(() => {
    // Cancel any in-flight dialog so module-level state is clean.
    const { currentDialog, cancel } = useConfirmDialog()
    if (currentDialog.value) cancel()
  })

  describe('show()', () => {
    it('returns a Promise', () => {
      const result = useConfirmDialog().show({ title: 'A', message: 'B' })
      expect(result).toBeInstanceOf(Promise)
      // Settle the promise so it doesn't leak between tests.
      useConfirmDialog().cancel()
      return result
    })

    it('sets currentDialog with merged defaults', () => {
      const { show, currentDialog, cancel } = useConfirmDialog()
      show({ title: 'Hello', message: 'World' })
      expect(currentDialog.value).not.toBeNull()
      expect(currentDialog.value!.type).toBe('warning')
      expect(currentDialog.value!.title).toBe('Hello')
      expect(currentDialog.value!.message).toBe('World')
      expect(currentDialog.value!.confirmText).toBe('Confirm')
      expect(currentDialog.value!.cancelText).toBe('Cancel')
      expect(currentDialog.value!.warningText).toBeNull()
      expect(currentDialog.value!.buttons).toBeNull()
      expect(currentDialog.value!.visible).toBe(true)
      cancel()
    })

    it('respects all custom options', () => {
      const { show, currentDialog, cancel } = useConfirmDialog()
      show({
        type: 'error',
        title: 'Delete',
        message: 'Sure?',
        warningText: 'Cannot undo',
        confirmText: 'Yes',
        cancelText: 'No',
        buttons: [{ text: 'X', action: 'confirm' }],
      })
      expect(currentDialog.value!.type).toBe('error')
      expect(currentDialog.value!.warningText).toBe('Cannot undo')
      expect(currentDialog.value!.confirmText).toBe('Yes')
      expect(currentDialog.value!.cancelText).toBe('No')
      expect(currentDialog.value!.buttons).toHaveLength(1)
      cancel()
    })
  })

  describe('promise resolution', () => {
    it('resolves with "confirm" when confirm() is called', async () => {
      const { show, confirm } = useConfirmDialog()
      const pending = show({ title: 'A', message: 'B' })
      confirm()
      await expect(pending).resolves.toBe('confirm')
    })

    it('resolves with "cancel" when cancel() is called', async () => {
      const { show, cancel } = useConfirmDialog()
      const pending = show({ title: 'A', message: 'B' })
      cancel()
      await expect(pending).resolves.toBe('cancel')
    })

    it('resolves with custom action name when action() is called', async () => {
      const { show, action } = useConfirmDialog()
      const pending = show({ title: 'A', message: 'B' })
      action('save')
      await expect(pending).resolves.toBe('save')
    })

    it('clears currentDialog after resolution', async () => {
      const { show, confirm, currentDialog } = useConfirmDialog()
      const pending = show({ title: 'A', message: 'B' })
      expect(currentDialog.value).not.toBeNull()
      confirm()
      await pending
      expect(currentDialog.value).toBeNull()
    })

    it('cancels the previous dialog when show() is called again', async () => {
      const { show, confirm } = useConfirmDialog()
      const first = show({ title: 'First', message: '1' })
      show({ title: 'Second', message: '2' })

      // First should now resolve as cancelled (it was superseded).
      await expect(first).resolves.toBe('cancel')

      // Second is still active.
      confirm()
    })
  })

  describe('convenience methods', () => {
    it('confirmDelete resolves true when confirmed', async () => {
      const { confirmDelete, confirm } = useConfirmDialog()
      const pending = confirmDelete('item')
      confirm()
      await expect(pending).resolves.toBe(true)
    })

    it('confirmDelete resolves false when cancelled', async () => {
      const { confirmDelete, cancel } = useConfirmDialog()
      const pending = confirmDelete('item')
      cancel()
      await expect(pending).resolves.toBe(false)
    })

    it('confirmDelete uses error theme and includes the item name', () => {
      const { confirmDelete, currentDialog, cancel } = useConfirmDialog()
      confirmDelete('user "alice"')
      expect(currentDialog.value!.type).toBe('error')
      expect(currentDialog.value!.title).toBe('Confirm Deletion')
      expect(currentDialog.value!.message).toContain('user "alice"')
      expect(currentDialog.value!.warningText).toBe('This action cannot be undone.')
      cancel()
    })

    it.each([
      ['confirmAction', 'warning'],
      ['confirmInfo', 'info'],
      ['confirmSuccess', 'success'],
    ] as const)('%s applies theme %s', (method, theme) => {
      const dialog = useConfirmDialog()
      ;(dialog[method] as (...args: unknown[]) => Promise<boolean>)('Title', 'Body')
      expect(dialog.currentDialog.value!.type).toBe(theme)
      dialog.cancel()
    })

    it('confirmAction resolves true on confirm and false on cancel', async () => {
      const dialog = useConfirmDialog()

      const a = dialog.confirmAction('T', 'M')
      dialog.confirm()
      await expect(a).resolves.toBe(true)

      const b = dialog.confirmAction('T', 'M')
      dialog.cancel()
      await expect(b).resolves.toBe(false)
    })
  })
})
