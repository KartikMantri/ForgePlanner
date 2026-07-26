import React from 'react';
import { isLowPowerDevice } from './deviceCapability';

interface VideoBackgroundProps {
  src: string;
  poster?: string;
  className?: string;
  /** Rendered instead of the video on touch/low-power/reduced-motion devices. */
  fallback?: React.ReactNode;
  loop?: boolean;
  onEnded?: () => void;
}

/** Muted, autoplaying background video with the same device-capability gating
 *  used across the rest of the 3D/cinematic layer. */
export default function VideoBackground({
  src,
  poster,
  className,
  fallback = null,
  loop = true,
  onEnded,
}: VideoBackgroundProps) {
  if (isLowPowerDevice()) return <>{fallback}</>;

  return (
    <video
      className={className}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop={loop}
      playsInline
      preload="auto"
      onEnded={onEnded}
    />
  );
}
