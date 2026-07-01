import scssVariables from './../styles/export.module.scss'

export type NameBreakpoint = 'ultra' | 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'mobileOnly'

export function useGetBreakpointVariables(){
  const getNumber = (value:any):number =>{
    const num = Number(value.replace("px",""))
    if(!Number.isNaN(num)){
      return num
    }
    return 0
  }
  const ultraSize = getNumber(scssVariables.breakpointXl)
  const desktopSize = getNumber(scssVariables.breakpointXl)
  const laptopSize = getNumber(scssVariables.breakpointLg)
  const tabletSize = getNumber(scssVariables.breakpointMd)
  const mobileSize = getNumber(scssVariables.breakpointSm)
  const mobileOnlySize = getNumber(scssVariables.breakpointXs)

  const sizeNameList:NameBreakpoint[] = ['ultra', 'desktop', 'laptop', 'tablet', 'mobile', 'mobileOnly']

  const breakpointsMap:Record<NameBreakpoint,number> = {
    ultra: ultraSize,
    desktop: desktopSize,
    laptop: laptopSize,
    tablet: tabletSize,
    mobile: mobileSize,
    mobileOnly: mobileOnlySize,
  }
  return {
    breakpointsMap,
    sizeNameList
  }
}


