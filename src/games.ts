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
  mood: string;
  category: "Rapide" | "Strategie" | "Hasard" | "Deduction";
  rules: {
    objective: string;
    turn: string;
    tips: string[];
  };
};

export const games: GameDefinition[] = [
  {
    id: "tictactoe",
    title: "Morpion",
    subtitle: "Duel rapide en 3x3",
    icon: Grid3X3,
    accent: "#39c6a3",
    mood: "Grille claire, duel instantane",
    category: "Rapide",
    rules: { objective: "Aligner tous ses symboles avant l'autre joueur.", turn: "Chaque joueur pose un symbole dans une case libre.", tips: ["En 4x4, il faut remplir une ligne de 4.", "Les diagonales comptent."] }
  },
  {
    id: "connect4",
    title: "Puissance 4",
    subtitle: "Aligne quatre pions",
    icon: Rows3,
    accent: "#f3c14b",
    mood: "Jetons lourds, plateau vertical",
    category: "Strategie",
    rules: { objective: "Aligner quatre jetons horizontalement, verticalement ou en diagonale.", turn: "Choisis une colonne, le jeton tombe au plus bas.", tips: ["Un coup qui touche donne quand meme le tour suivant.", "Bloque les menaces de trois jetons."] }
  },
  {
    id: "hangman",
    title: "Pendu",
    subtitle: "Un mot, six erreurs",
    icon: CircleDot,
    accent: "#ef7a59",
    mood: "Mot secret, tension douce",
    category: "Deduction",
    rules: { objective: "Le devineur doit trouver le mot avant d'epuiser les erreurs.", turn: "Un joueur cache le mot, l'autre propose des lettres.", tips: ["Les accents sont retires automatiquement.", "Si le devineur perd, le joueur qui a choisi le mot gagne."] }
  },
  {
    id: "yatzy",
    title: "Yatzy",
    subtitle: "Des, choix, sang-froid",
    icon: Dice5,
    accent: "#7fb7ff",
    mood: "Des blancs, table de score",
    category: "Hasard",
      rules: { objective: "Marquer plus de points que l'autre joueur sur une feuille complete.", turn: "Lance une premiere fois, garde les des utiles, relance jusqu'a deux fois, puis choisis une categorie libre.", tips: ["Petite suite = 4 des qui se suivent, 30 points.", "Grande suite = 5 des qui se suivent, 40 points.", "Full vaut 25, Yatzy vaut 50, et le haut donne 50 de bonus a partir de 63."] }
  },
  {
    id: "reversi",
    title: "Reversi",
    subtitle: "Retourne le plateau",
    icon: Sparkles,
    accent: "#39c6a3",
    mood: "Disques qui retournent",
    category: "Strategie",
    rules: { objective: "Avoir plus de pions que l'adversaire en fin de partie.", turn: "Pose un pion sur une case valide pour encadrer et retourner des pions.", tips: ["Les coups valides sont marques.", "Les coins sont tres puissants."] }
  },
  {
    id: "matches",
    title: "Allumettes",
    subtitle: "Ne prends pas la derniere",
    icon: Flame,
    accent: "#ef7a59",
    mood: "Allumettes, piege final",
    category: "Rapide",
    rules: { objective: "Forcer l'autre joueur a prendre la derniere allumette.", turn: "Prends 1, 2 ou 3 allumettes.", tips: ["Le nombre de depart est reglable.", "Essaie de laisser 1, 5, 9, 13..."] }
  },
  {
    id: "mastermind",
    title: "Mastermind",
    subtitle: "Code secret en duel",
    icon: Brain,
    accent: "#d89cff",
    mood: "Code couleur, deduction",
    category: "Deduction",
    rules: { objective: "Deviner le code secret en huit essais.", turn: "Le codeur choisit 4 couleurs, le devineur propose des combinaisons.", tips: ["Bien = bonne couleur au bon endroit.", "Couleur = bonne couleur au mauvais endroit."] }
  },
  {
    id: "battleship",
    title: "Bataille navale",
    subtitle: "Touche et coule",
    icon: Ship,
    accent: "#7fb7ff",
    mood: "Radar bleu, tirs caches",
    category: "Strategie",
    rules: { objective: "Detruire tous les navires adverses.", turn: "Attaque une case du plateau ennemi. Un tir touche te laisse jouer.", tips: ["Les navires sont generes automatiquement.", "Les tirs deja joues restent visibles."] }
  },
  {
    id: "checkers",
    title: "Dames",
    subtitle: "Prends les pions",
    icon: Swords,
    accent: "#f5c84c",
    mood: "Damier bois, prises forcees",
    category: "Strategie",
    rules: { objective: "Capturer tous les pions adverses ou bloquer l'autre joueur.", turn: "Deplace un pion en diagonale. Les prises sont prioritaires.", tips: ["Un pion arrive au bout devient dame.", "Les cases de destination valides sont marquees."] }
  },
  {
    id: "dominoes",
    title: "Dominos",
    subtitle: "Pose ou pioche",
    icon: Table2,
    accent: "#39c6a3",
    mood: "Pieces ivoire, ligne centrale",
    category: "Strategie",
    rules: { objective: "Te debarrasser de tes dominos ou finir avec le moins de points.", turn: "Pose un domino compatible avec une extremite ou pioche.", tips: ["Le double le plus fort commence.", "Si personne ne peut jouer, le moins de points gagne."] }
  },
  {
    id: "mancala",
    title: "Awale",
    subtitle: "Seme les graines",
    icon: Landmark,
    accent: "#ef7a59",
    mood: "Graines, bois creuse",
    category: "Strategie",
    rules: { objective: "Avoir le plus de graines dans ton grenier.", turn: "Choisis une case de ton camp et seme les graines une par une.", tips: ["Finir dans ton grenier donne un tour bonus.", "Le jeu finit quand un camp est vide."] }
  },
  {
    id: "quarto",
    title: "Quarto",
    subtitle: "Quatre pieces, un trait",
    icon: Puzzle,
    accent: "#d89cff",
    mood: "Pieces abstraites, piege logique",
    category: "Deduction",
    rules: { objective: "Former une ligne de 4 pieces partageant un attribut.", turn: "Place la piece donnee, puis choisis la piece que l'autre devra placer.", tips: ["Les attributs: taille, forme, couleur, plein/creux.", "La ligne peut etre une rangee, colonne ou diagonale."] }
  },
  {
    id: "memory",
    title: "Memory",
    subtitle: "Trouve les paires",
    icon: Grid3X3,
    accent: "#7fb7ff",
    mood: "Cartes retournees, memoire",
    category: "Rapide",
    rules: { objective: "Trouver plus de paires que l'autre joueur.", turn: "Retourne deux cartes. Si elles correspondent, tu marques et rejoues.", tips: ["Memorise les emplacements.", "Une mauvaise paire passe le tour."] }
  }
];
