import type { PageData } from '../form.types.shared'

export type BannerButton = {
  title: string
  url: string
  color: 'primary' | 'accent' | 'secondary'| 'success' | 'warning' | 'error' | 'light-gray'
  type?: 'outline' | 'filled',
  isHide?: boolean
}

export type BannerPageData = {
  title: string
  id: string
  title_date: string
  baner_img: string
  sumbtitle: string
  buttons: BannerButton[]
  place: string
  type: string
  archive: string
}

export type BannerData = PageData<BannerPageData>

type ProgramEvent = {
  time: string
  description: string
}
export type ProgramItem = {
  day: string
  events: ProgramEvent[]
}

export type ProgramPageData = {
  title: string
  isShow: boolean
  id: string
  link: string
  days: ProgramItem[]
}

export type ProgramData = PageData<ProgramPageData>

export type CommitteeMemberName = {
  last: string
  first: string
  middle: string
}

export type CommitteeMember = {
  name: CommitteeMemberName
  description: string
  image: string
}

export type CommitteePageData = {
  title: string
  isShow: boolean
  id: string
  members: CommitteeMember[]
}

export type CommitteeData = PageData<CommitteePageData>
