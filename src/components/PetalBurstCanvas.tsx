import React, { useCallback, useEffect, useRef } from 'react';

interface PetalBurstCanvasProps {
  burstKey: number;
  enableClickBloom?: boolean;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vr: number;
  swayPhase: number;
  swaySpeed: number;
  alpha: number;
  decay: number;
  kind: 'flower' | 'petal' | 'leaf' | 'dust';
  color: string;
  centerColor: string;
}

const PETAL_COLORS = ['#F59E0B', '#FB7185', '#FBBF24', '#FDA4AF', '#FFFBEB'];
const FLOWER_COLORS = ['#F59E0B', '#FB7185', '#FBBF24', '#F43F5E', '#D97706'];
const LEAF_COLORS = ['#10B981', '#34D399', '#059669'];
const GOLD_COLORS = ['#F59E0B', '#FDE68A', '#D4AF37', '#FB7185'];
const MAX_PARTICLES = 180;

export const PetalBurstCanvas: React.FC<PetalBurstCanvasProps> = ({
  burstKey,
  enableClickBloom = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<BurstParticle[]>([]);
  const rafIdRef = useRef<number | null>(null);

  const startLoop = useCallback(() => {
    if (rafIdRef.current !== null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (
      canvas.width !== Math.round(width * dpr) ||
      canvas.height !== Math.round(height * dpr)
    ) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const list = particlesRef.current;
      let writeIdx = 0;

      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        p.vx *= 0.968;
        p.vy = p.vy * 0.968 + 0.055;
        p.swayPhase += p.swaySpeed;
        p.x += p.vx + Math.sin(p.swayPhase) * 0.35;
        p.y += p.vy;
        p.rotation += p.vr;
        p.alpha -= p.decay;

        if (p.alpha <= 0.02) continue;
        list[writeIdx++] = p;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.kind === 'flower') {
          ctx.fillStyle = p.color;
          const petals = 5;
          for (let k = 0; k < petals; k++) {
            ctx.save();
            ctx.rotate((Math.PI * 2 * k) / petals);
            ctx.beginPath();
            ctx.ellipse(0, -p.size * 0.68, p.size * 0.34, p.size * 0.62, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          ctx.fillStyle = p.centerColor;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.28, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'petal') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 0.65, -p.size * 0.2, 0, p.size);
          ctx.quadraticCurveTo(-p.size * 0.65, -p.size * 0.2, 0, -p.size);
          ctx.fill();
        } else if (p.kind === 'leaf') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.42, p.size * 0.9, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#D4AF37';
          ctx.shadowBlur = p.size * 3;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      list.length = writeIdx;

      if (list.length > 0) {
        rafIdRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, w, h);
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(render);
  }, []);

  const spawnBloomAt = useCallback(
    (originX: number, originY: number, count: number, spreadSpeed = 5.6) => {
      if (typeof window === 'undefined') return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const list = particlesRef.current;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
        const speed = 1.6 + Math.random() * spreadSpeed;

        let kind: BurstParticle['kind'] = 'petal';
        if (i % 6 === 0) kind = 'flower';
        else if (i % 7 === 0) kind = 'leaf';
        else if (i % 3 === 0) kind = 'dust';

        const color =
          kind === 'flower'
            ? FLOWER_COLORS[i % FLOWER_COLORS.length]
            : kind === 'leaf'
              ? LEAF_COLORS[i % LEAF_COLORS.length]
              : kind === 'dust'
                ? GOLD_COLORS[i % GOLD_COLORS.length]
                : PETAL_COLORS[i % PETAL_COLORS.length];

        list.push({
          x: originX + (Math.random() - 0.5) * 10,
          y: originY + (Math.random() - 0.5) * 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size:
            kind === 'flower'
              ? 6 + Math.random() * 4.5
              : kind === 'dust'
                ? 1.5 + Math.random() * 2.2
                : 4.5 + Math.random() * 5,
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.14,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 0.06 + Math.random() * 0.06,
          alpha: 0.96,
          decay: kind === 'dust' ? 0.015 + Math.random() * 0.01 : 0.011 + Math.random() * 0.008,
          kind,
          color,
          centerColor: color === '#F59E0B' || color === '#FBBF24' ? '#FFFBEB' : '#FDE68A',
        });
      }

      if (list.length > MAX_PARTICLES) {
        list.splice(0, list.length - MAX_PARTICLES);
      }

      startLoop();
    },
    [startLoop]
  );

  // Trigger celebratory center burst on card flip
  useEffect(() => {
    if (burstKey === 0 || typeof window === 'undefined') return;
    spawnBloomAt(window.innerWidth / 2, window.innerHeight / 2, 34, 6.4);
  }, [burstKey, spawnBloomAt]);

  // Trigger blossom burst at exact pointer position on click/tap anywhere
  useEffect(() => {
    if (!enableClickBloom || typeof window === 'undefined') return;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      spawnBloomAt(e.clientX, e.clientY, 20, 4.8);
    };

    window.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
    };
  }, [enableClickBloom, spawnBloomAt]);

  // Keep canvas sized on viewport resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-[60]"
    />
  );
};
