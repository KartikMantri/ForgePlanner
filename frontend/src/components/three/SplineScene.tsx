import React, { Suspense, lazy, useCallback, useState } from 'react';
import type { Application as SplineApplication } from '@splinetool/runtime';
import { isLowPowerDevice } from './deviceCapability';

const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineSceneProps {
  /** Public .splinecode scene URL exported from spline.design. Leave empty to always use fallback. */
  sceneUrl?: string;
  /** Rendered while the scene loads, on error, on low-power devices, or when sceneUrl is empty. */
  fallback: React.ReactNode;
  /** Fired once the Spline runtime has loaded — use to grab object refs / wire interactivity. */
  onSceneLoad?: (app: SplineApplication) => void;
  className?: string;
}

/**
 * Progressive-enhancement wrapper: real WebGL Spline scene when available and the
 * device can handle it, otherwise falls back to the existing CSS/SVG component —
 * mirrors the touch-device gating already used for the 3D card tilt effect.
 */
export default function SplineScene({ sceneUrl, fallback, onSceneLoad, className }: SplineSceneProps) {
  const [failed, setFailed] = useState(false);
  const skip = !sceneUrl || failed || isLowPowerDevice();

  const handleLoad = useCallback(
    (app: SplineApplication) => {
      onSceneLoad?.(app);
    },
    [onSceneLoad]
  );

  if (skip) return <>{fallback}</>;

  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        <Spline scene={sceneUrl} onLoad={handleLoad} onError={() => setFailed(true)} />
      </Suspense>
    </div>
  );
}
