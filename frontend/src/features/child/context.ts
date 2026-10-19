import { useOutletContext } from 'react-router-dom'
import type { Child, Guide } from '@/types/domain'

export interface ChildModeContext {
  child: Child
  guide: Guide | undefined
  guideName: string
}

/** Child pages read the active child + guide that ChildLayout loaded. */
export const useChildContext = () => useOutletContext<ChildModeContext>()
