import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils/cn'

gsap.registerPlugin(useGSAP)

/** Animates each route in with the reference's soft rise + fade. */
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  const { pathname } = useLocation()
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform' },
      )
      gsap.fromTo(
        '[data-reveal]',
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.1 },
      )
    },
    { scope: ref, dependencies: [pathname], revertOnUpdate: true },
  )

  return (
    <div ref={ref} key={pathname} className={cn('invisible', className)}>
      {children}
    </div>
  )
}
