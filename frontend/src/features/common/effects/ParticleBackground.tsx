import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  mass: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = 60;
    const colors = [
      "rgba(14, 165, 233",
      "rgba(59, 130, 246",
      "rgba(99, 102, 241",
      "rgba(139, 92, 246",
    ];

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 26 + 22; // slightly larger on average
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.7, // a bit faster
        vy: (Math.random() - 0.5) * 0.7, // a bit faster
        radius,
        opacity: Math.random() * 0.2 + 0.25, // more visible overall
        color: colors[Math.floor(Math.random() * colors.length)],
        mass: radius,
      });
    }

    function checkCollision(p1: Particle, p2: Particle) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < p1.radius + p2.radius;
    }

    function resolveCollision(p1: Particle, p2: Particle) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const nx = dx / distance;
      const ny = dy / distance;

      const dvx = p2.vx - p1.vx;
      const dvy = p2.vy - p1.vy;

      const dvn = dvx * nx + dvy * ny;
      if (dvn > 0) return;

      const impulse = (2 * dvn) / (p1.mass + p2.mass);

      p1.vx += impulse * p2.mass * nx;
      p1.vy += impulse * p2.mass * ny;
      p2.vx -= impulse * p1.mass * nx;
      p2.vy -= impulse * p1.mass * ny;

      const overlap = p1.radius + p2.radius - distance;
      const separationX = (overlap / 2) * nx;
      const separationY = (overlap / 2) * ny;
      p1.x -= separationX;
      p1.y -= separationY;
      p2.x += separationX;
      p2.y += separationY;
    }

    function animate() {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (
          particle.x - particle.radius < 0 ||
          particle.x + particle.radius > canvas.width
        ) {
          particle.vx *= -0.8;
          particle.x = Math.max(
            particle.radius,
            Math.min(canvas.width - particle.radius, particle.x)
          );
        }
        if (
          particle.y - particle.radius < 0 ||
          particle.y + particle.radius > canvas.height
        ) {
          particle.vy *= -0.8;
          particle.y = Math.max(
            particle.radius,
            Math.min(canvas.height - particle.radius, particle.y)
          );
        }

        const maxSpeed = 1.3; // allow slightly higher speed
        const speed = Math.sqrt(
          particle.vx * particle.vx + particle.vy * particle.vy
        );
        if (speed > maxSpeed) {
          particle.vx = (particle.vx / speed) * maxSpeed;
          particle.vy = (particle.vy / speed) * maxSpeed;
        }

        for (let j = i + 1; j < particles.length; j++) {
          if (checkCollision(particle, particles[j])) {
            resolveCollision(particle, particles[j]);
          }
        }

        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 1.5
        );
        gradient.addColorStop(
          0,
          `${particle.color}, ${Math.min(1, particle.opacity * 1.0)})`
        );
        gradient.addColorStop(
          0.5,
          `${particle.color}, ${particle.opacity * 0.5})`
        );
        gradient.addColorStop(1, `${particle.color}, 0)`);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.shadowBlur = 40; // stronger glow
        ctx.shadowColor = `${particle.color}, ${particle.opacity * 0.5})`;
        ctx.fill();
        ctx.shadowBlur = 0;

        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 300) {
            // connect from a bit farther
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            const lineOpacity = 0.25 * (1 - distance / 300); // stronger lines
            ctx.strokeStyle = `rgba(59, 130, 246, ${lineOpacity})`;
            ctx.lineWidth = 1.6;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.75 }}
    />
  );
}
