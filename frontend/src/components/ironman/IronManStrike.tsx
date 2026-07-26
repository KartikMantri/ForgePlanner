import React, { useEffect, useState } from 'react';

interface Props {
  /** Bounding rect of the goal card being deleted, in viewport coordinates. */
  targetRect: DOMRect;
  /** Fired the instant the flying icon reaches the card — trigger the card's burst here. */
  onImpact: () => void;
  /** Fired once the whole sequence (fly-in + impact flash) is finished. */
  onDone: () => void;
}

const FLY_DURATION = 650;
const IMPACT_DURATION = 500;

/**
 * Small Iron Man icon that flies in from off-screen to the target card and
 * "shoots" a repulsor flash on impact. Purely cosmetic — actual deletion is
 * handled by the caller, timed off onImpact/onDone.
 */
export default function IronManStrike({ targetRect, onImpact, onDone }: Props) {
  const [impacted, setImpacted] = useState(false);

  const centerX = targetRect.left + targetRect.width / 2;
  const centerY = targetRect.top + targetRect.height / 2;

  useEffect(() => {
    const impactTimer = setTimeout(() => {
      setImpacted(true);
      onImpact();
    }, FLY_DURATION);
    const doneTimer = setTimeout(() => {
      onDone();
    }, FLY_DURATION + IMPACT_DURATION);
    return () => {
      clearTimeout(impactTimer);
      clearTimeout(doneTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      <div
        className="absolute animate-iron-fly-in"
        style={{ left: centerX - 26, top: centerY - 26, width: 52, height: 52 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,184,0,0.8)]">
          <path fill="#CC0000" stroke="#000" strokeWidth="3" d="M20 90 L80 90 L90 50 L80 10 L20 10 L10 50 Z" />
          <circle cx="35" cy="42" r="8" fill="var(--color-arc-cyan)" />
          <circle cx="65" cy="42" r="8" fill="var(--color-arc-cyan)" />
          <path fill="var(--color-arc-gold)" d="M42 62 L38 78 L62 78 L58 62 Z" />
        </svg>
      </div>

      {impacted && (
        <div
          className="absolute rounded-full animate-flash-bang"
          style={{ left: centerX - 70, top: centerY - 70, width: 140, height: 140 }}
        />
      )}
    </div>
  );
}
