import { useMobileStore } from '@/stores/mobileStore'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const isMobile = useMobileStore((s) => s.isMobile)
  return !!isMobile
}