import { describe, expect, it } from 'vitest';
import { getTicTacToeWinner } from './engine';

describe('getTicTacToeWinner', () => {
  it('détecte une ligne gagnante en 3x3', () => {
    expect(getTicTacToeWinner([0, 0, 0, 1, 1, null, null, null, null], 3)).toBe(0);
  });

  it('détecte une diagonale gagnante en 4x4', () => {
    const board = Array(16).fill(null);
    board[0] = 1;
    board[5] = 1;
    board[10] = 1;
    board[15] = 1;
    expect(getTicTacToeWinner(board, 4)).toBe(1);
  });

  it('détecte un match nul', () => {
    expect(getTicTacToeWinner([0, 1, 0, 0, 1, 1, 1, 0, 0], 3)).toBe('draw');
  });
});
