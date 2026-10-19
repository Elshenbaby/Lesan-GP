import { useChildren } from '@/lib/api'
import { useChildMode } from '@/stores/childMode'

/** The child currently selected in the parent sidebar. */
export function useActiveChild() {
  const { data: children, isLoading } = useChildren()
  const activeChildId = useChildMode((s) => s.activeChildId)
  const child = children?.find((c) => c.id === activeChildId) ?? children?.[0]
  return { child, children, isLoading }
}
