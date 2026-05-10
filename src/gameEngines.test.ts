import { describe, expect, it } from "vitest";
import { compareVersions, connectFourWinner, yatzyScoreFor, type ConnectFourToken } from "./gameEngines";

describe("connectFourWinner", () => {
  it("detecte une ligne horizontale", () => {
    const board: ConnectFourToken[] = Array(42).fill(null);
    board[35] = "R";
    board[36] = "R";
    board[37] = "R";
    board[38] = "R";
    expect(connectFourWinner(board)).toBe("R");
  });

  it("detecte une diagonale", () => {
    const board: ConnectFourToken[] = Array(42).fill(null);
    board[35] = "Y";
    board[29] = "Y";
    board[23] = "Y";
    board[17] = "Y";
    expect(connectFourWinner(board)).toBe("Y");
  });
});

describe("yatzyScoreFor", () => {
  it("score les categories numeriques", () => {
    expect(yatzyScoreFor("fours", [4, 1, 4, 6, 4])).toBe(12);
  });

  it("score yatzy et chance", () => {
    expect(yatzyScoreFor("yatzy", [6, 6, 6, 6, 6])).toBe(50);
    expect(yatzyScoreFor("chance", [1, 2, 3, 4, 5])).toBe(15);
  });
});

describe("compareVersions", () => {
  it("compare les versions taguees", () => {
    expect(compareVersions("v0.1.12", "0.1.11")).toBeGreaterThan(0);
    expect(compareVersions("0.1.12", "0.1.12")).toBe(0);
  });
});
