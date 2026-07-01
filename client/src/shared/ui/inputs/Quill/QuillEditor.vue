<template>
  <QuillEditor :toolbar='"#toolbar"+id' theme="snow" :placeholder="placeholder"
    style="background-color: white;"
    @ready="onEditorReady"
  >
    <template #toolbar>
      <div :id="'toolbar'+ id"  style="background-color: white;">
        <!-- Add font size dropdown -->
        <select class="ql-size">
          <option value="small"></option>
          <!-- Note a missing, thus falsy value, is used to reset to default -->
          <option selected></option>
          <option value="large"></option>
          <option value="huge"></option>
        </select>
        <!-- Add a bold button -->
        <button class="ql-bold"></button>
        <button class="ql-italic"></button>
        <button class="ql-underline"></button>
        <button class="ql-blockquote"></button>
        <!-- <button class="ql-code-block"></button> -->
        <button class="ql-link"></button>
        <!-- <button class="ql-formula"></button> -->
        <!-- Add subscript and superscript buttons -->

        <!-- <button class="ql-script" value="sub"></button>
        <button class="ql-script" value="super"></button> -->
        <button class="ql-clean"></button>
        <div class="quill_editr__custom_btn_container" >
          <template v-if="isOverHeight">
            <button class="ql__btn__show_hide rounded-lg" @click="showHide">
              {{quillHeight === 'unset' ?
                $t('quill.collapse') : $t('quill.expand')
              }}
            </button>
            <div class="dot"/>
          </template>
          <button class="ql__btn__show_hide text-gray-50 rounded-lg" @click="clearValue">
            {{ $t('quill.clear') }}
          </button>
        </div>

      </div>
    </template>
  </QuillEditor>
</template>
<script>
import { QuillEditor, Quill } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import i18n from '@/i18n'

// Custom Link format that preserves target="_blank" attribute
const Link = Quill.import('formats/link')
class CustomLink extends Link {
  static create(value) {
    const href = typeof value === 'object' ? value.href : value
    const node = super.create(href)
    if (typeof value === 'object' && value.target === '_blank') {
      node.setAttribute('target', '_blank')
    }
    return node
  }
  static formats(domNode) {
    return domNode.getAttribute('href')
  }
  format(name, value) {
    if (name === this.statics.blotName) {
      if (!value) {
        super.format(name, value)
      } else {
        const href = typeof value === 'object' ? value.href : value
        const target = typeof value === 'object' ? value.target : null
        this.domNode.setAttribute('href', this.statics.sanitize(href))
        if (target === '_blank') {
          this.domNode.setAttribute('target', '_blank')
          this.domNode.setAttribute('rel', 'noopener noreferrer')
        } else {
          this.domNode.removeAttribute('target')
          this.domNode.removeAttribute('rel')
        }
      }
    } else {
      super.format(name, value)
    }
  }
}
CustomLink.blotName = 'link'
CustomLink.tagName = 'A'
Quill.register(CustomLink, true)

export default {
  props:{
    isOverHeight:Boolean,
    quillHeight:{
      type:String,
      default:'unset'
    },
    placeholder:{
      type:String,
      default:''
    },
    id:String,
  },
  emits:['toggleHeight', 'clearValue'],
  components: {
    QuillEditor
  },
  methods:{
    showHide(){ this.$emit('toggleHeight') },
    clearValue(){ this.$emit('clearValue') },
    onEditorReady(quill) {
      const tooltip = quill.theme.tooltip
      const tooltipRoot = tooltip.root

      // Inject "open in new tab" checkbox into the link tooltip
      const container = document.createElement('div')
      container.className = 'ql-link-newtab'
      const checkboxId = `ql-newtab-${this.id || Math.random().toString(36).slice(2)}`
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.id = checkboxId
      const label = document.createElement('label')
      label.textContent = i18n.global.t('quill.openInNewTab')
      label.htmlFor = checkboxId
      container.appendChild(checkbox)
      container.appendChild(label)
      tooltipRoot.appendChild(container)

      // When editing an existing link — pre-check the checkbox based on its target attr
      const originalEdit = tooltip.edit.bind(tooltip)
      tooltip.edit = function(mode, preview) {
        originalEdit(mode, preview)
        if (mode === 'link') {
          const range = quill.getSelection() || quill.selection.savedRange
          let isNewTab = false
          if (range) {
            try {
              const [leaf] = quill.getLeaf(range.index)
              const parent = leaf?.parent
              if (parent?.statics?.blotName === 'link') {
                isNewTab = parent.domNode.getAttribute('target') === '_blank'
              }
            } catch (_) {}
          }
          checkbox.checked = isNewTab
        }
      }

      // Override save to include target when checkbox is checked
      tooltip.save = function() {
        const mode = tooltipRoot.getAttribute('data-mode')
        if (mode === 'link') {
          const href = tooltip.textbox.value.trim()
          const { scrollTop } = quill.root
          const value = href
            ? (checkbox.checked ? { href, target: '_blank' } : href)
            : false
          if (tooltip.linkRange) {
            quill.formatText(tooltip.linkRange, 'link', value)
            delete tooltip.linkRange
          } else {
            tooltip.restoreFocus()
            quill.format('link', value)
          }
          quill.root.scrollTop = scrollTop
        }
        tooltip.hide()
      }
    }
  }
}
</script>
<style lang="scss">
  .ql__btn__show_hide{
    width:unset !important;
    padding: 0 4px !important;
    font-size: 14px;
    color: var(--colors-primary)
  }
  .quill_editr__custom_btn_container{
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ql-link-newtab {
    display: none;
    align-items: center;
    gap: 6px;
    padding: 4px 6px 0;
    font-size: 13px;

    input[type="checkbox"] {
      cursor: pointer;
      width: 14px;
      height: 14px;
      margin: 0;
      flex-shrink: 0;
    }

    label {
      cursor: pointer;
      color: #555;
      white-space: nowrap;
    }
  }

  .ql-tooltip[data-mode=link] .ql-link-newtab {
    display: flex;
  }
</style>
