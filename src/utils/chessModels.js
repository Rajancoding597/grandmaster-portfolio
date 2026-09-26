export const PIECE_MODELS = Object.freeze({
  p: 'pawn', r: 'rook', n: 'knight', b: 'bishop', q: 'queen', k: 'king',
});

export const MODEL_URLS = Object.values(PIECE_MODELS).map(
  (name) => `${import.meta.env?.BASE_URL ?? '/'}models/chess/classic/${name}.glb`
);

// Source models use metres and 50 mm squares; our board uses unit squares.
export const MODEL_SCALE = 20;

// Keep React identities across moves, captures, promotion and castling so the
// existing model can glide to its destination instead of unmounting/reappearing.
export function snapshotBoard(chess, previous = [], move = null) {
  const identities = new Map(previous.flat().filter(Boolean).map((piece) => [piece.square, piece.id]));
  if (move) {
    identities.set(move.to, identities.get(move.from));
    identities.delete(move.from);
    if (move.flags.includes('k') || move.flags.includes('q')) {
      const rank = move.from[1];
      const from = `${move.flags.includes('k') ? 'h' : 'a'}${rank}`;
      const to = `${move.flags.includes('k') ? 'f' : 'd'}${rank}`;
      identities.set(to, identities.get(from));
      identities.delete(from);
    }
  }
  return chess.board().map((row) => row.map((piece) => piece && ({
    ...piece,
    id: identities.get(piece.square) ?? `${piece.color}-${piece.square}`,
  })));
}
