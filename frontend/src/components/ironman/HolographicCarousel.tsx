import React, { useState } from 'react';
import type { GoalTemplate } from '../onboarding/OnboardingWizard';
import { Cpu, Code2, BookOpen, Rocket, Globe, Pencil } from 'lucide-react';

export const TEMPLATES = [
  {
    title: 'Master DSA (Striver A-Z)',
    category: 'DSA',
    type: 'dsa',
    isDSA: true,
    icon: Code2,
    description: 'Complete 440+ curated problems from the famous Striver A-Z sheet.',
  },
  {
    title: 'Competitive Programming',
    category: 'Competitive Programming',
    type: 'competitive',
    isDSA: false,
    icon: Cpu,
    description: 'Practice contest-style problems on Codeforces, Leetcode, and AtCoder.',
  },
  {
    title: 'System Design Mastery',
    category: 'System Design',
    type: 'system_design',
    isDSA: false,
    icon: Globe,
    description: 'Learn to design scalable distributed systems from scratch.',
  },
  {
    title: 'Learn a New Language',
    category: 'Language Learning',
    type: 'language',
    isDSA: false,
    icon: BookOpen,
    description: 'Track vocabulary, grammar, and fluency milestones.',
  },
  {
    title: 'Build a Project',
    category: 'Project',
    type: 'project',
    isDSA: false,
    icon: Rocket,
    description: 'Plan, track, and ship your personal or professional project.',
  },
  {
    title: 'Custom Goal',
    category: 'Custom',
    type: 'custom',
    isDSA: false,
    icon: Pencil,
    description: 'Build your own tracking dashboard from scratch.',
  },
];

export default function HolographicCarousel({ onSelect }: { onSelect: (tpl: any) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const N = TEMPLATES.length;
  const theta = 360 / N;
  const radius = 350; // Distance from center of cylinder

  const handleNext = () => setActiveIndex((prev) => prev + 1);
  const handlePrev = () => setActiveIndex((prev) => prev - 1);

  return (
    <div className="relative h-[400px] w-full flex items-center justify-center my-4 overflow-hidden pointer-events-none" style={{ perspective: '1200px' }}>
      
      {/* HUD Scanner lines (fixed in background) */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--color-arc-cyan)]/30 shadow-[0_0_15px_var(--color-arc-cyan)] z-0"></div>

      {/* 3D Rotating Container */}
      <div 
        className="relative w-[280px] h-[300px] transition-transform duration-1000 flex items-center justify-center pointer-events-auto"
        style={{ 
          transformStyle: 'preserve-3d', 
          transform: `translateZ(-${radius}px) rotateY(${-activeIndex * theta}deg)`,
          transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)'
        }}
      >
        {TEMPLATES.map((tpl, idx) => {
          // Normalize activeIndex to handle negative wrap-arounds visually
          const normalizedActive = ((activeIndex % N) + N) % N;
          const isActive = idx === normalizedActive;
          
          // Calculate distance to dim cards in the back
          const rawDist = Math.abs(idx - normalizedActive);
          const distance = Math.min(rawDist, N - rawDist);
          
          // Only active card is fully opaque, others fade out slightly based on distance
          const opacity = distance === 0 ? 1 : distance === 1 ? 0.4 : 0.1;
          const isPointerEvents = distance <= 1; // Only let front cards be clickable

          const Icon = tpl.icon;

          return (
            <div
              key={tpl.type}
              onClick={() => {
                // Determine direction for smooth rotation
                if (distance === 1) {
                  const isNext = (idx === (normalizedActive + 1) % N);
                  if (isNext) handleNext(); else handlePrev();
                }
              }}
              className={`absolute inset-0 p-6 border border-[var(--color-arc-cyan)]/50 bg-black/60 backdrop-blur-md rounded-xl transition-all duration-500 flex flex-col items-center text-center shadow-[0_0_30px_rgba(0,212,255,0.1)] group hover:border-[var(--color-arc-cyan)] ${isPointerEvents ? 'cursor-pointer' : 'cursor-default pointer-events-none'}`}
              style={{ 
                transform: `rotateY(${idx * theta}deg) translateZ(${radius}px)`,
                opacity: opacity,
              }}
            >
              {/* Hologram flicker on active */}
              <div className={`absolute inset-0 pointer-events-none rounded-xl ${isActive ? 'animate-hud-flicker shadow-[inset_0_0_20px_rgba(0,212,255,0.2)]' : ''}`}></div>
              
              <div className="w-12 h-12 rounded-full border border-[var(--color-arc-cyan)] flex items-center justify-center mb-4 bg-[var(--color-arc-cyan)]/10 text-[var(--color-arc-cyan)]">
                <Icon className="w-6 h-6" />
              </div>
              
              <h3 className={`font-display font-bold text-xl text-white mb-2 tracking-wide transition-colors ${isActive ? 'text-[var(--color-arc-cyan)]' : 'group-hover:text-[var(--color-arc-cyan)]'}`}>
                {tpl.title}
              </h3>
              
              <p className="text-[var(--color-arc-cyan)]/70 text-xs font-display tracking-widest leading-relaxed">
                {tpl.description}
              </p>

              {/* Show the initialize button only if it's the active card */}
              <div className={`mt-auto w-full transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(tpl); }}
                  className="w-full py-2 bg-[var(--color-arc-cyan)]/10 border border-[var(--color-arc-cyan)] text-[var(--color-arc-cyan)] font-display text-sm tracking-widest hover:bg-[var(--color-arc-cyan)] hover:text-black transition-all shadow-[0_0_15px_rgba(0,212,255,0.3)]"
                >
                  INITIALIZE
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none z-50">
        <button onClick={handlePrev} className="p-4 text-[var(--color-arc-cyan)]/50 hover:text-[var(--color-arc-cyan)] hover:scale-125 transition-all pointer-events-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button onClick={handleNext} className="p-4 text-[var(--color-arc-cyan)]/50 hover:text-[var(--color-arc-cyan)] hover:scale-125 transition-all pointer-events-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}
