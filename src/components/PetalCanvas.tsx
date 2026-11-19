import React, { useEffect, useRef } from 'react';

interface GoldDustMote {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  twinklePhase: number;
  twinkleSpeed: number;
  baseOpacity: number;
  color: string;
}

interface PetalCanvasProps {
  active: boolean;
}

const GOLD_PALETTE = ['#D4AF37', '#C59B57', '#E5C97B', '#AA7C32'];

export const PetalCanvas: React.FC<PetalCanvasProps> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const count = Math.min(48, Math.max(24, Math.floor(width / 34)));
    const motes: GoldDustMote[] = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1.1 + Math.random() * 2.2,
      speedY: 0.22 + Math.random() * 0.42,
      speedX: (Math.random() - 0.5) * 0.26,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.018 + Math.random() * 0.025,
      baseOpacity: 0.35 + Math.random() * 0.5,
      color: GOLD_PALETTE[i % GOLD_PALETTE.length],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const m of motes) {
        m.y += m.speedY;
        m.x += m.speedX + Math.sin(m.y * 0.01) * 0.18;
        m.twinklePhase += m.twinkleSpeed;

        if (m.y > height + 16) {
          m.y = -12;
          m.x = Math.random() * width;
        }
        if (m.x > width + 16) m.x = -12;
        if (m.x < -16) m.x = width + 12;

        const twinkle = 0.55 + 0.45 * Math.sin(m.twinklePhase);
        ctx.save();
        ctx.globalAlpha = m.baseOpacity * twinkle;
        ctx.fillStyle = m.color;
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = m.radius * 3;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-20"
    />
  );
};
