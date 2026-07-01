import type { JsonGuard } from '../../json.type.shared'
import type { PageData as Page } from '../form.types.shared'

export type FooterNavLink = {
  title: string
  url: string
}

export type FooterNav = {
  title: string
  links: FooterNavLink[]
}

export type FooterContactItem = {
  value: string
}

export type FooterContacts = {
  title: string
  items: FooterContactItem[]
}

type FooterSocialItemIcon = 'tg' | 'vk' | 'didya_maior'

export type FooterSocialItem = {
  icon: FooterSocialItemIcon
  url: string
}

export type FooterData = {
  nav: FooterNav
  contacts: FooterContacts
  social: FooterSocialItem[]
}

export type PageData = Page<FooterData>

export interface InitionalValues {
  nav: {
    title: string
    links: FooterNavLink[]
  }
  contacts: {
    title: string
    items: FooterContactItem[]
  }
  social: FooterSocialItem[]
}

type _guard = JsonGuard<InitionalValues>
