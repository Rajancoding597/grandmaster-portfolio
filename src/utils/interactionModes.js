/**
 * Interaction Modes System
 * Randomly selects and manages entry interactions: Auto-play, Puzzle, or Click
 */

// Famous Chess Games (PGN notation)
// Famous Chess Games (PGN notation)
export const FAMOUS_GAMES = {
  scholars_mate: {
    name: "Scholar's Mate",
    players: "The 4-Move Checkmate",
    moves: [
      'e4', 'e5', 'Qh5', 'Nc6', 'Bc4', 'Nf6', 'Qxf7#'
    ]
  },
  immortal: {
    name: "The Immortal Game",
    players: "Anderssen vs Kieseritzky, 1851",
    moves: [
      'e4', 'e5', 'f4', 'exf4', 'Bc4', 'Qh4+', 'Kf1', 'b5',
      'Bxb5', 'd6', 'Nf3', 'Qh6', 'd4', 'Nf6', 'Bxf4', 'Qg7'
    ]
  },
  opera: {
    name: "The Opera Game",
    players: "Morphy vs Duke of Brunswick, 1858",
    moves: [
      'e4', 'e5', 'Nf3', 'd6', 'd4', 'Bg4', 'dxe5', 'Bxf3',
      'Qxf3', 'dxe5', 'Bc4', 'Nf6', 'Qb3', 'Qe7', 'Nc3'
    ]
  }
};

// Mate in 1/2 Puzzles (FEN notation)
export const PUZZLES = {
  mate_in_1: {
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
    solution: { from: 'f3', to: 'f7' },
    hint: "White to move: Find the checkmate in 1!",
    difficulty: "easy"
  },
  mate_in_2: {
    fen: "r1b1k1nr/pppp1ppp/2n5/2b1p3/2B1P2q/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
    solution: { from: 'f3', to: 'f7' }, // First move of the sequence
    hint: "White to move: Can you start the attack?",
    difficulty: "medium"
  }
};

/**
 * Get random interaction mode
 */
export function getInteractionMode() {
  // Check if already set in session
  const existingMode = sessionStorage.getItem('chessInteractionMode');
  if (existingMode && ['autoplay', 'puzzle', 'click'].includes(existingMode)) {
    console.log(`♻️ Using cached interaction mode: ${existingMode}`);
    return existingMode;
  }
  
  // Randomly select mode
  const modes = ['autoplay', 'puzzle', 'click'];
  const randomMode = modes[Math.floor(Math.random() * modes.length)];
  
  // Cache for session
  try {
    sessionStorage.setItem('chessInteractionMode', randomMode);
  } catch (e) {
    console.warn('Could not cache interaction mode:', e);
  }
  
  console.log(`🎲 Selected interaction mode: ${randomMode}`);
  return randomMode;
}

/**
 * Get random game for auto-play mode
 */
export function getRandomGame() {
  const games = Object.keys(FAMOUS_GAMES);
  const randomKey = games[Math.floor(Math.random() * games.length)];
  return {
    key: randomKey,
    ...FAMOUS_GAMES[randomKey]
  };
}

/**
 * Get random puzzle
 */
export function getRandomPuzzle() {
  const puzzles = Object.keys(PUZZLES);
  const randomKey = puzzles[Math.floor(Math.random() * puzzles.length)];
  return {
    key: randomKey,
    ...PUZZLES[randomKey]
  };
}

/**
 * Convert algebraic notation to board coordinates
 * e.g., 'e2' -> {  x: 4, z: 6 } (for 3D positioning)
 */
export function algebraicToCoords(square) {
  const file = square.charCodeAt(0) - 97; // a=0, b=1, etc.
  const rank = parseInt(square[1]) - 1; // 1=0, 2=1, etc.
  
  return {
    x: file - 3.5, // Center the board
    z: 3.5 - rank  // Flip for 3D (rank 1 at bottom)
  };
}

/**
 * Convert coordinates to algebraic notation
 */
export function coordsToAlgebraic(x, z) {
  const file = Math.round(x + 3.5);
  const rank = Math.round(3.5 - z) + 1;
  
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  return `${files[file]}${rank}`;
}

/**
 * Parse simple algebraic notation move
 * e.g., 'e4' → { from: 'e2', to: 'e4', piece: 'pawn' }
 */
export function parseMove(move, currentPosition) {
  // This is simplified - a full implementation would need chess logic
  // For now, just return the move as-is
  return {
    notation: move,
    to: move.match(/[a-h][1-8]/) ? move.match(/[a-h][1-8]/)[0] : null
  };
}

/**
 * Interaction mode configurations
 */
export const MODE_CONFIGS = {
  autoplay: {
    title: "Famous Game Replay",
    subtitle: "Watch a legendary battle unfold",
    instruction: "Sit back and enjoy",
    icon: "▶️"
  },
  puzzle: {
    title: "Tactical Challenge",
    subtitle: "Find the winning move",
    instruction: "Click the correct piece to continue",
    icon: "🧩"
  },
  click: {
    title: "Your Move",
    subtitle: "Click any piece to begin your journey",
    instruction: "Explore the board and make your mark",
    icon: "👆"
  }
};

/**
 * Get UI config for current mode
 */
export function getModeConfig(mode) {
  return MODE_CONFIGS[mode] || MODE_CONFIGS.click;
}
