import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

const INITIAL_BOARD = {
  e2: 'P', // White Pawn
  e4: null,
};

const ChessBoard = ({ onMove }) => {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [hasMoved, setHasMoved] = useState(false);

  const handleSquareClick = (square) => {
    if (!hasMoved && square === 'e4' && board.e2 === 'P') {
      // Simulate e4 move
      setBoard({ ...board, e2: null, e4: 'P' });
      setHasMoved(true);
      setTimeout(() => onMove(), 500); // Trigger next phase after move
    }
  };

  return (
    <div className="relative w-64 h-64 md:w-96 md:h-96 border-4 border-neutral-800 shadow-2xl shadow-gold-500/20">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {RANKS.map((rank) =>
          FILES.map((file, fileIndex) => {
            const square = `${file}${rank}`;
            const isBlack = (RANKS.indexOf(rank) + fileIndex) % 2 === 1;
            const piece = board[square];

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                className={`
                  relative flex items-center justify-center
                  ${isBlack ? 'bg-neutral-800' : 'bg-neutral-300'}
                  ${square === 'e4' && !hasMoved ? 'cursor-pointer hover:bg-gold-500/50 transition-colors' : ''}
                `}
              >
                {/* Coordinate Labels */}
                {file === 'a' && (
                  <span className={`absolute left-0.5 top-0 text-[8px] ${isBlack ? 'text-neutral-300' : 'text-neutral-800'}`}>
                    {rank}
                  </span>
                )}
                {rank === 1 && (
                  <span className={`absolute right-0.5 bottom-0 text-[8px] ${isBlack ? 'text-neutral-300' : 'text-neutral-800'}`}>
                    {file}
                  </span>
                )}

                {/* Piece */}
                {piece === 'P' && (
                  <motion.div
                    layoutId="white-pawn"
                    className="text-3xl md:text-5xl select-none text-neutral-900 drop-shadow-lg"
                    initial={false}
                    animate={{ scale: 1 }}
                    whileHover={!hasMoved ? { scale: 1.2, y: -5 } : {}}
                  >
                    ♟
                  </motion.div>
                )}
                
                {/* Hint for e4 */}
                {square === 'e4' && !hasMoved && (
                  <div className="absolute w-3 h-3 bg-gold-500 rounded-full opacity-50 animate-pulse" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChessBoard;
