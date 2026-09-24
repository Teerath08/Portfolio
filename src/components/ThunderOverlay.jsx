import React, { useEffect, useRef, useState } from "react";
import { subscribeToThunder } from "../utils/thunder";

export default function ThunderOverlay() {
  const canvasRef = useRef(null);
  const [flash, setFlash] = useState(false);
  const boltsRef = useRef([]);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const unsubscribe = subscribeToThunder(({ startCoords, targetEl }) => {
      triggerLightningStrike(startCoords, targetEl);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      unsubscribe();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const createLightningPath = (x1, y1, x2, y2, displace, minDisplace = 5) => {
    const points = [{ x: x1, y: y1 }];
    const branchSegments = [];

    const generateSegments = (sx, sy, ex, ey, disp) => {
      if (disp < minDisplace) {
        points.push({ x: ex, y: ey });
        return;
      }
      const midX = (sx + ex) / 2 + (Math.random() - 0.5) * disp;
      const midY = (sy + ey) / 2 + (Math.random() - 0.5) * disp;

      generateSegments(sx, sy, midX, midY, disp / 2);

      // Random side branching bolt
      if (Math.random() < 0.28 && disp > 16) {
        const branchEndX = midX + (Math.random() - 0.5) * disp * 1.6;
        const branchEndY = midY + Math.random() * disp * 1.4;
        branchSegments.push({
          start: { x: midX, y: midY },
          end: { x: branchEndX, y: branchEndY },
        });
      }

      generateSegments(midX, midY, ex, ey, disp / 2);
    };

    generateSegments(x1, y1, x2, y2, displace);
    return { points, branchSegments };
  };

  const triggerLightningStrike = (startCoords, targetEl) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Screen flash
    setFlash(true);
    setTimeout(() => setFlash(false), 260);

    const width = canvas.width;
    const height = canvas.height;

    // Determine target location in viewport
    let endX = width / 2;
    let endY = height / 2;
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      endX = Math.min(Math.max(rect.left + rect.width / 2, 80), width - 80);
      endY = Math.min(Math.max(rect.top + 50, 100), height - 100);
    }

    const startX = startCoords?.x ?? width / 2;
    const startY = startCoords?.y ?? 0;

    // Create 3 primary lightning bolts
    const newBolts = [];
    for (let i = 0; i < 3; i++) {
      const offsetTargetX = endX + (Math.random() - 0.5) * 80;
      const offsetTargetY = endY + (Math.random() - 0.5) * 40;
      const { points, branchSegments } = createLightningPath(
        startX + (Math.random() - 0.5) * 40,
        startY,
        offsetTargetX,
        offsetTargetY,
        Math.max(width, height) * 0.28
      );
      newBolts.push({
        points,
        branchSegments,
        alpha: 1.0,
        flicker: 1,
      });
    }

    // Impact sparks
    const sparks = [];
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      sparks.push({
        x: endX,
        y: endY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        size: Math.random() * 3 + 1,
      });
    }

    boltsRef.current = { bolts: newBolts, sparks, shockwave: { x: endX, y: endY, radius: 10, maxRadius: 180, alpha: 0.9 } };

    const startTime = performance.now();
    const duration = 520; // ms

    const render = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = elapsed / duration;

      ctx.clearRect(0, 0, width, height);

      if (progress >= 1 || !boltsRef.current) {
        ctx.clearRect(0, 0, width, height);
        boltsRef.current = null;
        return;
      }

      const fade = Math.max(0, 1 - progress);
      const isFlickering = Math.random() > 0.15;

      // Draw shockwave ring
      const sw = boltsRef.current.shockwave;
      if (sw && progress < 0.8) {
        sw.radius += (sw.maxRadius - sw.radius) * 0.14;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${fade * 0.75})`;
        ctx.lineWidth = 3 * fade;
        ctx.shadowColor = "#ff003c";
        ctx.shadowBlur = 18;
        ctx.stroke();
      }

      // Draw lightning bolts if flickering
      if (isFlickering) {
        boltsRef.current.bolts.forEach((bolt) => {
          // Draw outer crimson glow
          ctx.beginPath();
          bolt.points.forEach((p, idx) => {
            if (idx === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.strokeStyle = `rgba(220, 38, 38, ${fade * 0.7})`;
          ctx.lineWidth = 14 * fade;
          ctx.lineCap = "round";
          ctx.shadowColor = "#ff003c";
          ctx.shadowBlur = 30;
          ctx.stroke();

          // Draw mid scarlet arc
          ctx.beginPath();
          bolt.points.forEach((p, idx) => {
            if (idx === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.strokeStyle = `rgba(255, 60, 80, ${fade * 0.9})`;
          ctx.lineWidth = 5 * fade;
          ctx.shadowBlur = 15;
          ctx.stroke();

          // Draw ultra-bright white core
          ctx.beginPath();
          bolt.points.forEach((p, idx) => {
            if (idx === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.strokeStyle = `rgba(255, 255, 255, ${fade * 0.95})`;
          ctx.lineWidth = 2 * fade;
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#ffffff";
          ctx.stroke();

          // Draw small branches
          bolt.branchSegments.forEach((branch) => {
            ctx.beginPath();
            ctx.moveTo(branch.start.x, branch.start.y);
            ctx.lineTo(branch.end.x, branch.end.y);
            ctx.strokeStyle = `rgba(255, 70, 70, ${fade * 0.7})`;
            ctx.lineWidth = 2.5 * fade;
            ctx.stroke();
          });
        });
      }

      // Draw sparks
      boltsRef.current.sparks.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.92;
        s.vy *= 0.92;
        s.life -= 0.035;

        if (s.life > 0) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, ${Math.floor(100 * s.life)}, ${Math.floor(100 * s.life)}, ${s.life * fade})`;
          ctx.shadowColor = "#ef4444";
          ctx.shadowBlur = 10;
          ctx.fill();
        }
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
  };

  return (
    <>
      {/* Red & White Electric Ambient Flash */}
      <div
        className={`fixed inset-0 pointer-events-none z-[99] transition-opacity duration-150 ${
          flash ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 30, 60, 0.35) 0%, rgba(255, 255, 255, 0.25) 25%, transparent 70%)",
        }}
      />

      {/* Lightning Bolt Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[100]"
        style={{ mixBlendMode: "screen" }}
      />
    </>
  );
}
