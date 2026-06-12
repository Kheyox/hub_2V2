import { useEffect, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

const TARGET = 5;
const W = 360;
const H = 520;
const PADDLE_W = 88;
const PADDLE_H = 12;
const BALL_R = 9;
const PADDLE_MARGIN = 26;

export function Pong({ players, onWin, feedback }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [running, setRunning] = useState(false);
  const reported = useRef(false);
  const state = useRef({
    p0x: W / 2, // raquette du bas (Joueur 1)
    p1x: W / 2, // raquette du haut (Joueur 2)
    ballX: W / 2,
    ballY: H / 2,
    vx: 0,
    vy: 0,
    serveTo: 0 as PlayerIndex,
    waiting: true
  });
  const winner = score[0] >= TARGET ? 0 : score[1] >= TARGET ? 1 : null;
  const status = winner !== null
    ? `${players[winner].name} gagne ${score[winner]} - ${score[winner === 0 ? 1 : 0]}`
    : running
      ? `${score[0]} - ${score[1]}`
      : `Premier à ${TARGET} points`;

  useEffect(() => {
    if (winner === null || reported.current) return;
    reported.current = true;
    setRunning(false);
    onWin(winner, `${score[winner]} - ${score[winner === 0 ? 1 : 0]}`);
  }, [winner, onWin, score]);

  const serve = (toward: PlayerIndex) => {
    const s = state.current;
    s.ballX = W / 2;
    s.ballY = H / 2;
    const angle = (Math.random() * 0.6 - 0.3) * Math.PI;
    const speed = 4.2;
    s.vx = Math.sin(angle) * speed;
    s.vy = (toward === 0 ? 1 : -1) * Math.cos(angle) * speed;
    s.waiting = false;
  };

  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let serveTimer = 0;

    const step = () => {
      const s = state.current;
      if (!s.waiting) {
        s.ballX += s.vx;
        s.ballY += s.vy;
        // murs gauche/droite
        if (s.ballX < BALL_R) { s.ballX = BALL_R; s.vx = Math.abs(s.vx); }
        if (s.ballX > W - BALL_R) { s.ballX = W - BALL_R; s.vx = -Math.abs(s.vx); }
        // raquette du bas (J1)
        const bottomY = H - PADDLE_MARGIN;
        if (s.vy > 0 && s.ballY + BALL_R >= bottomY && s.ballY + BALL_R <= bottomY + PADDLE_H + 8 && Math.abs(s.ballX - s.p0x) <= PADDLE_W / 2 + BALL_R) {
          const offset = (s.ballX - s.p0x) / (PADDLE_W / 2);
          const speed = Math.min(Math.hypot(s.vx, s.vy) * 1.04, 11);
          const angle = offset * 0.9;
          s.vx = Math.sin(angle) * speed;
          s.vy = -Math.abs(Math.cos(angle) * speed);
          s.ballY = bottomY - BALL_R;
        }
        // raquette du haut (J2)
        const topY = PADDLE_MARGIN;
        if (s.vy < 0 && s.ballY - BALL_R <= topY + PADDLE_H && s.ballY - BALL_R >= topY - 8 && Math.abs(s.ballX - s.p1x) <= PADDLE_W / 2 + BALL_R) {
          const offset = (s.ballX - s.p1x) / (PADDLE_W / 2);
          const speed = Math.min(Math.hypot(s.vx, s.vy) * 1.04, 11);
          const angle = offset * 0.9;
          s.vx = Math.sin(angle) * speed;
          s.vy = Math.abs(Math.cos(angle) * speed);
          s.ballY = topY + PADDLE_H + BALL_R;
        }
        // points
        if (s.ballY > H + BALL_R * 2) {
          // passée derrière J1 : point pour J2
          s.waiting = true;
          s.serveTo = 1;
          setScore((current) => [current[0], current[1] + 1]);
          serveTimer = window.setTimeout(() => serve(1), 900);
        } else if (s.ballY < -BALL_R * 2) {
          s.waiting = true;
          s.serveTo = 0;
          setScore((current) => [current[0] + 1, current[1]]);
          serveTimer = window.setTimeout(() => serve(0), 900);
        }
      }

      // rendu
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0b1119";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(237,243,241,0.16)";
      ctx.setLineDash([8, 10]);
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // raquettes
      ctx.fillStyle = players[1].color;
      roundRect(ctx, s.p1x - PADDLE_W / 2, PADDLE_MARGIN, PADDLE_W, PADDLE_H, 6);
      ctx.fillStyle = players[0].color;
      roundRect(ctx, s.p0x - PADDLE_W / 2, H - PADDLE_MARGIN, PADDLE_W, PADDLE_H, 6);
      // balle
      ctx.fillStyle = "#f0f5f2";
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(serveTimer);
    };
  }, [running, players]);

  const movePaddle = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * W;
    const y = ((event.clientY - rect.top) / rect.height) * H;
    const clamped = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, x));
    if (y > H / 2) state.current.p0x = clamped;
    else state.current.p1x = clamped;
  };

  const start = () => {
    reported.current = false;
    setScore([0, 0]);
    state.current.p0x = W / 2;
    state.current.p1x = W / 2;
    state.current.waiting = true;
    setRunning(true);
    feedback("tap");
    window.setTimeout(() => serve(Math.random() > 0.5 ? 0 : 1), 800);
  };

  const reset = () => {
    reported.current = false;
    setRunning(false);
    setScore([0, 0]);
    state.current.waiting = true;
  };

  return (
    <>
      <GameHeader title="Pong" status={status} onReset={reset} />
      <div className="duel-score">
        <span style={{ color: players[1].color }}>{players[1].avatar} {players[1].name} · {score[1]} (haut)</span>
        <span style={{ color: players[0].color }}>{players[0].avatar} {players[0].name} · {score[0]} (bas)</span>
      </div>
      <div className="pong-wrap">
        <canvas
          ref={canvasRef}
          className="pong-canvas"
          width={W}
          height={H}
          onPointerDown={movePaddle}
          onPointerMove={movePaddle}
        />
        {(!running || winner !== null) && (
          <div className="pong-overlay">
            <button className="primary-action" onClick={start}>{winner !== null ? "Rejouer" : "Lancer la partie"}</button>
          </div>
        )}
      </div>
      <p className="hand-label">Glisse ton pouce sur ta moitié pour bouger ta raquette. La balle accélère à chaque échange !</p>
    </>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}
