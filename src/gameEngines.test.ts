import { describe, expect, it } from "vitest";
import { compareVersions, connectFourWinner, emptyYatzySheet, yatzyBonusFor, yatzyScoreFor, yatzyTotalFor, type ConnectFourToken } from "./gameEngines";

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

  it("score les combinaisons en sommant tous les des", () => {
    expect(yatzyScoreFor("onePair", [6, 6, 5, 5, 1])).toBe(23);
    expect(yatzyScoreFor("onePair", [1, 2, 3, 4, 6])).toBe(0);
    expect(yatzyScoreFor("twoPairs", [6, 6, 5, 5, 1])).toBe(23);
    expect(yatzyScoreFor("twoPairs", [6, 6, 5, 4, 1])).toBe(0);
    expect(yatzyScoreFor("threeKind", [4, 4, 4, 3, 3])).toBe(18);
    expect(yatzyScoreFor("threeKind", [4, 4, 2, 3, 1])).toBe(0);
    expect(yatzyScoreFor("fourKind", [3, 3, 3, 3, 6])).toBe(18);
    expect(yatzyScoreFor("fourKind", [3, 3, 3, 2, 6])).toBe(0);
    expect(yatzyScoreFor("fullHouse", [2, 2, 5, 5, 5])).toBe(25);
  });

  it("score les suites et refuse les fausses combinaisons", () => {
    expect(yatzyScoreFor("smallStraight", [3, 1, 4, 5, 6])).toBe(30);
    expect(yatzyScoreFor("smallStraight", [1, 2, 3, 4, 4])).toBe(30);
    expect(yatzyScoreFor("smallStraight", [1, 2, 3, 5, 5])).toBe(0);
    expect(yatzyScoreFor("largeStraight", [2, 3, 4, 5, 6])).toBe(40);
    expect(yatzyScoreFor("largeStraight", [1, 2, 3, 4, 5])).toBe(40);
    expect(yatzyScoreFor("largeStraight", [1, 2, 3, 4, 6])).toBe(0);
    expect(yatzyScoreFor("fullHouse", [2, 2, 2, 2, 5])).toBe(0);
  });

  it("ajoute le bonus superieur a partir de 63", () => {
    const sheet = emptyYatzySheet();
    sheet.ones = 3;
    sheet.twos = 6;
    sheet.threes = 9;
    sheet.fours = 12;
    sheet.fives = 15;
    sheet.sixes = 18;
    expect(yatzyBonusFor(sheet)).toBe(50);
    expect(yatzyTotalFor(sheet)).toBe(113);
  });
});

describe("compareVersions", () => {
  it("compare les versions taguees", () => {
    expect(compareVersions("v0.1.12", "0.1.11")).toBeGreaterThan(0);
    expect(compareVersions("0.1.12", "0.1.12")).toBe(0);
  });
});
