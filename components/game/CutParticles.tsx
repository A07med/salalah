"use client";

import { useEffect, useMemo, useState } from "react";
import type { Point } from "@/lib/game/types";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  kind: "fiber" | "water" | "husk";
}

interface CutParticlesProps {
  triggerKey: number;
  origin: Point | null;
  quality?: "clean" | "edge" | "weak" | null;
}

export function CutParticles({
  triggerKey,
  origin,
  quality,
}: CutParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const burstCount = useMemo(() => {
    if (quality === "clean") return 14;
    if (quality === "edge") return 9;
    return 5;
  }, [quality]);

  useEffect(() => {
    if (!origin || triggerKey <= 0 || !quality) return;

    const next: Particle[] = Array.from({ length: burstCount }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / burstCount + Math.random() * 0.4;
      const speed = 1.5 + Math.random() * 3.5;
      const kind: Particle["kind"] =
        i % 3 === 0 ? "water" : i % 3 === 1 ? "husk" : "fiber";

      return {
        id: triggerKey * 100 + i,
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size:
          kind === "water"
            ? 4 + Math.random() * 4
            : kind === "husk"
              ? 3 + Math.random() * 4
              : 2 + Math.random() * 3,
        color:
          kind === "water"
            ? "rgba(185,211,207,0.85)"
            : kind === "husk"
              ? "#6B8F3C"
              : "#4A6B32",
        life: 1,
        kind,
      };
    });

    let frame = 0;
    let raf = 0;
    const animate = () => {
      frame += 1;
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.12,
            life: p.life - 0.035,
          }))
          .filter((p) => p.life > 0),
      );
      if (frame < 36) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(() => {
      setParticles(next);
      animate();
    });
    return () => cancelAnimationFrame(raf);
  }, [triggerKey, origin, quality, burstCount]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[25] overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute block rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.kind === "fiber" ? p.size * 0.45 : p.size,
            background: p.color,
            opacity: p.life,
            transform: `translate(-50%, -50%) rotate(${p.vx * 20}deg)`,
            borderRadius: p.kind === "fiber" || p.kind === "husk" ? "2px" : "999px",
            filter: p.kind === "water" ? "blur(0.5px)" : undefined,
          }}
        />
      ))}
    </div>
  );
}
