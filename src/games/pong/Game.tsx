import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../../playerTypes';

const TARGET_SCORE = 5;

export function PongGame({ players, onWin, feedback }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const wonRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 360;
    const H = 520;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const paddleW = 84;
    const paddleH = 12;
    let p1X = W / 2 - paddleW / 2;
    let p2X = W / 2 - paddleW / 2;
    let ballX = W / 2;
    let ballY = H / 2;
    let vx = (Math.random() > 0.5 ? 1 : -1) * 3.1;
    let vy = (Math.random() > 0.5 ? 1 : -1) * 4.2;
    const localScores: [number, number] = [0, 0];

    // Suivi multi-touch par pointerId : haut = J2 (index 1), bas = J1 (index 0)
    const activePointers = new Map<number, 0 | 1>();

    const updatePaddleFromEvent = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * W;
      const y = ((e.clientY - rect.top) / rect.height) * H;
      let owner = activePointers.get(e.pointerId);
      if (owner === undefined) {
        owner = y < H / 2 ? 1 : 0;
        activePointers.set(e.pointerId, owner);
      }
      const clampedX = Math.max(0, Math.min(W - paddleW, x - paddleW / 2));
      if (owner === 0) p1X = clampedX;
      else p2X = clampedX;
    };

    const onPointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      updatePaddleFromEvent(e);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!activePointers.has(e.pointerId)) return;
      updatePaddleFromEvent(e);
    };
    const onPointerUp = (e: PointerEvent) => {
      activePointers.delete(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    const resetBall = (dirY: number) => {
      ballX = W / 2;
      ballY = H / 2;
      vx = (Math.random() > 0.5 ? 1 : -1) * 3.1;
      vy = dirY * 4.2;
    };

    let raf = 0;
    const loop = () => {
      if (wonRef.current) return;

      ballX += vx;
      ballY += vy;

      if (ballX <= 8 || ballX >= W - 8) {
        vx = -vx;
        ballX = Math.max(8, Math.min(W - 8, ballX));
        feedback('tap');
      }

      // Raquette J2 (haut)
      if (vy < 0 && ballY <= 28 + paddleH && ballY >= 20 && ballX >= p2X - 6 && ballX <= p2X + paddleW + 6) {
        const hit = (ballX - (p2X + paddleW / 2)) / (paddleW / 2);
        vx = hit * 4.8;
        vy = Math.min(8.5, Math.abs(vy) * 1.05);
        feedback('drop');
      }

      // Raquette J1 (bas)
      if (vy > 0 && ballY >= H - 28 - paddleH && ballY <= H - 20 && ballX >= p1X - 6 && ballX <= p1X + paddleW + 6) {
        const hit = (ballX - (p1X + paddleW / 2)) / (paddleW / 2);
        vx = hit * 4.8;
        vy = -Math.min(8.5, Math.abs(vy) * 1.05);
        feedback('drop');
      }

      if (ballY < 0) {
        localScores[0] += 1;
        setScores([...localScores] as [number, number]);
        if (localScores[0] >= TARGET_SCORE) {
          wonRef.current = true;
          onWin(0, `${localScores[0]} - ${localScores[1]}`);
          return;
        }
        resetBall(1);
      } else if (ballY > H) {
        localScores[1] += 1;
        setScores([...localScores] as [number, number]);
        if (localScores[1] >= TARGET_SCORE) {
          wonRef.current = true;
          onWin(1, `${localScores[1]} - ${localScores[0]}`);
          return;
        }
        resetBall(-1);
      }

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#090d1a';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = players[1].color;
      ctx.beginPath();
      ctx.roundRect(p2X, 20, paddleW, paddleH, 6);
      ctx.fill();

      ctx.fillStyle = players[0].color;
      ctx.beginPath();
      ctx.roundRect(p1X, H - 32, paddleW, paddleH, 6);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }, [players, onWin, feedback]);

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-sm">
      <div className="flex items-center justify-between w-full px-2 text-xs font-semibold">
        <span style={{ color: players[1].color }}>
          {players[1].avatar} {players[1].name} : {scores[1]}
        </span>
        <span className="text-muted">Premier à {TARGET_SCORE}</span>
        <span style={{ color: players[0].color }}>
          {scores[0]} : {players[0].name} {players[0].avatar}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full max-w-[360px] aspect-[360/520] rounded-card border border-border touch-none"
      />
    </div>
  );
}
