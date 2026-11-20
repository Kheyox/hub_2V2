import { PlayerIndex } from '../../playerTypes';

export type CellValue = PlayerIndex | null;

export function getTicTacToeWinner(board: CellValue[], size: 3 | 4): PlayerIndex | 'draw' | null {
  const lines: number[][] = [];

  for (let r = 0; r < size; r++) {
    lines.push(Array.from({ length: size }, (_, c) => r * size + c));
  }
  for (let c = 0; c < size; c++) {
    lines.push(Array.from({ length: size }, (_, r) => r * size + c));
  }
  lines.push(Array.from({ length: size }, (_, i) => i * size + i));
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));

  for (const line of lines) {
    const first = board[line[0]];
    if (first !== null && line.every((idx) => board[idx] === first)) {
      return first;
    }
  }

  if (board.every((cell) => cell !== null)) {
    return 'draw';
  }
  return null;
}
