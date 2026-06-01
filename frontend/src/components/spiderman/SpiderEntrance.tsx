import React, { useEffect, useState } from 'react';

export default function SpiderEntrance({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<'falling' | 'quote' | 'done'>('falling');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('quote'), 600);
    const t2 = setTimeout(() => {
      setStage('done');
      setTimeout(onComplete, 500); // give time for fade out
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);


  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${stage === 'done' ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Halftone BG Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(204,0,0,0.15)_2px,transparent_2px)] [background-size:16px_16px] pointer-events-none"></div>

      <div className="relative z-10 text-center">
        {/* Simple CSS-animated spider dropping */}
        <div className={`w-1 h-32 bg-white/30 mx-auto transform origin-top transition-transform duration-500 ${stage === 'falling' ? 'scale-y-0' : 'scale-y-100'}`}></div>
        <div className={`w-24 h-24 bg-[var(--color-spider-red)] rounded-full mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(204,0,0,0.6)] transform transition-transform duration-500 ${stage === 'falling' ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
          {/* Spider Logo SVG */}
          <svg viewBox="0 0 100 100" className="w-16 h-16 text-black">
            <path d="M50 20 C60 20, 65 30, 60 40 C65 40, 70 50, 60 60 C50 70, 40 70, 40 60 C30 50, 35 40, 40 40 C35 30, 40 20, 50 20 Z" fill="currentColor" />
            {/* Legs */}
            <path d="M40 30 Q20 10 10 30 M60 30 Q80 10 90 30 M38 40 Q15 35 5 50 M62 40 Q85 35 95 50 M38 50 Q15 65 10 80 M62 50 Q85 65 90 80 M42 60 Q25 85 30 95 M58 60 Q75 85 70 95" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>

        {/* Quote */}
        <h2 className={`mt-8 font-military text-3xl md:text-5xl font-black text-white uppercase tracking-widest text-shadow-comic transition-all duration-300 ${stage === 'quote' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="text-[var(--color-spider-red)]">"With great power</span><br />
          comes great responsibility"
        </h2>
      </div>
    </div>
  );
}
