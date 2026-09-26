import { Sparkles, Stars, useTexture } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';

const DEEP_STAR_MAP = `${import.meta.env.BASE_URL}textures/space/nasa-deep-star-map-4k.jpg`;

useTexture.preload(DEEP_STAR_MAP);

export default function SpaceBackdrop({ prefersReducedMotion = false }) {
  const deepStarMap = useTexture(DEEP_STAR_MAP);
  deepStarMap.colorSpace = THREE.SRGBColorSpace;
  deepStarMap.anisotropy = 8;

  const driftSpeed = prefersReducedMotion ? 0 : 0.12;

  return (
    <>
      {/* A real celestial map is deliberately dim: it creates structure in the
          void without competing with the board, moon, or opening title. */}
      <mesh rotation={[0.12, -0.75, 0]} renderOrder={-10} raycast={() => null}>
        <sphereGeometry args={[145, 96, 64]} />
        <meshBasicMaterial
          map={deepStarMap}
          color="#b2c0e8"
          side={THREE.BackSide}
          transparent
          opacity={0.28}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Layered stars add distinct far and mid-distance depth cues. */}
      <Stars radius={132} depth={64} count={5200} factor={1.35} saturation={0.18} fade speed={prefersReducedMotion ? 0 : 0.12} />
      <Stars radius={58} depth={28} count={1700} factor={2.1} saturation={0.08} fade speed={prefersReducedMotion ? 0 : 0.28} />

      {/* Sparse dust is kept close to the chessboard, providing parallax
          without making the field look like a game particle effect. */}
      <Sparkles
        count={70}
        position={[0, 1.75, -1]}
        scale={[15, 8, 15]}
        size={1.15}
        speed={driftSpeed}
        noise={[0.04, 0.025, 0.04]}
        opacity={0.32}
        color="#d4af37"
      />
      <Sparkles
        count={45}
        position={[0, 2.3, -3]}
        scale={[18, 10, 18]}
        size={0.7}
        speed={prefersReducedMotion ? 0 : 0.08}
        noise={[0.02, 0.018, 0.02]}
        opacity={0.22}
        color="#b9c8f0"
      />
    </>
  );
}

export function SpaceFinish() {
  return (
    <EffectComposer multisampling={8} frameBufferType={THREE.HalfFloatType}>
      <Bloom luminanceThreshold={1.15} intensity={0.2} radius={0.55} mipmapBlur />
      <Vignette eskil={false} offset={0.24} darkness={0.35} blendFunction={BlendFunction.NORMAL} />
      <Noise opacity={0.012} blendFunction={BlendFunction.SOFT_LIGHT} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} middleGrey={0.78} />
    </EffectComposer>
  );
}
