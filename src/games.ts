import type { LucideIcon } from "lucide-react";
import { Brain, CircleDot, Dice5, Flame, Grid3X3, Landmark, Puzzle, Rows3, Ship, Sparkles, Swords, Table2 } from "lucide-react";

export type GameId =
  | "tictactoe"
  | "connect4"
  | "hangman"
  | "yatzy"
  | "reversi"
  | "matches"
  | "mastermind"
  | "battleship"
  | "checkers"
  | "dominoes"
  | "mancala"
  | "quarto"
  | "memory";

export type GameDefinition = {
  id: GameId;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
};

export const games: GameDefinition[] = [
  {
    id: "tictactoe",
    title: "Morpion",
    subtitle: "Duel rapide en 3x3",
    icon: Grid3X3,
    accent: "#39c6a3"
  },
  {
    id: "connect4",
    title: "Puissance 4",
    subtitle: "Aligne quatre pions",
    icon: Rows3,
    accent: "#f3c14b"
  },
  {
    id: "hangman",
    title: "Pendu",
    subtitle: "Un mot, six erreurs",
    icon: CircleDot,
    accent: "#ef7a59"
  },
  {
    id: "yatzy",
    title: "Yatzy",
    subtitle: "Des, choix, sang-froid",
    icon: Dice5,
    accent: "#7fb7ff"
  },
  {
    id: "reversi",
    title: "Reversi",
    subtitle: "Retourne le plateau",
    icon: Sparkles,
    accent: "#39c6a3"
  },
  {
    id: "matches",
    title: "Allumettes",
    subtitle: "Ne prends pas la derniere",
    icon: Flame,
    accent: "#ef7a59"
  },
  {
    id: "mastermind",
    title: "Mastermind",
    subtitle: "Code secret en duel",
    icon: Brain,
    accent: "#d89cff"
  },
  {
    id: "battleship",
    title: "Bataille navale",
    subtitle: "Touche et coule",
    icon: Ship,
    accent: "#7fb7ff"
  },
  {
    id: "checkers",
    title: "Dames",
    subtitle: "Prends les pions",
    icon: Swords,
    accent: "#f5c84c"
  },
  {
    id: "dominoes",
    title: "Dominos",
    subtitle: "Pose ou pioche",
    icon: Table2,
    accent: "#39c6a3"
  },
  {
    id: "mancala",
    title: "Awale",
    subtitle: "Seme les graines",
    icon: Landmark,
    accent: "#ef7a59"
  },
  {
    id: "quarto",
    title: "Quarto",
    subtitle: "Quatre pieces, un trait",
    icon: Puzzle,
    accent: "#d89cff"
  },
  {
    id: "memory",
    title: "Memory",
    subtitle: "Trouve les paires",
    icon: Grid3X3,
    accent: "#7fb7ff"
  }
];
