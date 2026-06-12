import type { LucideIcon } from "lucide-react";
import { Brain, CircleDot, Dice5, Flame, Grid2x2, Grid3X3, Landmark, Puzzle, Rows3, Ship, Sparkles, Swords, Table2, Zap } from "lucide-react";

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
  | "memory"
  | "dotsboxes"
  | "reflex";

export type GameDefinition = {
  id: GameId;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
  category: "Rapide" | "Stratégie" | "Hasard" | "Déduction";
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
    subtitle: "Duel éclair en 3x3",
    icon: Grid3X3,
    accent: "#39c6a3",
    category: "Rapide",
    rules: {
      objective: "Aligner 3 symboles identiques (4 en mode 4x4) en ligne, colonne ou diagonale.",
      turn: "Chacun son tour, pose ton symbole dans une case libre.",
      tips: ["Le centre est la case la plus forte en 3x3.", "La taille de la grille se règle dans Options."]
    }
  },
  {
    id: "connect4",
    title: "Puissance 4",
    subtitle: "Aligne quatre jetons",
    icon: Rows3,
    accent: "#f3c14b",
    category: "Stratégie",
    rules: {
      objective: "Aligner quatre jetons horizontalement, verticalement ou en diagonale.",
      turn: "Choisis une colonne : le jeton tombe au plus bas.",
      tips: ["Bloque les alignements de trois jetons adverses.", "Construis des doubles menaces pour forcer la victoire."]
    }
  },
  {
    id: "hangman",
    title: "Pendu",
    subtitle: "Un mot, peu d'erreurs",
    icon: CircleDot,
    accent: "#ef7a59",
    category: "Déduction",
    rules: {
      objective: "Le devineur doit trouver le mot avant d'épuiser ses erreurs.",
      turn: "Un joueur cache un mot, l'autre propose des lettres une par une.",
      tips: ["Les accents sont retirés automatiquement.", "Si le devineur perd, celui qui a choisi le mot gagne la manche.", "Le nombre d'erreurs se règle dans Options."]
    }
  },
  {
    id: "yatzy",
    title: "Yatzy",
    subtitle: "Dés, choix, sang-froid",
    icon: Dice5,
    accent: "#7fb7ff",
    category: "Hasard",
    rules: {
      objective: "Marquer plus de points que l'adversaire en remplissant toute la feuille de score.",
      turn: "Lance les 5 dés, garde ceux qui t'intéressent, relance jusqu'à 2 fois, puis choisis une catégorie libre.",
      tips: [
        "Brelan = somme des 3 dés identiques, carré = somme des 4.",
        "Petite suite = 4 dés qui se suivent (30 pts), grande suite = 5 dés (40 pts).",
        "Full (brelan + paire) = 25 pts, Yatzy = 50 pts.",
        "63 points ou plus en haut de feuille = bonus de 50."
      ]
    }
  },
  {
    id: "reversi",
    title: "Reversi",
    subtitle: "Retourne le plateau",
    icon: Sparkles,
    accent: "#39c6a3",
    category: "Stratégie",
    rules: {
      objective: "Avoir plus de pions de sa couleur que l'adversaire à la fin.",
      turn: "Pose un pion qui encadre une ligne de pions adverses : ils sont retournés.",
      tips: ["Les coups valides sont marqués sur le plateau.", "Les coins sont imprenables : vise-les.", "Sans coup possible, le tour passe automatiquement."]
    }
  },
  {
    id: "matches",
    title: "Allumettes",
    subtitle: "Ne prends pas la dernière",
    icon: Flame,
    accent: "#ef7a59",
    category: "Rapide",
    rules: {
      objective: "Forcer l'adversaire à prendre la dernière allumette.",
      turn: "Prends 1, 2 ou 3 allumettes.",
      tips: ["Le nombre de départ se règle dans Options.", "Astuce : laisse 1, 5, 9, 13... allumettes à l'adversaire."]
    }
  },
  {
    id: "mastermind",
    title: "Mastermind",
    subtitle: "Code secret en duel",
    icon: Brain,
    accent: "#d89cff",
    category: "Déduction",
    rules: {
      objective: "Deviner le code secret de 4 couleurs en 8 essais maximum.",
      turn: "Un joueur compose le code en secret, l'autre propose des combinaisons.",
      tips: ["« Bien » = bonne couleur à la bonne place.", "« Mal placé » = bonne couleur, mauvaise position.", "Les couleurs peuvent se répéter dans le code."]
    }
  },
  {
    id: "battleship",
    title: "Bataille navale",
    subtitle: "Touché... coulé !",
    icon: Ship,
    accent: "#7fb7ff",
    category: "Stratégie",
    rules: {
      objective: "Couler toute la flotte adverse (3 navires placés au hasard).",
      turn: "Tire sur une case de la grille ennemie. Si tu touches, tu rejoues.",
      tips: ["Les flottes sont placées automatiquement au hasard.", "✕ = touché, • = manqué.", "Quand tu touches, tire sur les cases voisines."]
    }
  },
  {
    id: "checkers",
    title: "Dames",
    subtitle: "Prises et rafles",
    icon: Swords,
    accent: "#f5c84c",
    category: "Stratégie",
    rules: {
      objective: "Capturer tous les pions adverses ou bloquer tous leurs coups.",
      turn: "Déplace un pion en diagonale. La prise est obligatoire et les prises s'enchaînent.",
      tips: ["Un pion qui atteint la dernière rangée devient dame.", "Les cases de destination valides sont surlignées.", "Après une prise, si le même pion peut reprendre, il continue."]
    }
  },
  {
    id: "dominoes",
    title: "Dominos",
    subtitle: "Pose ou pioche",
    icon: Table2,
    accent: "#39c6a3",
    category: "Stratégie",
    rules: {
      objective: "Être le premier à poser tous ses dominos.",
      turn: "Pose un domino dont une face correspond à une extrémité de la chaîne. Sinon, pioche jusqu'à pouvoir jouer.",
      tips: ["Le plus fort double commence la partie.", "Pioche vide et personne ne peut jouer : le moins de points en main gagne."]
    }
  },
  {
    id: "mancala",
    title: "Mancala",
    subtitle: "Sème les graines",
    icon: Landmark,
    accent: "#ef7a59",
    category: "Stratégie",
    rules: {
      objective: "Récolter plus de graines que l'adversaire dans son grenier.",
      turn: "Choisis une case de ta rangée et sème les graines une par une dans le sens anti-horaire.",
      tips: ["Si la dernière graine tombe dans ton grenier, tu rejoues.", "Dernière graine dans une de tes cases vide : tu captures la case d'en face.", "La partie s'arrête quand une rangée est vide."]
    }
  },
  {
    id: "quarto",
    title: "Quarto",
    subtitle: "Quatre pièces, un point commun",
    icon: Puzzle,
    accent: "#d89cff",
    category: "Déduction",
    rules: {
      objective: "Former une ligne de 4 pièces partageant au moins un attribut commun.",
      turn: "Place la pièce que l'adversaire t'a donnée, puis choisis celle qu'il devra placer.",
      tips: ["4 attributs : taille, forme, couleur, plein/creux.", "C'est toi qui donnes ses pièces à l'adversaire : ne lui offre pas la victoire.", "Lignes, colonnes et diagonales comptent."]
    }
  },
  {
    id: "memory",
    title: "Memory",
    subtitle: "Trouve les paires",
    icon: Grid3X3,
    accent: "#7fb7ff",
    category: "Rapide",
    rules: {
      objective: "Retourner plus de paires que l'adversaire.",
      turn: "Retourne deux cartes. Une paire : tu marques et tu rejoues. Sinon, c'est à l'autre.",
      tips: ["Mémorise aussi les cartes ratées par l'adversaire.", "La taille de la grille (4x4 ou 6x6) se règle dans Options."]
    }
  },
  {
    id: "dotsboxes",
    title: "Points & Carrés",
    subtitle: "Ferme le carré, marque",
    icon: Grid2x2,
    accent: "#39c6a3",
    category: "Stratégie",
    rules: {
      objective: "Fermer plus de carrés que l'adversaire sur la grille.",
      turn: "Trace un trait entre deux points voisins. Fermer un carré te le fait gagner et rejouer.",
      tips: ["Compléter un carré rejoue : enchaîne les chaînes !", "Évite de tracer le 3e côté d'un carré, tu l'offres à l'autre."]
    }
  },
  {
    id: "reflex",
    title: "Réflexe",
    subtitle: "Le plus rapide gagne",
    icon: Zap,
    accent: "#f5c84c",
    category: "Rapide",
    rules: {
      objective: "Être le premier à taper quand l'écran passe au vert, premier à 5 points.",
      turn: "Chacun pose un pouce sur sa zone. Au vert, le plus rapide marque.",
      tips: ["Patience : taper avant le vert offre le point à l'autre.", "Chaque zone est orientée vers son joueur, face à face."]
    }
  }
];
