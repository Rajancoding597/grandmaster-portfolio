import React, { Suspense, useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Lightformer, useGLTF, useProgress } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Chess } from 'chess.js';
import * as THREE from 'three';
import { getRandomGame, getRandomPuzzle, getInteractionMode } from '../utils/interactionModes';
import { MODEL_URLS, PIECE_MODELS, snapshotBoard } from '../utils/chessModels';
import ChessPieceModel from './ChessPieceModel';
import ChessBoardFrame from './ChessBoardFrame';
import Moon from './Moon';
import SpaceBackdrop, { SpaceFinish } from './SpaceBackdrop';
import Meteors from './Meteors';

export const REVEAL = {
  duration: 3600,
  cameraStart: 550,
  cameraEnd: 2150,
  sceneFadeStart: 1650,
  sceneFadeEnd: 3500,
  heroStart: 2150,
  heroEnd: 3300,
  gridStart: 1800,
  gridEnd: 3200,
};

const easeInOut = (progress) => {
  const t = THREE.MathUtils.clamp(progress, 0, 1);
  return t * t * (3 - 2 * t);
};

const INTRO_HOLD_DURATION = 3000;
const INTRO_FADE_DURATION = 900;
const OPENING_REVEAL_DURATION = 900;

// Load every type together, including pieces absent from the initial puzzle.
useGLTF.preload(MODEL_URLS);

class SceneErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) {
    console.error('Chess scene unavailable:', error);
    this.props.onFailed?.();
  }
  render() {
    if (this.state.failed) return (
      <div role="status" className="absolute inset-0 flex items-center justify-center px-6 text-center text-neutral-300">
        The chess scene could not load. You can still skip to the portfolio.
      </div>
    );
    return this.props.children;
  }
}

function OpeningLoader({ visible }) {
  const { progress } = useProgress();
  const displayedProgress = visible ? Math.min(98, Math.max(6, Math.round(progress))) : 100;

  return (
    <div
      aria-live="polite"
      aria-busy={visible}
      className={`absolute inset-0 z-[60] flex items-center justify-center bg-[#050505] transition-opacity duration-500 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      <div className="w-52 text-center sm:w-60">
        <div className="mx-auto mb-5 h-9 w-9 rounded-full border border-gold-500/30 border-t-gold-500 animate-spin" />
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold-500">Preparing the opening</p>
        <div className="mt-4 h-px overflow-hidden bg-white/10">
          <div className="h-full bg-gold-500 transition-[width] duration-300 ease-out" style={{ width: `${displayedProgress}%` }} />
        </div>
      </div>
    </div>
  );
}

// Board Square
function BoardSquare({ x, z, isLight, onClick, isHighlighted, isLegal }) {
  return (
    <group>
    <mesh
      position={[x, 0, z]} // y=0 is the top surface of the board
      receiveShadow
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <boxGeometry args={[1, 0.2, 1]} /> {/* Slightly thicker board, 1x1 squares */}
      <meshStandardMaterial
        color={isLight ? '#c9b899' : '#35271f'}
        metalness={0.0}
        roughness={0.48}
        emissive={isHighlighted ? '#d4af37' : '#000000'}
        emissiveIntensity={isHighlighted ? 0.25 : 0}
      />
    </mesh>
    {isLegal && (
      <mesh position={[x, 0.112, z]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <circleGeometry args={[0.12, 32]} />
        <meshBasicMaterial color="#f3d773" transparent opacity={0.85} depthWrite={false} />
      </mesh>
    )}
    </group>
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

function CameraReveal({ revealStartedAt, isMobile, prefersReducedMotion }) {
  const { camera } = useThree();
  const initialPosition = useRef(new THREE.Vector3());
  const initialTarget = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());
  const capturedStart = useRef(false);
  const targetPosition = useMemo(
    () => new THREE.Vector3(...(isMobile ? [0, 20, 26] : [0, 17, 20])),
    [isMobile]
  );
  const targetLookAt = useMemo(() => new THREE.Vector3(0, -1.5, 0), []);

  useFrame(() => {
    if (revealStartedAt === null || prefersReducedMotion) {
      return;
    }

    if (!capturedStart.current) {
      capturedStart.current = true;
      initialPosition.current.copy(camera.position);
      camera.getWorldDirection(initialTarget.current);
      initialTarget.current.multiplyScalar(10).add(camera.position);
    }

    const elapsed = performance.now() - revealStartedAt;
    const eased = easeInOut((elapsed - REVEAL.cameraStart) / (REVEAL.cameraEnd - REVEAL.cameraStart));
    camera.position.lerpVectors(initialPosition.current, targetPosition, eased);
    lookAt.current.lerpVectors(initialTarget.current, targetLookAt, eased);
    camera.lookAt(lookAt.current);
  }, -0.5);

  return null;
}

function ChessScene({ onRevealRequest, onReady, onStatus, onBoardInteract, mode = 'click', revealStartedAt = null, prefersReducedMotion = false }) {
  const loadedModels = useGLTF(MODEL_URLS);
  const models = Object.fromEntries(Object.keys(PIECE_MODELS).map((type, index) => [type, loadedModels[index].scene]));
  const undoTimer = useRef(null);
  const [isUndoPending, setIsUndoPending] = useState(false);
  useEffect(() => { onReady(); }, [onReady]);
  useEffect(() => () => window.clearTimeout(undoTimer.current), []);
  useEffect(() => {
    if (revealStartedAt !== null) window.clearTimeout(undoTimer.current);
  }, [revealStartedAt]);
  const groupRef = useRef();
  const [hoveredPiece, setHoveredPiece] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [lastMoveTarget, setLastMoveTarget] = useState(null);
  const startingRotation = useRef(null);
  const isRevealing = revealStartedAt !== null;
  
  const chess = useMemo(() => new Chess(), []);
  const [board, setBoard] = useState(() => snapshotBoard(chess));
  const [gameData, setGameData] = useState(null);
  const [puzzleData, setPuzzleData] = useState(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [message, setMessage] = useState('');
  useEffect(() => {
    onStatus(message || (mode === 'autoplay' ? gameData?.name : mode === 'puzzle' ? puzzleData?.hint : 'Select a piece, then choose a highlighted square.'));
  }, [message, mode, gameData, puzzleData, onStatus]);

  // Initialize
  useEffect(() => {
    chess.reset();
    setBoard(snapshotBoard(chess));
    setGameData(null);
    setPuzzleData(null);
    setSelectedSquare(null);
    setLastMoveTarget(null);
    setMessage('');

    if (mode === 'autoplay') {
      const randomGame = getRandomGame();
      setGameData(randomGame);
      setMoveIndex(0);
    } else if (mode === 'puzzle') {
      const puzzle = getRandomPuzzle();
      setPuzzleData(puzzle);
      chess.load(puzzle.fen);
      setBoard(snapshotBoard(chess));
      setMessage(puzzle.hint);
    }
  }, [mode, chess]);

  // Auto-play
  useEffect(() => {
    if (mode === 'autoplay' && gameData && !isRevealing) {
      if (moveIndex < gameData.moves.length) {
        const timer = setTimeout(() => {
          try {
            const move = gameData.moves[moveIndex];
            const result = chess.move(move);
            setBoard((previous) => snapshotBoard(chess, previous, result));
            setLastMoveTarget(result?.to ?? null);
            setMoveIndex(prev => prev + 1);
          } catch (e) {
            console.error("Invalid move:", e);
          }
        }, 1500); // Slower moves for better viewing
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => onRevealRequest({ hasMove: true }), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [mode, gameData, moveIndex, chess, onRevealRequest, isRevealing]);

  // Interaction
  const handleSquareClick = (rowIndex, colIndex) => {
    if (mode === 'autoplay' || isRevealing || isUndoPending) return;

    onBoardInteract?.();

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
          setBoard(snapshotBoard(chess, board, result));
          setHoveredPiece(null);
          setSelectedSquare(null);
          setLastMoveTarget(result.to);
          
          if (mode === 'puzzle') {
            // Puzzle Logic
            if (puzzleData.solution && move.from === puzzleData.solution.from && move.to === puzzleData.solution.to) {
              onRevealRequest({ hasMove: true });
            } else {
              setIsUndoPending(true);
              undoTimer.current = window.setTimeout(() => {
                chess.undo();
                setBoard(board);
                setIsUndoPending(false);
                setLastMoveTarget(null);
                setMessage("Try again!");
              }, 800);
            }
          } else {
            onRevealRequest({ hasMove: true });
          }
        } else {
            setMessage("That move is not legal. Try another square.");
            setSelectedSquare(null);
        }
      } catch (e) {
        setMessage("That move is not legal. Try another square.");
        setSelectedSquare(null);
      }
    }
  };

  useFrame((state) => {
    if (groupRef.current) {
      if (isRevealing) {
        const elapsed = performance.now() - revealStartedAt;
        if (startingRotation.current === null) startingRotation.current = groupRef.current.rotation.y;
        const drift = prefersReducedMotion ? 0 : easeInOut((elapsed - REVEAL.cameraStart) / (REVEAL.cameraEnd - REVEAL.cameraStart));
        groupRef.current.rotation.y = startingRotation.current + drift * 0.22;
        groupRef.current.scale.setScalar(1 - drift * 0.1);

        // Fade the composited Canvas in CSS, keeping depth and shadow rendering
        // intact. Per-material transparency made overlapping board layers sort
        // differently on the near/far halves during the final camera movement.
        return;
      }

      const rotationSpeed = prefersReducedMotion ? 0 : mode === 'autoplay' ? 0.2 : 0.05;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * rotationSpeed;
    }
  });

  const legalTargets = new Set(selectedSquare && !isRevealing && !isUndoPending
    ? chess.moves({ square: selectedSquare, verbose: true }).map((move) => move.to) : []);
  const boardSquares = (() => {
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
            isLegal={legalTargets.has(squareName)}
            isHighlighted={selectedSquare === squareName || lastMoveTarget === squareName}
            onClick={() => handleSquareClick(row, col)}
          />
        );
      }
    }
    return squares;
  })();

  const pieces = useMemo(() => {
    const p = [];
    board.forEach((row, rowIndex) => {
      row.forEach((square, colIndex) => {
        if (square) {
          const squareName = getSquareFromIndex(rowIndex, colIndex);
          p.push({
            ...square,
            position: getPositionFromIndex(rowIndex, colIndex),
            key: square.id,
            squareName
          });
        }
      });
    });
    return p;
  }, [board]);


  return (
    <group ref={groupRef} position={[0, -1.5, 0]}> {/* Moved board down */}
      <group>
      <ChessBoardFrame />
      
      {boardSquares}

      {pieces.map((piece) => (
        <ChessPieceModel
          key={piece.key}
          position={piece.position}
          scene={models[piece.type]}
          color={piece.color}
          isSelected={selectedSquare === piece.squareName}
          isLastMove={lastMoveTarget === piece.squareName}
          disabled={isRevealing || isUndoPending}
          prefersReducedMotion={prefersReducedMotion}
          onClick={() => {
             const col = Math.round(piece.position[0] + 3.5);
             const row = Math.round(piece.position[2] + 3.5);
             handleSquareClick(row, col);
          }}
          isHovered={hoveredPiece === piece.key}
          onPointerOver={() => setHoveredPiece(piece.key)}
          onPointerOut={() => setHoveredPiece(null)}
        />
      ))}
      </group>


    </group>
  );
}


export default function ChessBoard3D({ onGameStart, onRevealStart }) {
  const [mode, setMode] = useState('click');
  const [sceneReady, setSceneReady] = useState(false);
  const [isOpeningReady, setIsOpeningReady] = useState(false);
  const [status, setStatus] = useState('');
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isSkipReveal, setIsSkipReveal] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [isIntroVisible, setIsIntroVisible] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [isIntroDocked, setIsIntroDocked] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [revealStartedAt, setRevealStartedAt] = useState(null);
  const revealStartedRef = useRef(false);
  const completionTimerRef = useRef(null);
  const openingReadyRef = useRef(false);
  const openingFrameRef = useRef(null);
  const dockIntro = useCallback(() => setIsIntroDocked(true), []);
  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
    if (openingReadyRef.current) return;

    openingReadyRef.current = true;
    openingFrameRef.current = window.requestAnimationFrame(() => {
      openingFrameRef.current = window.requestAnimationFrame(() => setIsOpeningReady(true));
    });
  }, []);

  const handleRevealRequest = useCallback(({ hasMove = false } = {}) => {
    if (revealStartedRef.current) return;

    revealStartedRef.current = true;
    const startedAt = performance.now();
    setRevealStartedAt(startedAt);
    setIsRevealing(true);
    setIsSkipReveal(!hasMove);
    onRevealStart?.(startedAt);
    completionTimerRef.current = window.setTimeout(
      onGameStart,
      prefersReducedMotion ? 300 : REVEAL.duration
    );
  }, [onGameStart, onRevealStart, prefersReducedMotion]);

  useEffect(() => () => {
    window.clearTimeout(completionTimerRef.current);
    window.cancelAnimationFrame(openingFrameRef.current);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsIntroVisible(true);
      return undefined;
    }

    if (!isOpeningReady) {
      setIsIntroVisible(false);
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => setIsIntroVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [isOpeningReady, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsIntroDocked(true);
      return undefined;
    }

    if (!sceneReady || !isOpeningReady) {
      setIsIntroDocked(false);
      return undefined;
    }

    setIsIntroDocked(false);
    const timer = window.setTimeout(dockIntro, INTRO_FADE_DURATION + INTRO_HOLD_DURATION);
    return () => window.clearTimeout(timer);
  }, [dockIntro, isOpeningReady, prefersReducedMotion, sceneReady]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);
  
  useEffect(() => {
    // Use random interaction mode instead of hardcoded mode
    const randomMode = getInteractionMode();
    setMode(randomMode);
    
    // Detect mobile device for camera adjustment
    const checkMobile = () => {
      setViewportWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Responsive camera settings
  // Deliberate opening composition: the white side is close to the viewer and
  // the board runs diagonally beneath the title, as in the portfolio artwork.
  const cameraPosition = isMobile ? [-9, 13, 11] : [-10.5, 12, 10.5];
  const cameraFov = isMobile ? 60 : 45;
  const introWidth = Math.min(viewportWidth - 32, 896);
  const introSideInset = isMobile ? 16 : 32;
  const compactTitleWidth = isMobile ? 160 : 200;
  const introDockX = (viewportWidth / 2) - introSideInset - (compactTitleWidth / 2) - (introWidth / 2);
  const motionDuration = prefersReducedMotion ? 0 : 1.8;
  const sceneVisibility = isRevealing ? 'opacity-0 pointer-events-none' : isOpeningReady ? 'opacity-100' : 'opacity-0 pointer-events-none';
  const sceneFadeDuration = isRevealing
    ? (prefersReducedMotion ? '300ms' : `${REVEAL.sceneFadeEnd - REVEAL.sceneFadeStart}ms`)
    : `${OPENING_REVEAL_DURATION}ms`;
  const sceneFadeDelay = isRevealing && !prefersReducedMotion ? `${REVEAL.sceneFadeStart}ms` : '0ms';

  return (
    <div className="w-full h-full min-h-screen relative bg-transparent overflow-hidden">
      <div
        className={`w-full h-full bg-[#050505] transition-opacity ease-in-out ${sceneVisibility}`}
        style={{
          transitionDelay: sceneFadeDelay,
          transitionDuration: sceneFadeDuration,
        }}
      >
      <SceneErrorBoundary onFailed={() => setIsOpeningReady(true)}>
      <Canvas
        shadows
        dpr={1.75}
        gl={{ antialias: false, toneMapping: THREE.NoToneMapping }}
        fallback={<div role="status" className="p-8 text-center text-neutral-300">The chess scene is unavailable. Skip to explore the portfolio.</div>}
        camera={{ position: cameraPosition, fov: cameraFov }}
      >
        <Suspense fallback={null}>
        <color attach="background" args={['#050505']} />
        
        <SpaceBackdrop prefersReducedMotion={prefersReducedMotion} />

        <Moon />
        <Meteors prefersReducedMotion={prefersReducedMotion} />

        {/* Main ambient light */}
        <ambientLight intensity={0.8} /> 
        
        {/* Sun-like directional light (creates shadows on moon) */}
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.35}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
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
        <directionalLight position={[-5, 8, -5]} intensity={1.2} color="#dce5ff" />
        
        {/* Local studio environment: no external HDR request can delay the pieces. */}
        <Environment resolution={256} frames={1}>
          <Lightformer position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 10, 1]} intensity={2} />
          <Lightformer position={[-5, 2, 1]} rotation={[0, Math.PI / 2, 0]} scale={[3, 8, 1]} intensity={3} color="#fff0d6" />
          <Lightformer position={[5, 3, -2]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 8, 1]} intensity={2} color="#dce5ff" />
        </Environment>
        <CameraReveal
          revealStartedAt={revealStartedAt}
          isMobile={isMobile}
          prefersReducedMotion={prefersReducedMotion}
        />
        <ChessScene
          onRevealRequest={handleRevealRequest}
          onBoardInteract={dockIntro}
          mode={mode}
          onReady={handleSceneReady}
          onStatus={setStatus}
          prefersReducedMotion={prefersReducedMotion}
          revealStartedAt={revealStartedAt}
        />
        
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          target={[0, 1.5, 0]}
          enabled={sceneReady && isOpeningReady && !isRevealing}
          onStart={dockIntro}
          autoRotate={mode === 'autoplay' && !isRevealing && !prefersReducedMotion}
          autoRotateSpeed={0.5}
        />
        <SpaceFinish />
        </Suspense>
      </Canvas>
      </SceneErrorBoundary>

      <motion.div
        initial={false}
        className="absolute z-20 overflow-visible pointer-events-none text-center will-change-transform"
        style={{
          width: introWidth,
          left: '50%',
          top: isMobile ? '2rem' : '2.5rem',
        }}
        animate={{
          x: isIntroDocked ? introDockX : -(introWidth / 2),
          y: isIntroDocked ? -16 : 0,
        }}
        transition={{ duration: motionDuration, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.div
          initial={false}
          className="origin-top"
          animate={{
            opacity: isIntroVisible ? 1 : 0,
            y: isIntroVisible ? 0 : 8,
            scale: isIntroDocked ? (isMobile ? 0.42 : 0.34) : 1,
          }}
          transition={{
            opacity: { duration: prefersReducedMotion ? 0 : INTRO_FADE_DURATION / 1000, ease: 'easeOut' },
            y: { duration: prefersReducedMotion ? 0 : INTRO_FADE_DURATION / 1000, ease: 'easeOut' },
            scale: { duration: motionDuration, ease: [0.25, 0.1, 0.25, 1] },
          }}
        >
          <p className={`overflow-hidden text-[10px] font-mono uppercase tracking-[0.3em] text-gold-500/80 transition-[opacity,max-height,margin] duration-[900ms] ease-in-out motion-reduce:transition-none md:text-xs ${isIntroDocked ? 'mb-0 max-h-0 opacity-0' : 'mb-3 max-h-6 opacity-100'}`}>The opening move</p>
          <h2
            className="mx-auto whitespace-nowrap bg-gradient-to-b from-white via-neutral-100 to-[#ead38b] bg-clip-text font-serif text-[clamp(2.45rem,4.25vw,3.85rem)] font-semibold leading-none tracking-[-0.05em] text-transparent drop-shadow-[0_5px_20px_rgba(212,175,55,0.14)]"
          >
            Rajan <span className="italic">Dhiman</span>
          </h2>
          <p className={`overflow-hidden text-xs font-medium tracking-[0.08em] text-neutral-300 transition-[opacity,max-height,margin] duration-[900ms] ease-in-out motion-reduce:transition-none md:text-sm ${isIntroDocked ? 'mt-0 max-h-0 opacity-0' : 'mt-3 max-h-6 opacity-100'}`}>Welcome to my portfolio.</p>
        </motion.div>
      </motion.div>

      {isSkipReveal && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-40 pointer-events-none bg-gold-500/10 chess-reveal-pulse"
        />
      )}
      
      {/* Fixed Bottom-Right Skip Button - Responsive */}
      <div className={`absolute bottom-6 right-1/2 translate-x-1/2 md:translate-x-0 md:right-8 md:bottom-8 z-50 transition-[opacity,transform] duration-500 delay-[250ms] ${isOpeningReady ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={() => handleRevealRequest()}
          disabled={isRevealing}
          className={`px-4 py-2 md:px-6 md:py-3 bg-neutral-900/80 hover:bg-gold-500/20 text-gold-500 border border-gold-500/50 rounded-full backdrop-blur-md transition-all duration-300 flex items-center gap-2 group shadow-2xl text-sm md:text-base ${isRevealing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <span className="font-mono font-medium tracking-wider whitespace-nowrap">SKIP TO PORTFOLIO</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
      
      <div className={`absolute bottom-24 md:bottom-8 left-4 md:left-8 right-4 md:right-auto md:max-w-sm text-center md:text-left pointer-events-none transition-opacity duration-500 delay-[250ms] ${isOpeningReady ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-[10px] tracking-[0.2em] uppercase font-mono text-gold-500 mb-2">
          {mode === 'autoplay' ? 'Famous game replay' : mode === 'puzzle' ? 'Tactical challenge' : 'Your move'}
        </p>
        <p role="status" aria-live="polite" className="text-neutral-300 text-xs md:text-sm">
          {sceneReady ? status : 'Setting the board…'}
        </p>
      </div>
      </div>
      <OpeningLoader visible={!isOpeningReady} />
    </div>
  );
}
