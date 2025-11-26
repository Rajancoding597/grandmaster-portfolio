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

function ChessScene({ onGameStart, mode = 'click', quality = 'MEDIUM', isMobile = false }) {
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
          setTimeout(() => onGameStart("Game Analysis Complete. Accessing Archives..."), 2000); // Transition after 2s
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
              setTimeout(() => onGameStart("Tactical Solution Verified. Access Granted."), 1500);
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
            setTimeout(() => onGameStart("Move Accepted. Initiating Sequence..."), 1500);
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
        setMessage("Solved! 🚀");
        // Transition after showing the move
        setTimeout(() => onGameStart("Auto-Solve Complete. Proceeding..."), 1000);
      } catch (e) {
        onGameStart("Skipping Puzzle...");
      }
    } else {
      onGameStart("Bypassing Security...");
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

      {/* Side Info Panel - Floating to the right on Desktop, Top on Mobile */}
      <group 
        position={isMobile ? [0, 5.5, -4] : [6, 1, 0]} 
        rotation={isMobile ? [0, 0, 0] : [0, -0.5, 0]}
        scale={isMobile ? 0.8 : 1}
      >
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


const BOOT_MESSAGES = [
  { text: "> SYSTEM_FAILURE_DETECTED", color: "text-red-500" },
  { text: "> ATTEMPTING_AUTO_REPAIR...", color: "text-yellow-500" },
  { text: "> ERROR: SEGMENTATION_FAULT_AT_0x8F", color: "text-red-500" },
  { text: "> RETRYING_CONNECTION (ATTEMPT 2)...", color: "text-yellow-500" },
  { text: "> TIMEOUT_AT_GATEWAY_PROXY", color: "text-red-500" },
  { text: "> EXECUTING_FORCE_OVERRIDE...", color: "text-green-500" },
  { text: "> BYPASSING_FIREWALL...", color: "text-green-500" },
  { text: "> ACCESS_GRANTED", color: "text-green-500" },
  { text: "> WELCOME_RAJAN", color: "text-green-500" }
];

export default function ChessBoard3D({ onGameStart }) {
  const [mode, setMode] = useState('click');
  const [quality, setQuality] = useState('MEDIUM');
  const [isMobile, setIsMobile] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [showBoot, setShowBoot] = useState(false);
  const [glitchStyle, setGlitchStyle] = useState({});
  const [bootLines, setBootLines] = useState([]);
  const [transitionStage, setTransitionStage] = useState('idle'); // idle, success, glitch, boot
  const [successMsg, setSuccessMsg] = useState('');
  const [repairProgress, setRepairProgress] = useState(0);
  const [progressColor, setProgressColor] = useState('bg-green-500');
  const [currentAction, setCurrentAction] = useState('');

  // Dynamic Glitch Effect
  useEffect(() => {
    if (!isGlitching) {
      setGlitchStyle({});
      return;
    }

    const interval = setInterval(() => {
      const skewX = Math.random() * 20 - 10;
      const skewY = Math.random() * 10 - 5;
      const scale = 1 + Math.random() * 0.1;
      const hue = Math.random() * 90;
      const blur = Math.random() * 4;
      
      setGlitchStyle({
        transform: `skew(${skewX}deg, ${skewY}deg) scale(${scale})`,
        filter: `hue-rotate(${hue}deg) blur(${blur}px)`,
        opacity: 0.8 + Math.random() * 0.2
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isGlitching]);

  // Repair Sequence Logic
  useEffect(() => {
    if (!showBoot) {
      setBootLines([]);
      setRepairProgress(0);
      setProgressColor('bg-green-500');
      setCurrentAction('');
      return;
    }

    const runRepairSequence = async () => {
      const addLog = (text, color) => {
        setBootLines(prev => [...prev, { text, color }]);
      };
      
      const setAction = (text) => {
        setCurrentAction(text);
      };

      const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      // Attempt 1: Failure
      addLog("> SYSTEM_FAILURE_DETECTED", "text-red-500");
      setAction("DIAGNOSING SYSTEM FAILURE");
      await wait(800);
      
      addLog("> INITIATING_SYSTEM_REPAIR (ATTEMPT 1/3)...", "text-yellow-500");
      setAction("ATTEMPTING REPAIR (1/3)");
      setProgressColor('bg-yellow-500');
      
      // Progress 0 -> 35% (Simulating "Scanning")
      for (let i = 0; i <= 35; i+=1) {
        setRepairProgress(i);
        await wait(20); // Fast scan
      }
      await wait(200); // Brief pause
      
      // Progress 35 -> 42% (Simulating "Fixing")
      setAction("REPAIRING SECTOR 0x99");
      for (let i = 35; i <= 42; i+=0.5) {
        setRepairProgress(i);
        await wait(100); // Slow, struggling
      }
      
      setProgressColor('bg-red-500');
      setAction("REPAIR FAILED");
      addLog("> ERROR: CORRUPTED_SECTOR_0x99. REPAIR_ABORTED.", "text-red-500");
      await wait(1200);

      // Attempt 2: Failure
      addLog("> REROUTING_CACHE_NODES (ATTEMPT 2/3)...", "text-yellow-500");
      setAction("REROUTING TRAFFIC (2/3)");
      setProgressColor('bg-yellow-500');
      
      // Progress 0 -> 60% (Fast Reroute)
      setRepairProgress(0);
      for (let i = 0; i <= 60; i+=2) {
        setRepairProgress(i);
        await wait(15);
      }
      await wait(200);
      
      // Progress 60 -> 88% (Connecting)
      setAction("ESTABLISHING HANDSHAKE");
      for (let i = 60; i <= 88; i+=1) {
        setRepairProgress(i);
        await wait(50);
      }
      
      setProgressColor('bg-red-500');
      setAction("CONNECTION REFUSED");
      addLog("> ERROR: CONNECTION_REFUSED_BY_HOST.", "text-red-500");
      await wait(1200);

      // Attempt 3: Success
      addLog("> EXECUTING_ROOT_OVERRIDE_PROTOCOL...", "text-green-500");
      setAction("OVERRIDING SECURITY");
      setProgressColor('bg-green-500');
      
      // Progress 0 -> 100% (Smooth Override)
      setRepairProgress(0);
      for (let i = 0; i <= 100; i+=1.5) {
        setRepairProgress(i);
        await wait(20);
      }
      
      setAction("SYSTEM RESTORED");
      addLog("> SUCCESS: SYSTEM_KERNEL_RESTORED.", "text-green-500");
      await wait(800);
      addLog("> WELCOME_BACK_RAJAN.", "text-green-500");
      
      // Wait for user to read the success message before transitioning
      await wait(2000);
      onGameStart();
    };

    runRepairSequence();
  }, [showBoot, onGameStart]);

  const handleGameStart = (message = "Bypassing Security...") => {
    if (transitionStage !== 'idle') return;

    // Stage 1: Success Message
    setSuccessMsg(message);
    setTransitionStage('success');

    // Stage 2: Crash (Glitch)
    setTimeout(() => {
      setTransitionStage('glitch');
      setIsGlitching(true);
    }, 3000);
    
    // Stage 3: Boot Screen
    setTimeout(() => {
      setShowBoot(true);
      setIsGlitching(false);
      setTransitionStage('boot');
    }, 4000); // 3s success + 1s glitch
  };
  
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
    <div className="w-full h-full min-h-screen relative bg-neutral-900 overflow-hidden">
      {/* Glitch Container */}
      <div 
        className="w-full h-full transition-all duration-75"
        style={glitchStyle}
      >
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
        
        <ChessScene onGameStart={handleGameStart} mode={mode} quality={quality} isMobile={isMobile} />
        
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
          onClick={() => handleGameStart("Bypassing Security...")}
          className={`px-4 py-2 md:px-6 md:py-3 bg-neutral-900/80 hover:bg-gold-500/20 text-gold-500 border border-gold-500/50 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center gap-2 group shadow-2xl text-sm md:text-base ${transitionStage !== 'idle' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <span className="font-mono font-bold tracking-wider">SKIP TO PORTFOLIO</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
      
      {/* Success Message Overlay - Enhanced */}
      <div 
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-500 ${transitionStage === 'success' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="bg-black/80 backdrop-blur-md border border-gold-500/30 rounded-xl p-8 md:p-12 shadow-2xl shadow-gold-500/10 flex flex-col items-center gap-4 min-w-[300px] md:min-w-[400px]">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-500/50 mb-2 animate-bounce">
            <span className="text-2xl">🔓</span>
          </div>
          
          {/* Main Message */}
          <h2 className="text-2xl md:text-4xl font-bold text-gold-500 text-center tracking-wide drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">
            {successMsg}
          </h2>
          
          {/* Subtext */}
          <div className="flex items-center gap-2 text-neutral-400 font-mono text-xs md:text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <p className="uppercase tracking-widest">Establishing Secure Connection...</p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 text-center w-full pointer-events-none px-4">
        <p className="text-neutral-400 text-xs md:text-sm mb-2 opacity-50">
          {mode === 'autoplay' ? 'Watching Famous Game' : 
           mode === 'puzzle' ? 'Find the best move' : 
           'Click any piece to begin'}
        </p>
      </div>
      </div>
      
      {/* Matrix Boot Overlay with CRT Effects */}
      {showBoot && (
        <div className="absolute inset-0 bg-black z-[100] flex items-center justify-center font-mono text-green-500 p-8 overflow-hidden">
          {/* CRT Scanlines */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-20" 
               style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}>
          </div>
          
          {/* CRT Vignette */}
          <div className="absolute inset-0 pointer-events-none z-20"
               style={{ background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)' }}>
          </div>

          <div className="max-w-lg w-full z-30 relative">
            {bootLines.map((line, index) => (
              line ? (
                <p key={index} className={`mb-2 text-lg md:text-xl opacity-90 text-shadow-glow ${line.color}`}>
                  {line.text}
                </p>
              ) : null
            ))}
            <p className="animate-pulse mt-4 text-green-400">_</p>
            
            <div className="w-full h-4 bg-gray-900 border border-gray-700 mt-8 rounded-sm overflow-hidden relative">
               {/* Grid lines for retro feel */}
               <div className="absolute inset-0 z-10" style={{backgroundImage: 'linear-gradient(90deg, transparent 95%, rgba(0,0,0,0.5) 95%)', backgroundSize: '20px 100%'}}></div>
               
               <div 
                 className={`h-full ${progressColor} transition-all duration-100 ease-linear`} 
                 style={{width: `${repairProgress}%`}}
               ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1 font-mono">
              <span className="uppercase">{currentAction || 'WAITING...'}</span>
              <span>{Math.floor(repairProgress)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
