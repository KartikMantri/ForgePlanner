import React, { useEffect, useState } from 'react';

export default function SpiderWebBg() {
  const [sway, setSway] = useState(0);

  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame += 0.02;
      setSway(Math.sin(frame) * 2);
      requestAnimationFrame(animate);
    };
    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-64 h-64 pointer-events-none z-0 opacity-40 mix-blend-screen" style={{ transform: `rotate(${sway}deg)`, transformOrigin: 'top left' }}>
      <svg viewBox="0 0 200 200" className="w-full h-full text-white/20">
        {/* Web Radials */}
        <line x1="0" y1="0" x2="200" y2="20" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="0" x2="180" y2="80" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="0" x2="120" y2="140" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="0" x2="60" y2="180" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="0" x2="10" y2="200" stroke="currentColor" strokeWidth="1" />
        
        {/* Web Spirals (approximated with paths) */}
        <path d="M 40,4 Q 45,20 30,35 Q 15,45 2,40" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M 80,8 Q 85,40 60,70 Q 30,90 4,80" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M 120,12 Q 130,60 90,105 Q 45,135 6,120" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M 160,16 Q 170,80 120,140 Q 60,180 8,160" fill="none" stroke="currentColor" strokeWidth="1" />
        
        {/* Hanging Spider */}
        <g transform={`translate(120, ${140 + sway * 2})`}>
          <line x1="0" y1="-140" x2="0" y2="0" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="0" cy="0" r="3" fill="#CC0000" />
          <circle cx="0" cy="4" r="5" fill="#CC0000" />
          {/* Spider Legs */}
          <path d="M -2,0 Q -8,-5 -10,2 M -3,2 Q -10,0 -12,6 M -3,4 Q -10,8 -8,12 M 2,0 Q 8,-5 10,2 M 3,2 Q 10,0 12,6 M 3,4 Q 10,8 8,12" fill="none" stroke="#CC0000" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}
