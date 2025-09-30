import React, { useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
}

const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useAppContext();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[];
    let mouse = { x: -200, y: -200 };

    const particleColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
    const lineColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
    const PARTICLE_COUNT = 80;
    const CONNECT_DISTANCE = 120;

    const setup = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 1,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wall collision
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();

        // Draw lines to other particles
        particles.forEach(p2 => {
          const distance = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          if (distance < CONNECT_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1 - distance / CONNECT_DISTANCE;
            ctx.stroke();
          }
        });

        // Draw line to mouse
        const mouseDistance = Math.sqrt((p.x - mouse.x) ** 2 + (p.y - mouse.y) ** 2);
        if (mouseDistance < CONNECT_DISTANCE) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 1.5 - mouseDistance / CONNECT_DISTANCE;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };
    
    // Initial setup
    setup();
    // Start animation
    draw();

    window.addEventListener('resize', setup);
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setup);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme]); // Rerun effect if theme changes

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

export default InteractiveBackground;
