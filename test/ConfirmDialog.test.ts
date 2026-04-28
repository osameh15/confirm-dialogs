import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from '../src/runtime/components/ConfirmDialog.vue'

describe('ConfirmDialog', () => {
  it('renders title and message when modelValue is true', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, title: 'Hello', message: 'World' },
    })
    expect(wrapper.find('.dialog-card').exists()).toBe(true)
    expect(wrapper.text()).toContain('Hello')
    expect(wrapper.text()).toContain('World')
  })

  it('does not render the card when modelValue is false', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: false, title: 'A', message: 'B' },
    })
    expect(wrapper.find('.dialog-card').exists()).toBe(false)
  })

  it.each([
    ['success', 'dialog-success'],
    ['warning', 'dialog-warning'],
    ['error', 'dialog-error'],
    ['info', 'dialog-info'],
  ] as const)('applies "%s" class for type "%s"', (type, className) => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, type, title: 'A', message: 'B' },
    })
    expect(wrapper.find('.dialog-card').classes()).toContain(className)
  })

  it('renders the warning text when provided', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, title: 'A', message: 'B', warningText: 'No undo' },
    })
    expect(wrapper.text()).toContain('No undo')
    expect(wrapper.find('.dialog-warning-text').exists()).toBe(true)
  })

  it('omits the warning element when warningText is null', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, title: 'A', message: 'B' },
    })
    expect(wrapper.find('.dialog-warning-text').exists()).toBe(false)
  })

  describe('default buttons', () => {
    it('renders Cancel + Confirm with custom labels', () => {
      const wrapper = mount(ConfirmDialog, {
        props: {
          modelValue: true,
          title: 'A',
          message: 'B',
          confirmText: 'Yes please',
          cancelText: 'No thanks',
        },
      })
      const buttons = wrapper.findAll('.dialog-btn')
      expect(buttons).toHaveLength(2)
      expect(buttons[0].text()).toBe('No thanks')
      expect(buttons[1].text()).toBe('Yes please')
    })

    it('emits confirm when the confirm button is clicked', async () => {
      const wrapper = mount(ConfirmDialog, {
        props: { modelValue: true, title: 'A', message: 'B' },
      })
      await wrapper.findAll('.dialog-btn')[1].trigger('click')
      expect(wrapper.emitted('confirm')).toBeTruthy()
    })

    it('emits cancel when the cancel button is clicked', async () => {
      const wrapper = mount(ConfirmDialog, {
        props: { modelValue: true, title: 'A', message: 'B' },
      })
      await wrapper.findAll('.dialog-btn')[0].trigger('click')
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })

  describe('custom buttons', () => {
    it('renders the supplied buttons in order', () => {
      const wrapper = mount(ConfirmDialog, {
        props: {
          modelValue: true,
          title: 'A',
          message: 'B',
          buttons: [
            { text: 'Cancel', action: 'cancel', variant: 'outlined', color: 'default' },
            { text: 'Discard', action: 'discard', variant: 'flat', color: 'default' },
            { text: 'Save', action: 'save', variant: 'flat', color: 'info' },
          ],
        },
      })
      const buttons = wrapper.findAll('.dialog-btn')
      expect(buttons).toHaveLength(3)
      expect(buttons.map(b => b.text())).toEqual(['Cancel', 'Discard', 'Save'])
    })

    it('emits "action" with the action name for non-confirm/cancel buttons', async () => {
      const wrapper = mount(ConfirmDialog, {
        props: {
          modelValue: true,
          title: 'A',
          message: 'B',
          buttons: [{ text: 'Save', action: 'save', variant: 'flat', color: 'info' }],
        },
      })
      await wrapper.find('.dialog-btn').trigger('click')
      expect(wrapper.emitted('action')).toEqual([['save']])
    })

    it('grid layout class matches the button count', () => {
      const wrapper = mount(ConfirmDialog, {
        props: {
          modelValue: true,
          title: 'A',
          message: 'B',
          buttons: [{ text: 'X', action: 'confirm' }],
        },
      })
      expect(wrapper.find('.dialog-actions').classes()).toContain('actions-1')
    })
  })

  describe('direction (RTL auto-detection)', () => {
    it('uses dir="ltr" for Latin text', () => {
      const wrapper = mount(ConfirmDialog, {
        props: { modelValue: true, title: 'Save?', message: 'Save your work?' },
      })
      expect(wrapper.find('.dialog-card').attributes('dir')).toBe('ltr')
    })

    it('switches to dir="rtl" when title contains Persian script', () => {
      const wrapper = mount(ConfirmDialog, {
        props: { modelValue: true, title: 'حذف فایل', message: 'Sure?' },
      })
      expect(wrapper.find('.dialog-card').attributes('dir')).toBe('rtl')
    })

    it('switches to dir="rtl" when warningText is Arabic', () => {
      const wrapper = mount(ConfirmDialog, {
        props: {
          modelValue: true,
          title: 'A',
          message: 'B',
          warningText: 'لا يمكن التراجع',
        },
      })
      expect(wrapper.find('.dialog-card').attributes('dir')).toBe('rtl')
    })
  })

  it('has role="alertdialog" and aria-modal="true"', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, title: 'A', message: 'B' },
    })
    expect(wrapper.find('.dialog-card').attributes('role')).toBe('alertdialog')
    expect(wrapper.find('.dialog-card').attributes('aria-modal')).toBe('true')
  })
})
