import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../context';

export const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, audioDataRef, bassLevelRef } = useAppContext();
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const themeRef = useRef(theme);

  useEffect(() => { themeRef.current = theme; }, [theme]);

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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((window.innerWidth * window.innerHeight) / 15000);
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1,
          baseRadius: Math.random() * 3 + 1,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.01,
        });
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isAmoled = themeRef.current === 'amoled';
      const isOverdrive = document.querySelector('.invert') !== null;

      const lineColor = isOverdrive ? 'rgba(255, 0, 85, 0.3)' : (isAmoled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(74, 99, 53, 0.15)');
      const particleColor = isOverdrive ? 'rgba(255, 0, 85, 0.8)' : (isAmoled ? 'rgba(255, 255, 255, 0.5)' : 'rgba(74, 99, 53, 0.6)');

      const audioData = audioDataRef.current;
      const bassLevel = bassLevelRef.current;
      const pulse = isOverdrive ? 2 : 1.1;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.speed * (isOverdrive ? 5 : 1);
        p.x += Math.cos(p.angle) * 0.5 + p.vx * pulse * (isOverdrive ? 3 : 1);
        p.y += Math.sin(p.angle) * 0.5 + p.vy * pulse * (isOverdrive ? 3 : 1);

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

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          if (dist2 < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1 - dist2 / 120;
            ctx.stroke();
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
