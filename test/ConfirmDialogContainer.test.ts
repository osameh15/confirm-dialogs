import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ConfirmDialogContainer from '../src/runtime/components/ConfirmDialogContainer.vue'
import { useConfirmDialog } from '../src/runtime/composables/useConfirmDialog'

const mountContainer = (props: Record<string, unknown> = {}) =>
  mount(ConfirmDialogContainer, { props: { teleport: false, ...props } })

describe('ConfirmDialogContainer', () => {
  beforeEach(() => {
    const { currentDialog, cancel } = useConfirmDialog()
    if (currentDialog.value) cancel()
  })

  it('renders nothing when no dialog is active', () => {
    const wrapper = mountContainer()
    expect(wrapper.find('.dialog-card').exists()).toBe(false)
  })

  it('renders the active dialog from useConfirmDialog state', async () => {
    const { show, cancel } = useConfirmDialog()
    show({ title: 'Are you sure?', message: 'This is permanent.' })

    const wrapper = mountContainer()
    await flushPromises()

    expect(wrapper.find('.dialog-card').exists()).toBe(true)
    expect(wrapper.text()).toContain('Are you sure?')
    expect(wrapper.text()).toContain('This is permanent.')
    cancel()
  })

  it('confirm button click resolves the show() promise with "confirm"', async () => {
    const { show } = useConfirmDialog()
    const pending = show({ title: 'A', message: 'B' })

    const wrapper = mountContainer()
    await flushPromises()

    await wrapper.findAll('.dialog-btn')[1].trigger('click')
    await flushPromises()

    await expect(pending).resolves.toBe('confirm')
  })

  it('cancel button click resolves with "cancel"', async () => {
    const { show } = useConfirmDialog()
    const pending = show({ title: 'A', message: 'B' })

    const wrapper = mountContainer()
    await flushPromises()

    await wrapper.findAll('.dialog-btn')[0].trigger('click')
    await flushPromises()

    await expect(pending).resolves.toBe('cancel')
  })

  it('custom action button resolves with the action name', async () => {
    const { show } = useConfirmDialog()
    const pending = show({
      title: 'Save?',
      message: 'Edits exist.',
      buttons: [
        { text: 'Cancel', action: 'cancel', variant: 'outlined', color: 'default' },
        { text: 'Discard', action: 'discard', variant: 'flat', color: 'default' },
        { text: 'Save', action: 'save', variant: 'flat', color: 'info' },
      ],
    })

    const wrapper = mountContainer()
    await flushPromises()

    await wrapper.findAll('.dialog-btn')[2].trigger('click') // "Save"
    await flushPromises()

    await expect(pending).resolves.toBe('save')
  })

  it('teleports to document.body by default', async () => {
    const { show, cancel } = useConfirmDialog()
    show({ title: 'Teleported', message: 'Hi' })

    const wrapper = mount(ConfirmDialogContainer)
    await flushPromises()

    expect(wrapper.find('.dialog-card').exists()).toBe(false)
    expect(document.body.querySelector('.dialog-card')).not.toBeNull()
    expect(document.body.querySelector('.dialog-title')?.textContent)
      .toContain('Teleported')

    cancel()
    wrapper.unmount()
  })
})
