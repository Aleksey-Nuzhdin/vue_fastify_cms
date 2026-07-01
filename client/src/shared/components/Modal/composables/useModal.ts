import { computed, nextTick, ref, shallowRef, triggerRef, type Ref } from 'vue'

type ModalNode = HTMLDialogElement | null
type StatusClass = 'open-start' | 'open-process' | 'open-end' | 'close-start' | 'close-process' | 'close-end' | ''
type ModalItem = {
  id:string,
  node:Ref<ModalNode>,
  statusClass:Ref<StatusClass>
}

const modalList = shallowRef<ModalItem[]>([])

export function useModal(id:string) {
  const modalItem = computed(() => modalList.value.find(el=> el.id === id))

  if(!modalItem.value){
    modalList.value.push({ id, node: ref(null), statusClass: ref('') })
    triggerRef(modalList)
  }

  const setNode = (nodeRef:Ref<ModalNode>)=>{
    if(!modalItem.value) return
    modalItem.value.node = nodeRef
    triggerRef(modalList)
  }

  const node = computed(()=> modalItem.value?.node.value ?? null)
  const openModal = async ()=>{
    const item = modalItem.value
    if(!item) return

    item.statusClass.value = 'open-start'

    await nextTick()
    const scrollY = window.scrollY
    node.value?.showModal()
    window.scrollTo({ top: scrollY, behavior: 'instant' })
    setTimeout(()=>{
      item.statusClass.value = 'open-process'
    },1)
    setTimeout(()=>{
      item.statusClass.value = 'open-end'
    }, 300)
  }
  const closeModal = ()=>{
    const item = modalItem.value
    if(!item) return

    item.statusClass.value = 'close-start'
    setTimeout(()=>{
      item.statusClass.value = 'close-process'
    },1)
    setTimeout(()=>{
      node.value?.close()
      item.statusClass.value = 'close-end'
      setTimeout(()=>{
        item.statusClass.value = ''
      },1)
    }, 150)

  }
  const closeTopModal = ()=>{}
  const closeAllModals = ()=>{}

  const modals = computed(() => modalList.value)
  const statusClass = computed(() => modalItem.value?.statusClass.value ?? '')
  const hasOpenModals = computed(() => modalList.value.length > 0)

  return {
    modals,
    node,
    setNode,
    openModal,
    closeModal,
    closeTopModal,
    closeAllModals,
    hasOpenModals,
    statusClass,
  }
}
