import React, { useEffect, useState } from 'react';
import ArcReactor from './ArcReactor';

export default function IronManHero({ stats }: { stats: { total: number } }) {
  const [bootText, setBootText] = useState('');
  const [animState, setAnimState] = useState<'idle' | 'entering' | 'firing' | 'hit' | 'revealed'>('idle');
  
  const fullText = "SYSTEM: ONLINE\nAUTHENTICATING...\nUSER IDENTIFIED.";

  useEffect(() => {
    // Animation Sequence Timeline
    const t1 = setTimeout(() => setAnimState('entering'), 100);
    const t2 = setTimeout(() => setAnimState('firing'), 1100);
    const t3 = setTimeout(() => setAnimState('hit'), 1500);
    const t4 = setTimeout(() => setAnimState('revealed'), 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  useEffect(() => {
    if (animState === 'revealed') {
      let i = 0;
      const interval = setInterval(() => {
        setBootText(fullText.substring(0, i));
        i++;
        if (i > fullText.length) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [animState]);

  return (
    <div className={`relative w-full min-h-[400px] rounded-2xl overflow-hidden border border-[var(--color-arc-cyan)]/30 bg-black/80 mb-12 flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,212,255,0.1)] transition-transform duration-100 ${animState === 'hit' ? 'animate-screen-shake' : ''}`}>
      
      {/* Background Image - Iron Man Entrance */}
      <div 
        className={`absolute inset-0 bg-cover bg-center z-0 opacity-0 ${animState !== 'idle' ? 'animate-iron-entrance' : ''}`}
        style={{ backgroundImage: 'url(/hero_bg.png)' }}
      ></div>
      
      {/* Dark gradient fade for the right side HUD */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/40 to-black z-0 pointer-events-none"></div>

      {/* Repulsor Beam */}
      {animState === 'firing' && (
        <div className="absolute top-1/2 left-[25%] h-8 bg-white shadow-[0_0_50px_20px_rgba(0,212,255,1)] z-30 transform -translate-y-1/2 animate-repulsor-beam origin-left"></div>
      )}

      {/* Hit Flash */}
      {animState === 'hit' && (
        <div className="absolute inset-y-0 right-0 w-1/2 z-40 animate-flash-bang pointer-events-none"></div>
      )}

      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none scan-line z-20"></div>

      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.05)_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none z-10"></div>

      {/* Left: Arc Reactor */}
      <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[var(--color-arc-cyan)]/20 relative z-10">
        <div className="absolute top-4 left-4 text-[10px] text-[var(--color-arc-cyan)] font-display tracking-widest opacity-50">
          MK-85 POWER CORE
        </div>
        <ArcReactor />
      </div>

      {/* Right: JARVIS HUD */}
      <div className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-10 transition-opacity duration-300 ${animState === 'revealed' ? 'opacity-100 animate-hud-flicker' : 'opacity-0'}`}>
        <div className="absolute top-4 right-4 flex gap-1">
          <div className="w-2 h-2 bg-[var(--color-arc-cyan)] animate-pulse"></div>
          <div className="w-2 h-2 bg-[var(--color-arc-cyan)] opacity-50"></div>
          <div className="w-2 h-2 bg-[var(--color-arc-cyan)] opacity-20"></div>
        </div>

        <div className="font-display text-[var(--color-arc-cyan)] text-xs mb-4 min-h-[3rem] whitespace-pre-line tracking-widest leading-relaxed">
          {bootText}
          {animState === 'revealed' && <span className="animate-pulse">_</span>}
        </div>

        <div className="relative mb-8 group">
          <div className="absolute -inset-2 bg-[var(--color-arc-cyan)]/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <h1 className="text-5xl md:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[var(--color-arc-cyan)] to-[#0088AA] tracking-tighter filter drop-shadow-[0_0_15px_rgba(0,212,255,0.5)]">
            Hello, <br /> Kartik
          </h1>
        </div>

        <div className="space-y-4 font-display text-sm tracking-widest">
          <div className="flex items-center gap-4">
            <span className="text-[var(--color-arc-cyan)]/70 w-32">GOALS ACTIVE</span>
            <div className="flex-1 h-1 bg-[var(--color-arc-cyan)]/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--color-arc-cyan)] shadow-[0_0_10px_#00D4FF]"
                style={{ width: `${Math.min(100, (stats.total / 5) * 100)}%` }}
              ></div>
            </div>
            <span className="text-[var(--color-arc-cyan)] font-bold">{stats.total}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[var(--color-arc-cyan)]/70 w-32">SYSTEM STATUS</span>
            <div className="flex-1 flex gap-1">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`h-2 flex-1 rounded-sm ${i < 8 ? 'bg-[var(--color-arc-cyan)]' : 'bg-[var(--color-arc-cyan)]/20'}`}></div>
              ))}
            </div>
            <span className="text-[var(--color-arc-cyan)] font-bold">OPTIMAL</span>
          </div>
        </div>

        {/* HUD Brackets */}
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[var(--color-arc-cyan)] opacity-50"></div>
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[var(--color-arc-cyan)] opacity-50"></div>
      </div>
    </div>
  );
}
