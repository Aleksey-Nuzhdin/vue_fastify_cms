export type Popup = {
  id:number
  title: string
  text: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export type PopupDto = Partial<Omit<Popup, 'id'>>

export type PopupSettings = {
  showTimeout?: number
}
