import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { isLowPowerDevice } from './deviceCapability';

const ArcReactorCanvas = lazy(() => import('./ArcReactorCanvas'));

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

interface Props {
  children: React.ReactNode;
  /** Scroll progress (0-1) past which `children` fades in. */
  revealAt?: number;
}

/**
 * Tall scroll-scrubbed stage: a sticky full-viewport arc-reactor renders behind
 * `children`, which fades in once the user has scrolled past `revealAt`.
 * Mirrors the scroll-progress technique used by IronManScrollHero, but drives
 * a React Three Fiber scene via a ref instead of a video's currentTime.
 */
export default function ArcReactorScene({ children, revealAt = 0.3 }: Props) {
  const lowPower = useRef(isLowPowerDevice()).current;
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const tickingRef = useRef(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (lowPower) {
      setRevealed(true);
      return;
    }

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        tickingRef.current = false;
        const section = sectionRef.current;
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const scrollable = section.offsetHeight - window.innerHeight;
        const progress = clamp01(scrollable > 0 ? -rect.top / scrollable : 0);
        progressRef.current = progress;

        setRevealed((prev) => (prev === progress > revealAt ? prev : progress > revealAt));
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lowPower, revealAt]);

  if (lowPower) {
    return (
      <section className="relative w-full min-h-[100vh] flex flex-col items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.15),transparent_60%)]" />
        <h1 className="relative z-10 mb-8 font-display font-black text-4xl sm:text-5xl text-white tracking-tighter drop-shadow-[0_0_20px_rgba(0,212,255,0.5)]">
          FORGE PLANNER
        </h1>
        <div className="relative z-10 w-full">{children}</div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative w-full h-[220vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-black flex items-center justify-center">
        <Suspense fallback={<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.12),transparent_60%)]" />}>
          <div className="absolute inset-0">
            <ArcReactorCanvas progressRef={progressRef} />
          </div>
        </Suspense>

        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,212,255,0.06)_2px,transparent_2px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />

        <div
          className={`absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-500 ${
            revealed ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tighter text-center drop-shadow-[0_0_20px_rgba(0,212,255,0.5)] whitespace-nowrap">
            FORGE PLANNER
          </h1>
        </div>

        <div
          className={`relative z-10 w-full px-6 transition-all duration-700 ${
            revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
          }`}
        >
          {children}
        </div>

        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 font-display text-xs tracking-widest transition-opacity duration-500 ${
            revealed ? 'opacity-0' : 'opacity-100'
          }`}
        >
          SCROLL ↓
        </div>
      </div>
    </section>
  );
}
