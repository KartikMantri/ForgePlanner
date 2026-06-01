import React, { useEffect, useRef, useState } from 'react';

export default function ArcReactor({ isCharging = false, isSuccess = false }: { isCharging?: boolean, isSuccess?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [powerSurge, setPowerSurge] = useState(false);

  // Canvas Thruster Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; size: number; speedY: number; opacity: number }[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const createParticles = () => {
      // Create particles originating from the center bottom
      const centerX = canvas.width / 2;
      const bottomY = canvas.height - 20;
      
      for (let i = 0; i < (isCharging ? 15 : 5); i++) {
        particles.push({
          x: centerX + (Math.random() - 0.5) * 60,
          y: bottomY,
          size: Math.random() * 3 + 1,
          speedY: (Math.random() * -3 - 2) * (isCharging ? 2 : 1),
          opacity: 1
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Spawn new particles
      if (Math.random() > (isCharging ? 0.1 : 0.3) || powerSurge) {
        createParticles();
        if (powerSurge || isCharging) createParticles(); // double particles on surge or charge
      }

      const glowColor = isSuccess ? '#4ADE80' : '#00D4FF';

      particles.forEach((p, index) => {
        p.y += p.speedY;
        p.opacity -= isCharging ? 0.02 : 0.015;
        p.size *= 0.98;

        if (p.opacity <= 0) {
          particles.splice(index, 1);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = isSuccess ? `rgba(74, 222, 128, ${p.opacity})` : `rgba(0, 212, 255, ${p.opacity})`;
          ctx.fill();
          
          // Glow effect
          ctx.shadowBlur = 10;
          ctx.shadowColor = glowColor;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [powerSurge, isCharging, isSuccess]);

  const handleSurge = () => {
    setPowerSurge(true);
    setTimeout(() => setPowerSurge(false), 500);
  };

  const primaryColor = isSuccess ? '#4ADE80' : '#00D4FF';
  const spinSpeed = isCharging ? 'spin-fast' : 'spin-slow';
  const reverseSpinSpeed = isCharging ? 'spin-reverse-fast' : 'spin-reverse';

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center cursor-pointer group"
      onClick={handleSurge}
    >
      {/* Thruster Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      
      {/* SVG Arc Reactor */}
      <div className={`relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center ${isSuccess ? 'animate-pulse' : 'animate-arc-pulse'} transition-transform duration-300 ${powerSurge || isCharging ? 'scale-110' : 'scale-100 group-hover:scale-105'}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full absolute">
          <defs>
            <radialGradient id={`coreGlow-${isSuccess}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="40%" stopColor={primaryColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
            </radialGradient>
            <filter id={`neonGlow-${isSuccess}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Outer Ring */}
          <g className={`origin-center ${spinSpeed} transition-all duration-700`}>
            <circle cx="100" cy="100" r="90" fill="none" stroke={primaryColor} strokeWidth="2" strokeDasharray="10 20" filter={`url(#neonGlow-${isSuccess})`} className="transition-colors duration-500" />
            <circle cx="100" cy="100" r="85" fill="none" stroke={primaryColor} strokeWidth="1" opacity="0.5" className="transition-colors duration-500" />
            {/* Ticks */}
            {[...Array(12)].map((_, i) => (
              <line key={i} x1="100" y1="10" x2="100" y2="20" stroke={primaryColor} strokeWidth="3" transform={`rotate(${i * 30} 100 100)`} className="transition-colors duration-500" />
            ))}
          </g>

          {/* Middle Ring */}
          <g className={`origin-center ${reverseSpinSpeed} transition-all duration-700`}>
            <circle cx="100" cy="100" r="65" fill="none" stroke={primaryColor} strokeWidth="6" strokeDasharray="30 10" opacity="0.8" filter={`url(#neonGlow-${isSuccess})`} className="transition-colors duration-500" />
            {/* Inner Ticks */}
            {[...Array(8)].map((_, i) => (
              <circle key={i} cx="100" cy="40" r="3" fill="#FFFFFF" transform={`rotate(${i * 45} 100 100)`} />
            ))}
          </g>

          {/* Inner Core Ring */}
          <circle cx="100" cy="100" r="45" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
          
          {/* Glowing Core */}
          <circle cx="100" cy="100" r="35" fill={`url(#coreGlow-${isSuccess})`} className={`${powerSurge || isCharging ? 'opacity-100' : 'opacity-80'} transition-opacity duration-300`} />
        </svg>
      </div>
    </div>
  );
}
