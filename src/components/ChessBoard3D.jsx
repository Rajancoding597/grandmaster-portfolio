import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text, ContactShadows, Stars, Sparkles, Html } from '@react-three/drei';
import { Chess } from 'chess.js';
import * as THREE from 'three';
import { getRandomGame, getRandomPuzzle, getInteractionMode } from '../utils/interactionModes';
import { getQualityLevel, QUALITY_LEVELS } from '../utils/performanceDetector';
import { PIECE_PROFILES } from '../utils/chessPieceProfiles';
import ChessPieceSimple from './ChessPieceSimple';
import ChessPieceEnhanced from './ChessPieceEnhanced';

// Procedural Chess Piece (MEDIUM quality - default)
function ChessPieceMedium({ position, type, color, onClick, isHovered, onPointerOver, onPointerOut, isSelected }) {
  const meshRef = useRef();
  const [floatOffset] = useState(Math.random() * Math.PI * 2);
  
  // Floating animation (only when not selected/hovered to keep them grounded otherwise)
  useFrame((state) => {
    if (meshRef.current && !isHovered && !isSelected) {
      // Gentle float - Note: This is LOCAL Y position relative to the group
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5 + floatOffset) * 0.02;
    } else if (meshRef.current) {
      // Lift slightly when selected/hovered
      meshRef.current.position.y = 0.2;
    }
  });

  // Removed double-transform interpolation. Group handles global position.

  const pieceColor = color === 'w' ? '#f0f0f0' : '#222222';
  const hoverColor = '#d4af37';
  const selectedColor = '#4ade80';

  // Geometry generation
  const { geometry, args, rotation } = useMemo(() => {
    let geoType = 'lathe';
    let geoArgs = [];
    let rot = [0, 0, 0];

    switch (type) {
      case 'p': // Pawn
        geoArgs = [PIECE_PROFILES.pawn, 16];
        break;
      case 'r': // Rook
        geoArgs = [PIECE_PROFILES.rook, 16];
        break;
      case 'b': // Bishop
        geoArgs = [PIECE_PROFILES.bishop, 16];
        break;
      case 'q': // Queen
        geoArgs = [PIECE_PROFILES.queen, 16];
        break;
      case 'k': // King
        geoArgs = [PIECE_PROFILES.king, 16];
        break;
      case 'n': // Knight (Special case: combined shapes for now)
        geoType = 'group';
        break;
      default:
        geoArgs = [PIECE_PROFILES.pawn, 16];
    }
    return { geometry: geoType, args: geoArgs, rotation: rot };
  }, [type]);

  // Knight Geometry (Procedural Composition)
  const KnightMesh = () => (
    <group>
      {/* Base */}
      <mesh>
        <latheGeometry args={[PIECE_PROFILES.knightBase, 16]} />
        <meshStandardMaterial color={isSelected ? selectedColor : (isHovered ? hoverColor : pieceColor)} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.8, 0.1]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.25, 0.5, 0.4]} />
        <meshStandardMaterial color={isSelected ? selectedColor : (isHovered ? hoverColor : pieceColor)} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Mane */}
      <mesh position={[0, 0.9, -0.15]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color={isSelected ? selectedColor : (isHovered ? hoverColor : pieceColor)} metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  );

  return (
    <group position={position} rotation={color === 'b' ? [0, Math.PI, 0] : [0, 0, 0]}> 
      {/* Rotate black pieces to face center if needed (mostly for Knights) */}
      
      {geometry === 'lathe' ? (
        <mesh
          ref={meshRef}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver(); }}
          onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
          castShadow
          receiveShadow
        >
          <latheGeometry args={args} />
          <meshStandardMaterial
            color={isSelected ? selectedColor : (isHovered ? hoverColor : pieceColor)}
            metalness={0.3}
            roughness={0.4}
            emissive={isSelected || isHovered ? (isSelected ? '#4ade80' : '#d4af37') : '#000000'}
            emissiveIntensity={isSelected || isHovered ? 0.3 : 0}
          />
        </mesh>
      ) : (
        <group
          ref={meshRef}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver(); }}
          onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        >
          <KnightMesh />
        </group>
      )}
    </group>
  );
}

// Board Square
function BoardSquare({ x, z, isLight, onClick, isHighlighted }) {
  return (
    <mesh
      position={[x, 0, z]} // y=0 is the top surface of the board
      receiveShadow
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <boxGeometry args={[1, 0.2, 1]} /> {/* Slightly thicker board, 1x1 squares */}
      <meshStandardMaterial
        color={isHighlighted ? '#4ade80' : (isLight ? '#deb887' : '#8b4513')} // Burlywood & SaddleBrown
        metalness={0.0}
        roughness={0.8} // Matte wood finish
        emissive={isHighlighted ? '#4ade80' : '#000000'}
        emissiveIntensity={isHighlighted ? 0.4 : 0}
      />
    </mesh>
  );
}

// Helper: Convert board index to 3D position
// Board is 8x8, centered at (0,0,0)
// Squares are 1x1 unit
// Top-left (a8) is at x=-3.5, z=-3.5
const getPositionFromIndex = (rowIndex, colIndex) => {
  const x = colIndex - 3.5;
  const z = rowIndex - 3.5;
  return [x, 0.1, z]; // y=0.1 to sit ON TOP of the board (height 0.2/2)
};

const getSquareFromIndex = (rowIndex, colIndex) => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const rank = 8 - rowIndex;
  return `${files[colIndex]}${rank}`;
};

function ChessScene({ onGameStart, mode = 'click', quality = 'MEDIUM' }) {
  const groupRef = useRef();
  const [hoveredPiece, setHoveredPiece] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  
  const chess = useMemo(() => new Chess(), []);
  const [board, setBoard] = useState(chess.board());
  const [gameData, setGameData] = useState(null);
  const [puzzleData, setPuzzleData] = useState(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [message, setMessage] = useState('');

  // Initialize
  useEffect(() => {
    chess.reset();
    setBoard(chess.board());
    setGameData(null);
    setPuzzleData(null);
    setSelectedSquare(null);
    setMessage('');

    if (mode === 'autoplay') {
      const randomGame = getRandomGame();
      setGameData(randomGame);
      setMoveIndex(0);
    } else if (mode === 'puzzle') {
      const puzzle = getRandomPuzzle();
      setPuzzleData(puzzle);
      chess.load(puzzle.fen);
      setBoard(chess.board());
      setMessage(puzzle.hint);
    }
  }, [mode, chess]);

  // Auto-play
  useEffect(() => {
    if (mode === 'autoplay' && gameData) {
      if (moveIndex < gameData.moves.length) {
        const timer = setTimeout(() => {
          try {
            const move = gameData.moves[moveIndex];
            chess.move(move);
            setBoard(chess.board());
            setMoveIndex(prev => prev + 1);
          } catch (e) {
            console.error("Invalid move:", e);
          }
        }, 1500); // Slower moves for better viewing
        return () => clearTimeout(timer);
      } else {
        // Game finished
        const timer = setTimeout(() => {
          setMessage("Game Over");
          setTimeout(() => onGameStart(), 2000); // Transition after 2s
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [mode, gameData, moveIndex, chess, onGameStart]);

  // Interaction
  const handleSquareClick = (rowIndex, colIndex) => {
    if (mode === 'autoplay') return;

    const square = getSquareFromIndex(rowIndex, colIndex);
    const piece = board[rowIndex][colIndex];

    // Select own piece
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      setMessage("Select target square");
      return;
    }

    // Move to square
    if (selectedSquare) {
      try {
        const move = {
          from: selectedSquare,
          to: square,
          promotion: 'q'
        };

        // Check if move is valid in chess.js
        const result = chess.move(move);
        
        if (result) {
          setBoard(chess.board());
          setSelectedSquare(null);
          
          if (mode === 'puzzle') {
            // Puzzle Logic
            if (puzzleData.solution && move.from === puzzleData.solution.from && move.to === puzzleData.solution.to) {
              setMessage("Correct! 🎉");
              setTimeout(() => onGameStart(), 1500);
            } else {
              setTimeout(() => {
                chess.undo();
                setBoard(chess.board());
                setMessage("Try again!");
              }, 800);
            }
          } else {
            // Free Play Logic - Transition after ANY valid move
            setMessage("Great Move! 🚀");
            setTimeout(() => onGameStart(), 1500);
          }
        } else {
            setMessage("Invalid Move ❌");
            setSelectedSquare(null);
        }
      } catch (e) {
        setMessage("Invalid Move ❌");
        setSelectedSquare(null);
      }
    }
  };

  useFrame((state) => {
    if (groupRef.current) {
      const rotationSpeed = mode === 'autoplay' ? 0.2 : 0.05;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * rotationSpeed;
    }
  });

  const boardSquares = useMemo(() => {
    const squares = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0;
        const x = col - 3.5;
        const z = row - 3.5;
        const squareName = getSquareFromIndex(row, col);
        
        squares.push(
          <BoardSquare
            key={`${row}-${col}`}
            x={x}
            z={z}
            isLight={isLight}
            isHighlighted={selectedSquare === squareName}
            onClick={() => handleSquareClick(row, col)}
          />
        );
      }
    }
    return squares;
  }, [selectedSquare, mode]);

  const pieces = useMemo(() => {
    const p = [];
    board.forEach((row, rowIndex) => {
      row.forEach((square, colIndex) => {
        if (square) {
          const squareName = getSquareFromIndex(rowIndex, colIndex);
          p.push({
            ...square,
            position: getPositionFromIndex(rowIndex, colIndex),
            key: `${square.type}-${square.color}-${rowIndex}-${colIndex}`,
            squareName
          });
        }
      });
    });
    return p;
  }, [board]);

  // Select piece component based on quality
  const PieceComponent = quality === 'LOW' ? ChessPieceSimple : quality === 'HIGH' ? ChessPieceEnhanced : ChessPieceMedium;

  // Auto-solve / Skip function
  const handleSkip = () => {
    if (mode === 'puzzle' && puzzleData && puzzleData.solution) {
      // Play the winning move
      const move = puzzleData.solution;
      try {
        chess.move(move);
        setBoard(chess.board());
        setMessage("Solved! 🚀");
        // Transition after showing the move
        setTimeout(() => onGameStart(), 1000);
      } catch (e) {
        onGameStart();
      }
    } else {
      onGameStart();
    }
  };

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}> {/* Moved board down */}
      {/* Board Base */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[9, 0.2, 9]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.4} />
      </mesh>
      
      {boardSquares}

      {pieces.map((piece, index) => (
        <PieceComponent
          key={piece.key}
          position={piece.position}
          type={piece.type}
          color={piece.color}
          isSelected={selectedSquare === piece.squareName}
          onClick={() => {
             const col = Math.round(piece.position[0] + 3.5);
             const row = Math.round(piece.position[2] + 3.5);
             handleSquareClick(row, col);
          }}
          isHovered={hoveredPiece === index}
          onPointerOver={() => setHoveredPiece(index)}
          onPointerOut={() => setHoveredPiece(null)}
        />
      ))}

      {/* 3D Title - Lowered & Centralized */}
      <Text
        position={[0, 4.5, -4]} // Lowered from 5
        fontSize={0.8}
        color="#d4af37"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        GRANDMASTER'S GAMBIT
      </Text>
      <Text
        position={[0, 3.7, -4]} // Lowered from 4.2
        fontSize={0.3}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
      >
        Interactive Portfolio Experience
      </Text>

      {/* Side Info Panel - Floating to the right */}
      <group position={[6, 1, 0]} rotation={[0, -0.5, 0]}>
        {/* Panel Background */}
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[5, 4]} />
          <meshStandardMaterial color="#000000" transparent opacity={0.6} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Mode Title */}
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.4}
          color="#d4af37"
          anchorX="center"
          anchorY="middle"
          maxWidth={4}
        >
          {mode === 'autoplay' ? 'Famous Game' : mode === 'puzzle' ? 'Tactical Challenge' : 'Free Play'}
        </Text>

        {/* Status Message */}
        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={4}
          textAlign="center"
        >
          {message || (mode === 'autoplay' ? gameData?.name : mode === 'puzzle' ? puzzleData?.hint : 'Explore the board')}
        </Text>
      </group>
    </group>
  );
}

export default function ChessBoard3D({ onGameStart }) {
  const [mode, setMode] = useState('click');
  const [quality, setQuality] = useState('MEDIUM');
  const [isMobile, setIsMobile] = useState(false);
  
  // We need to access handleSkip from outside, but it's inside ChessScene.
  // Instead, we'll implement the button logic here or pass a ref.
  // Simpler: Just render the button here and have it trigger onGameStart directly for now,
  // or use a context. For simplicity, we'll just trigger onGameStart (Skip) directly.
  // If we want the "Solve" logic, we need to lift state or use a ref.
  // Given the request for "Skip to Portfolio", triggering onGameStart is the primary goal.
  
  useEffect(() => {
    // Use random interaction mode instead of hardcoded mode
    const randomMode = getInteractionMode();
    setMode(randomMode);
    
    const detectedQuality = getQualityLevel();
    setQuality(detectedQuality);
    console.log('🎨 Detected Quality Level:', detectedQuality);
    
    // Detect mobile device for camera adjustment
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Responsive camera settings
  const cameraPosition = isMobile ? [0, 10, 16] : [0, 8, 10];
  const cameraFov = isMobile ? 60 : 45;

  return (
    <div className="w-full h-full min-h-screen relative bg-neutral-900">
      <Canvas shadows camera={{ position: cameraPosition, fov: cameraFov }}>
        <color attach="background" args={['#050505']} />
        
        {/* Galaxy Background */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.5} color="#d4af37" />

        {/* Realistic Moon with craters - Quarter moon in top-left corner */}
        <mesh position={[-12, 14, -8]} rotation={[0.3, 0.8, 0]}>
          <sphereGeometry args={[8, 64, 64]} />
          <meshStandardMaterial 
            color="#c8c8c8"
            roughness={0.85}
            metalness={0.05}
            emissive="#ffffff"
            emissiveIntensity={0.08}
            displacementScale={0.15}
            normalScale={[0.5, 0.5]}
          />
        </mesh>
        
        {/* Moon atmospheric glow */}
        <mesh position={[-12, 14, -8]}>
          <sphereGeometry args={[8.4, 32, 32]} />
          <meshBasicMaterial 
            color="#ffffff"
            transparent
            opacity={0.06}
          />
        </mesh>
        
        {/* Subtle gold rim light effect */}
        <mesh position={[-12, 14, -8]}>
          <sphereGeometry args={[8.2, 32, 32]} />
          <meshBasicMaterial 
            color="#d4af37"
            transparent
            opacity={0.04}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Main ambient light */}
        <ambientLight intensity={0.8} /> 
        
        {/* Sun-like directional light (creates shadows on moon) */}
        <directionalLight
          position={[5, 10, 5]}
          intensity={0.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
          color="#fffbf0"
        />
        
        {/* Rim light for moon (creates the shine) */}
        <pointLight 
          position={[-15, 16, -6]} 
          intensity={1.2} 
          color="#ffffff"
          distance={20}
        />
        
        {/* Fill light (softens harsh shadows on moon) */}
        <pointLight 
          position={[-12, 6, -22]} 
          intensity={0.3} 
          color="#8888cc"
        />
        <pointLight position={[-5, 8, -5]} intensity={0.4} color="#fff" />
        
        <Environment preset="city" blur={1} background={false} />
        <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.4} far={1} color="#000000" />
        
        <ChessScene onGameStart={onGameStart} mode={mode} quality={quality} />
        
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          autoRotate={mode === 'autoplay'}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* Fixed Bottom-Right Skip Button - Responsive */}
      <div className="absolute bottom-20 right-4 md:bottom-8 md:right-8 z-50">
        <button
          onClick={() => onGameStart()}
          className="px-4 py-2 md:px-6 md:py-3 bg-neutral-900/80 hover:bg-gold-500/20 text-gold-500 border border-gold-500/50 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center gap-2 group shadow-2xl text-sm md:text-base"
        >
          <span className="font-mono font-bold tracking-wider">SKIP TO PORTFOLIO</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
      
      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 text-center w-full pointer-events-none px-4">
        <p className="text-neutral-400 text-xs md:text-sm mb-2 opacity-50">
          {mode === 'autoplay' ? 'Watching Famous Game' : 
           mode === 'puzzle' ? 'Find the best move' : 
           'Click any piece to begin'}
        </p>
      </div>
    </div>
  );
}
