'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  angle: number;
  angularSpeed: number;
  type: 'chilli' | 'leaf' | 'mustard' | 'starAnise' | 'clove';
  opacity: number;
  depth: number;
}

export default function InteractiveSpicesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 450;
    };

    window.addEventListener('resize', handleResize);

    // Mouse parallax tracking
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Create 35 authentic floating spice particles
    const particleTypes: Particle['type'][] = ['chilli', 'leaf', 'mustard', 'starAnise', 'clove'];
    const particles: Particle[] = Array.from({ length: 28 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 8 + Math.random() * 18,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: 0.2 + Math.random() * 0.5,
      angle: Math.random() * Math.PI * 2,
      angularSpeed: (Math.random() - 0.5) * 0.02,
      type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
      opacity: 0.25 + Math.random() * 0.55,
      depth: 0.3 + Math.random() * 0.7,
    }));

    const drawChilli = (ctx: CanvasRenderingContext2D, size: number) => {
      ctx.beginPath();
      // Curved spicy Guntur chilli shape
      ctx.moveTo(-size * 0.8, size * 0.3);
      ctx.quadraticCurveTo(0, -size * 0.6, size * 0.8, -size * 0.4);
      ctx.quadraticCurveTo(size * 0.2, size * 0.6, -size * 0.8, size * 0.3);
      ctx.fillStyle = '#C8281E'; // Chilli Red
      ctx.fill();

      // Green stem
      ctx.beginPath();
      ctx.moveTo(-size * 0.8, size * 0.3);
      ctx.lineTo(-size * 1.1, size * 0.45);
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = size * 0.15;
      ctx.stroke();
    };

    const drawLeaf = (ctx: CanvasRenderingContext2D, size: number) => {
      // Curry leaf
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.9, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1E6B38';
      ctx.fill();

      // Center vein
      ctx.beginPath();
      ctx.moveTo(-size * 0.8, 0);
      ctx.lineTo(size * 0.8, 0);
      ctx.strokeStyle = '#86EFAC';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const drawMustard = (ctx: CanvasRenderingContext2D, size: number) => {
      // Mustard / Rai grain
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = '#291610';
      ctx.fill();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };

    const drawStarAnise = (ctx: CanvasRenderingContext2D, size: number) => {
      // Biryani whole star anise
      const petals = 6;
      ctx.beginPath();
      for (let i = 0; i < petals; i++) {
        const rad = (i * 2 * Math.PI) / petals;
        const px = Math.cos(rad) * size * 0.6;
        const py = Math.sin(rad) * size * 0.6;
        ctx.arc(px, py, size * 0.2, 0, Math.PI * 2);
      }
      ctx.fillStyle = '#78350F';
      ctx.fill();
    };

    const drawClove = (ctx: CanvasRenderingContext2D, size: number) => {
      // Fragrant Lavangam / Clove
      ctx.beginPath();
      ctx.rect(-size * 0.15, -size * 0.4, size * 0.3, size * 0.8);
      ctx.fillStyle = '#451A03';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -size * 0.4, size * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = '#78350F';
      ctx.fill();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const parallaxOffsetX = (mouseX - width / 2) * 0.04;
      const parallaxOffsetY = (mouseY - height / 2) * 0.04;

      particles.forEach((p) => {
        // Update physics
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.angularSpeed;

        // Wrap around bounds
        if (p.y > height + 40) {
          p.y = -30;
          p.x = Math.random() * width;
        }
        if (p.x < -40) p.x = width + 30;
        if (p.x > width + 40) p.x = -30;

        const renderX = p.x + parallaxOffsetX * p.depth;
        const renderY = p.y + parallaxOffsetY * p.depth;

        ctx.save();
        ctx.translate(renderX, renderY);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;

        switch (p.type) {
          case 'chilli':
            drawChilli(ctx, p.size);
            break;
          case 'leaf':
            drawLeaf(ctx, p.size);
            break;
          case 'mustard':
            drawMustard(ctx, p.size);
            break;
          case 'starAnise':
            drawStarAnise(ctx, p.size);
            break;
          case 'clove':
            drawClove(ctx, p.size);
            break;
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-80"
      aria-hidden="true"
    />
  );
}
