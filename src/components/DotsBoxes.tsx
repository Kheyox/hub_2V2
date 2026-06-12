import { Fragment, useEffect, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

const N = 4; // 4x4 cases = grille de 5x5 points

type Edges = boolean[];

const emptyEdges = (count: number): Edges => Array(count).fill(false);
// hEdges[r * N + c] : segment horizontal au-dessus/dessous des cases, r de 0 à N, c de 0 à N-1
// vEdges[r * (N + 1) + c] : segment vertical, r de 0 à N-1, c de 0 à N

const boxComplete = (h: Edges, v: Edges, row: number, col: number) =>
  h[row * N + col] && h[(row + 1) * N + col] && v[row * (N + 1) + col] && v[row * (N + 1) + col + 1];

export function DotsBoxes({ players, onWin, feedback }: GameProps) {
  const [hEdges, setHEdges] = useState<Edges>(() => emptyEdges((N + 1) * N));
  const [vEdges, setVEdges] = useState<Edges>(() => emptyEdges(N * (N + 1)));
  const [boxes, setBoxes] = useState<Array<PlayerIndex | null>>(() => Array(N * N).fill(null));
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const reported = useRef(false);
  const score: [number, number] = [boxes.filter((box) => box === 0).length, boxes.filter((box) => box === 1).length];
  const finished = boxes.every((box) => box !== null);
  const winner = score[0] === score[1] ? null : (score[0] > score[1] ? 0 : 1) as PlayerIndex;
  const status = finished
    ? (winner === null ? `Égalité ${score[0]} - ${score[1]}` : `${players[winner].name} gagne ${score[winner]} - ${score[winner === 0 ? 1 : 0]}`)
    : `${players[turn].name} trace un trait`;

  useEffect(() => {
    if (!finished || winner === null || reported.current) return;
    reported.current = true;
    onWin(winner, `${score[winner]} carrés`);
  }, [finished, winner, onWin, score]);

  const play = (kind: "h" | "v", index: number) => {
    if (finished) return;
    if (kind === "h" ? hEdges[index] : vEdges[index]) return;
    const nextH = kind === "h" ? hEdges.map((edge, i) => i === index || edge) : hEdges;
    const nextV = kind === "v" ? vEdges.map((edge, i) => i === index || edge) : vEdges;
    const nextBoxes = [...boxes];
    let scored = false;
    for (let row = 0; row < N; row += 1) {
      for (let col = 0; col < N; col += 1) {
        if (nextBoxes[row * N + col] === null && boxComplete(nextH, nextV, row, col)) {
          nextBoxes[row * N + col] = turn;
          scored = true;
        }
      }
    }
    setHEdges(nextH);
    setVEdges(nextV);
    setBoxes(nextBoxes);
    feedback(scored ? "win" : "tap");
    if (!scored) setTurn(turn === 0 ? 1 : 0);
  };

  const reset = () => {
    reported.current = false;
    setHEdges(emptyEdges((N + 1) * N));
    setVEdges(emptyEdges(N * (N + 1)));
    setBoxes(Array(N * N).fill(null));
    setTurn(0);
  };

  return (
    <>
      <GameHeader title="Points & Carrés" status={status} onReset={reset} />
      <div className="duel-score">
        <span className={turn === 0 && !finished ? "active" : ""} style={{ "--player-color": players[0].color } as React.CSSProperties}>{players[0].avatar} {players[0].name} · {score[0]}</span>
        <span className={turn === 1 && !finished ? "active" : ""} style={{ "--player-color": players[1].color } as React.CSSProperties}>{players[1].avatar} {players[1].name} · {score[1]}</span>
      </div>
      <div className={`dots-board ${turn === 0 ? "p0" : "p1"}`} style={{ "--c0": players[0].color, "--c1": players[1].color } as React.CSSProperties}>
        {Array.from({ length: N + 1 }).map((_, row) => (
          <Fragment key={`block-${row}`}>
            {Array.from({ length: N }).map((_, col) => (
              <Fragment key={`dotrow-${row}-${col}`}>
                <span className="dot" />
                <button
                  className={`edge h ${hEdges[row * N + col] ? "set" : ""}`}
                  onClick={() => play("h", row * N + col)}
                  aria-label={`Trait horizontal ligne ${row + 1}, colonne ${col + 1}`}
                />
              </Fragment>
            ))}
            <span className="dot" />
            {row < N && Array.from({ length: N + 1 }).map((_, col) => (
              <Fragment key={`boxrow-${row}-${col}`}>
                <button
                  className={`edge v ${vEdges[row * (N + 1) + col] ? "set" : ""}`}
                  onClick={() => play("v", row * (N + 1) + col)}
                  aria-label={`Trait vertical ligne ${row + 1}, colonne ${col + 1}`}
                />
                {col < N && (
                  <span className={`box ${boxes[row * N + col] !== null ? `won won-${boxes[row * N + col]}` : ""}`}>
                    {boxes[row * N + col] !== null ? players[boxes[row * N + col] as PlayerIndex].avatar : ""}
                  </span>
                )}
              </Fragment>
            ))}
          </Fragment>
        ))}
      </div>
      <p className="hand-label">Complète un carré pour le gagner et rejouer aussitôt.</p>
    </>
  );
}
