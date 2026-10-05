'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  angularSpeed: number;
  type: 'mustard' | 'leaf' | 'chilli' | 'starAnise';
  opacity: number;
}

export default function AmbientSpices() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 500;
    };

    window.addEventListener('resize', handleResize);

    // Subtle, sparse ambient particles (only 14 particles for clean atmosphere)
    const types: Particle['type'][] = ['mustard', 'leaf', 'chilli', 'starAnise'];
    const particles: Particle[] = Array.from({ length: 14 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 6 + Math.random() * 12,
      speedY: 0.15 + Math.random() * 0.25, // Slow gentle drift
      speedX: (Math.random() - 0.5) * 0.15,
      angle: Math.random() * Math.PI * 2,
      angularSpeed: (Math.random() - 0.5) * 0.008,
      type: types[Math.floor(Math.random() * types.length)],
      opacity: 0.15 + Math.random() * 0.25, // Soft, non-distracting opacity
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.angularSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;

        if (p.type === 'chilli') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.8, p.size * 0.25, 0.3, 0, Math.PI * 2);
          ctx.fillStyle = '#BA1A1A';
          ctx.fill();
        } else if (p.type === 'leaf') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.7, p.size * 0.3, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#1B5E20';
          ctx.fill();
        } else if (p.type === 'mustard') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = '#3E2723';
          ctx.fill();
        } else {
          // Star anise dot
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = '#4E342E';
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-60"
      aria-hidden="true"
    />
  );
}
