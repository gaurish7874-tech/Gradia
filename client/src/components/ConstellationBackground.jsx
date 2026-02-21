import React, { useEffect, useRef } from 'react';

const MIN_PARTICLES = 80;
const MAX_PARTICLES = 160;
const LINK_DISTANCE = 130;
const POINTER_INFLUENCE = 180;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticles(width, height, count) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: randomBetween(-0.22, 0.22),
    vy: randomBetween(-0.22, 0.22),
    radius: randomBetween(0.9, 2.3),
    hueShift: randomBetween(-24, 24),
  }));
}

export default function ConstellationBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    let rafId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];

    const pointer = {
      x: width * 0.5,
      y: height * 0.45,
      targetX: width * 0.5,
      targetY: height * 0.45,
      active: false,
    };

    const desiredCount = () =>
      Math.max(MIN_PARTICLES, Math.min(MAX_PARTICLES, Math.floor((width * height) / 13000)));

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = createParticles(width, height, desiredCount());
    };

    const onPointerMove = (event) => {
      pointer.targetX = event.clientX;
      pointer.targetY = event.clientY;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const draw = (timeMs) => {
      const t = timeMs * 0.001;

      if (!pointer.active) {
        pointer.targetX = width * 0.5 + Math.cos(t * 0.42) * width * 0.24;
        pointer.targetY = height * 0.46 + Math.sin(t * 0.58) * height * 0.18;
      }

      pointer.x += (pointer.targetX - pointer.x) * 0.075;
      pointer.y += (pointer.targetY - pointer.y) * 0.075;

      ctx.clearRect(0, 0, width, height);

      const aura = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 230);
      aura.addColorStop(0, 'rgba(125, 211, 252, 0.26)');
      aura.addColorStop(0.45, 'rgba(129, 140, 248, 0.12)');
      aura.addColorStop(1, 'rgba(125, 211, 252, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 230, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < POINTER_INFLUENCE * POINTER_INFLUENCE) {
          const dist = Math.sqrt(Math.max(distSq, 1));
          const force = (1 - dist / POINTER_INFLUENCE) * 0.07;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx += Math.sin(t * 0.36 + p.hueShift) * 0.0009;
        p.vy += Math.cos(t * 0.31 + p.hueShift) * 0.0009;
        p.vx *= 0.992;
        p.vy *= 0.992;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -40) p.x = width + 40;
        if (p.x > width + 40) p.x = -40;
        if (p.y < -40) p.y = height + 40;
        if (p.y > height + 40) p.y = -40;
      }

      const linkDistSq = LINK_DISTANCE * LINK_DISTANCE;
      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;

          if (distSq > linkDistSq) continue;

          const ratio = 1 - distSq / linkDistSq;
          const alpha = ratio * ratio * 0.4;
          const hue = 210 + Math.sin(t * 0.35 + (a.hueShift + b.hueShift) * 0.04) * 24;

          ctx.strokeStyle = `hsla(${hue}, 92%, 74%, ${alpha})`;
          ctx.lineWidth = 0.5 + ratio * 1.3;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const highlight = dist < POINTER_INFLUENCE ? (1 - dist / POINTER_INFLUENCE) * 1.4 : 0;
        const radius = p.radius + highlight;
        const hue = 196 + p.hueShift + Math.sin(t * 0.8 + i * 0.08) * 8;
        const alpha = 0.35 + Math.min(0.45, highlight * 0.5);

        ctx.fillStyle = `hsla(${hue}, 95%, 74%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(draw);
    };

    resize();
    rafId = window.requestAnimationFrame(draw);

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="constellation-canvas" aria-hidden="true" />;
}
