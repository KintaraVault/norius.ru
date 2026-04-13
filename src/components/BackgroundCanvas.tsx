import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../context';

export const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, audioDataRef, bassLevelRef, isOverdrive } = useAppContext();
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const themeRef = useRef(theme);
  const isOverdriveRef = useRef(isOverdrive);

  useEffect(() => { themeRef.current = theme; }, [theme]);
  useEffect(() => { isOverdriveRef.current = isOverdrive; }, [isOverdrive]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: { x: number; y: number; vx: number; vy: number; baseRadius: number; angle: number; speed: number }[] = [];

    const CELL_SIZE = 130;
    let grid: Map<string, number[]> = new Map();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.min(
        Math.floor((window.innerWidth * window.innerHeight) / 22000),
        180
      );
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1,
          baseRadius: Math.random() * 2.5 + 0.8,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.01,
        });
      }
    };

    const buildGrid = () => {
      grid = new Map();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cx = Math.floor(p.x / CELL_SIZE);
        const cy = Math.floor(p.y / CELL_SIZE);
        const key = `${cx},${cy}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key)!.push(i);
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isAmoled = themeRef.current === 'amoled';
      const overdrive = isOverdriveRef.current;

      const lineColor = overdrive
        ? 'rgba(255, 0, 85, 0.3)'
        : isAmoled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(74, 99, 53, 0.15)';
      const particleColor = overdrive
        ? 'rgba(255, 0, 85, 0.8)'
        : isAmoled ? 'rgba(255, 255, 255, 0.5)' : 'rgba(74, 99, 53, 0.6)';

      const audioData = audioDataRef.current;
      const bassLevel = bassLevelRef.current;
      const pulse = overdrive ? 2 : 1.1;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.speed * (overdrive ? 5 : 1);
        p.x += Math.cos(p.angle) * 0.5 + p.vx * pulse * (overdrive ? 3 : 1);
        p.y += Math.sin(p.angle) * 0.5 + p.vy * pulse * (overdrive ? 3 : 1);

        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.x -= (dx / dist) * 2;
          p.y -= (dy / dist) * 2;
        }

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const freqValue = audioData[i % audioData.length] || 0;
        const dynamicRadius = p.baseRadius + (freqValue / 255) * 2 + bassLevel * 0.3;

        ctx.beginPath();
        ctx.arc(p.x, p.y, dynamicRadius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
      }

      buildGrid();

      const CONNECT_DIST_SQ = CELL_SIZE * CELL_SIZE;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cx = Math.floor(p.x / CELL_SIZE);
        const cy = Math.floor(p.y / CELL_SIZE);

        for (let nx = cx - 1; nx <= cx + 1; nx++) {
          for (let ny = cy - 1; ny <= cy + 1; ny++) {
            const neighbors = grid.get(`${nx},${ny}`);
            if (!neighbors) continue;
            for (const j of neighbors) {
              if (j <= i) continue;
              const p2 = particles[j];
              const dx2 = p.x - p2.x;
              const dy2 = p.y - p2.y;
              const dist2sq = dx2 * dx2 + dy2 * dy2;

              if (dist2sq < CONNECT_DIST_SQ) {
                const dist2 = Math.sqrt(dist2sq);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 1 - dist2 / CELL_SIZE;
                ctx.stroke();
              }
            }
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
};
