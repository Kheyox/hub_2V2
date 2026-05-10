import type { LucideIcon } from "lucide-react";
import { CircleDot, Dice5, Grid3X3, Rows3 } from "lucide-react";

export type GameId = "tictactoe" | "connect4" | "hangman" | "yatzy";

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
  }
];
