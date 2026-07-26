import React, { useEffect, useRef, useState } from 'react';
import { isLowPowerDevice } from '../three/deviceCapability';

interface IronManScrollHeroProps {
  userName?: string;
  stats?: { total: number };
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Scroll-scrubbed cinematic hero: a tall section pins a sticky full-viewport
 * stage while the user scrolls, video currentTime is driven directly by
 * scroll progress, and mouse position drives a parallax layer — all via refs,
 * React state only flips at the few text-visibility thresholds.
 */
export default function IronManScrollHero({ userName = 'Kartik', stats }: IronManScrollHeroProps) {
  const lowPower = useRef(isLowPowerDevice()).current;

  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const durationRef = useRef(0);
  const tickingRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0 }); // normalized -1..1
  const parallaxCurrentRef = useRef({ x: 0, y: 0 });

  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [statusVisible, setStatusVisible] = useState(false);

  // Scroll → video scrub + text-threshold state (RAF + ticking, direct DOM for the hot path)
  useEffect(() => {
    if (lowPower) return;

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const section = sectionRef.current;
        const video = videoRef.current;
        tickingRef.current = false;
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const scrollable = section.offsetHeight - window.innerHeight;
        const progress = clamp01(scrollable > 0 ? -rect.top / scrollable : 0);

        if (video && durationRef.current > 0) {
          const target = progress * durationRef.current;
          if (Math.abs(video.currentTime - target) > 1 / 24) {
            video.currentTime = target;
          }
        }

        setWelcomeVisible((prev) => (prev === progress > 0.42 ? prev : progress > 0.42));
        setStatusVisible((prev) => (prev === progress > 0.62 ? prev : progress > 0.62));
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lowPower]);

  // Mouse → parallax (continuous RAF lerp loop, independent of scroll)
  useEffect(() => {
    if (lowPower) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let frameId: number;
    const animate = () => {
      const cur = parallaxCurrentRef.current;
      const target = mouseRef.current;
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;

      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translate3d(${cur.x * 22}px, ${cur.y * 14}px, 0) scale(1.05)`;
      }
      if (textRef.current) {
        textRef.current.style.transform = `translate3d(${cur.x * -12}px, ${cur.y * -8}px, 0)`;
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, [lowPower]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      durationRef.current = videoRef.current.duration;
      videoRef.current.pause();
    }
  };

  if (lowPower) {
    return (
      <section className="relative w-full min-h-[70vh] flex items-center justify-center bg-black overflow-hidden">
        <img src="/videos/ironman-poster.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
        <div className="relative z-10 text-center px-6">
          <h1 className="font-display font-black text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-[var(--color-arc-cyan)] to-[#0088AA] tracking-tighter">
            Welcome, {userName}
          </h1>
          {stats && (
            <p className="mt-4 text-[var(--color-arc-cyan)]/80 font-display text-sm tracking-widest">
              GOALS ACTIVE — <span className="font-bold">{stats.total}</span>
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative w-full h-[350vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        <div ref={parallaxRef} className="absolute inset-0 will-change-transform">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src="/videos/ironman-cinematic-scrub.mp4"
            poster="/videos/ironman-poster.jpg"
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={handleLoadedMetadata}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,212,255,0.06)_2px,transparent_2px)] [background-size:20px_20px] pointer-events-none" />

        <div ref={textRef} className="absolute inset-0 flex items-center justify-center will-change-transform">
          <div className="text-center px-6">
            <h1
              className={`font-display font-black text-5xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-white via-[var(--color-arc-cyan)] to-[#0088AA] tracking-tighter drop-shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-all duration-700 ${
                welcomeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              Welcome, {userName}
            </h1>

            <div
              className={`mt-8 space-y-3 font-display text-sm md:text-base tracking-widest text-[var(--color-arc-cyan)] transition-all duration-700 ${
                statusVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <p>SYSTEM: ONLINE</p>
              <p>AUTHENTICATING... USER IDENTIFIED.</p>
              {stats && (
                <p className="text-white/70">
                  GOALS ACTIVE — <span className="text-[var(--color-arc-cyan)] font-bold">{stats.total}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 font-display text-xs tracking-widest transition-opacity duration-500 ${
            welcomeVisible ? 'opacity-0' : 'opacity-100'
          }`}
        >
          SCROLL ↓
        </div>
      </div>
    </section>
  );
}
