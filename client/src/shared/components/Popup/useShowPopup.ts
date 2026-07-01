import { computed, ref } from 'vue'
import type { Popup, PopupDto, PopupSettings } from './showPopup.types'

const popupList = ref<Popup[]>([])

export function useShowPopup({showTimeout = 5000}:PopupSettings = {}) {
  const defaultPopup:Popup = {
    id: 0,
    title: '',
    text: '',
    type: 'success',
  }
  const addPopup = (popup:PopupDto) => {
    const id = Date.now()
    popupList.value.push({ ...defaultPopup, ...popup, id })

    setTimeout(() => removePopup(id), showTimeout )
  }

  const removePopup = (id:number) =>{
    const index = popupList.value.findIndex(popup => popup.id === id)
    popupList.value.splice(index, 1)
  }

  const popups = computed(() => popupList.value)

  const addErrorPopup = (text:string, title?:string) => addPopup({ title, text, type: 'error' })
  const addInfoPopup = (text:string,  title?:string) => addPopup({ title, text, type: 'info' })
  const addSuccessPopup = (text:string,  title?:string) => addPopup({ title, text, type: 'success' })
  const addWarningPopup = (text:string,  title?:string) => addPopup({ title, text, type: 'warning' })

  return {
    addPopup,
    removePopup,
    popups,
    addErrorPopup,
    addInfoPopup,
    addSuccessPopup,
    addWarningPopup,
  }
}
