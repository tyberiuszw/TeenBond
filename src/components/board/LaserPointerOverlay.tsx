'use client';

import React, { useEffect, useRef } from 'react';
import { CanvasTransform } from '@/types/board';
import { LaserPointerTrail } from '@/lib/board/laserTrailManager';
import { worldToScreen } from '@/lib/board/coordinateUtils';

interface LaserPointerOverlayProps {
  localLaserTrail: LaserPointerTrail;
  remoteTrails?: Array<{
    userId: string;
    color: string;
    trail: Array<{ x: number; y: number; timestamp: number }>;
  }>;
  camera: CanvasTransform;
  width: number;
  height: number;
}

export const LaserPointerOverlay: React.FC<LaserPointerOverlayProps> = ({
  localLaserTrail,
  remoteTrails = [],
  camera,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const now = Date.now();
      ctx.clearRect(0, 0, width, height);

      // 1. Render Local Laser Trail
      const localActive = localLaserTrail.getActivePoints(now);
      if (localActive.length >= 2) {
        drawLaser(ctx, localActive, '#10B981', camera);
      }

      // 2. Render Remote Peer Laser Trails
      remoteTrails.forEach((peer) => {
        const peerActive = peer.trail
          .filter((p) => now - p.timestamp <= 1500)
          .map((p) => ({
            x: p.x,
            y: p.y,
            opacity: Math.max(0, 1 - (now - p.timestamp) / 1500),
          }));

        if (peerActive.length >= 2) {
          drawLaser(ctx, peerActive, peer.color || '#EC4899', camera);
        }
      });

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [localLaserTrail, remoteTrails, camera, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-20"
    />
  );
};

function drawLaser(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number; opacity: number }>,
  color: string,
  camera: CanvasTransform
) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const avgOpacity = (p1.opacity + p2.opacity) / 2;
    if (avgOpacity <= 0.01) continue;

    const s1 = worldToScreen(p1.x, p1.y, camera);
    const s2 = worldToScreen(p2.x, p2.y, camera);

    // Outer neon glow
    ctx.strokeStyle = color;
    ctx.globalAlpha = avgOpacity * 0.75;
    ctx.lineWidth = Math.max(4, 7 * camera.zoom);
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.moveTo(s1.x, s1.y);
    ctx.lineTo(s2.x, s2.y);
    ctx.stroke();

    // Inner bright core
    ctx.strokeStyle = '#FFFFFF';
    ctx.globalAlpha = avgOpacity;
    ctx.lineWidth = Math.max(2, 2.5 * camera.zoom);
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(s1.x, s1.y);
    ctx.lineTo(s2.x, s2.y);
    ctx.stroke();
  }

  ctx.restore();
}
