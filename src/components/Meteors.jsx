import { Trail } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const MIN_INTERVAL_MS = 16000;
const MAX_INTERVAL_MS = 32000;

const randomBetween = (min, max) => min + Math.random() * (max - min);

function MeteorPass({ meteor, onComplete }) {
  const headRef = useRef();
  const startedAtRef = useRef(null);
  const completedRef = useRef(false);

  useFrame(({ clock }) => {
    if (!headRef.current) return;
    if (startedAtRef.current === null) startedAtRef.current = clock.elapsedTime;

    const progress = THREE.MathUtils.clamp((clock.elapsedTime - startedAtRef.current) / meteor.duration, 0, 1);
    // A subtly accelerated pass feels natural while avoiding a sharp, game-like snap.
    const eased = progress * progress * (3 - 2 * progress);
    headRef.current.position.lerpVectors(meteor.start, meteor.end, eased);

    if (progress >= 1 && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  });

  return (
    <>
      <Trail
        target={headRef}
        width={1.1}
        length={15}
        decay={1}
        stride={0.025}
        attenuation={(width) => width * width}
        color="#7698e6"
      />
      <Trail
        target={headRef}
        width={0.38}
        length={13}
        decay={1}
        stride={0.02}
        attenuation={(width) => width * width}
        color="#fff0bd"
      />
      <group ref={headRef} position={meteor.start} raycast={() => null}>
        <mesh>
          <sphereGeometry args={[0.13, 20, 20]} />
          <meshStandardMaterial
            color="#fff7dd"
            emissive="#ffc864"
            emissiveIntensity={2.8}
            roughness={0.2}
            toneMapped={false}
          />
        </mesh>
        <mesh scale={2.3}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshBasicMaterial color="#8da8ff" transparent opacity={0.08} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </>
  );
}

export default function Meteors({ prefersReducedMotion = false }) {
  const { camera } = useThree();
  const [meteor, setMeteor] = useState(null);
  const timerRef = useRef(null);
  const meteorIdRef = useRef(0);

  const createMeteor = useCallback(() => {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    camera.getWorldDirection(forward);
    right.crossVectors(forward, camera.up).normalize();
    up.crossVectors(right, forward).normalize();

    // Most passes enter from the open right side. Left-side passes are farther
    // away than the moon, so they are naturally occluded rather than cutting
    // across its surface.
    const side = Math.random() < 0.68 ? 1 : -1;
    const distance = randomBetween(48, 62);
    const startHeight = randomBetween(10, 13.5);
    const endHeight = side === 1 ? randomBetween(3.5, 5.5) : randomBetween(6, 8);
    const start = camera.position.clone()
      .addScaledVector(forward, distance)
      .addScaledVector(right, side * randomBetween(20, 27))
      .addScaledVector(up, startHeight);
    const end = camera.position.clone()
      .addScaledVector(forward, distance - randomBetween(8, 12))
      .addScaledVector(right, side * randomBetween(6, 11))
      .addScaledVector(up, endHeight);

    meteorIdRef.current += 1;
    return {
      id: meteorIdRef.current,
      start,
      end,
      duration: randomBetween(2.7, 3.15),
    };
  }, [camera]);

  const scheduleMeteor = useCallback(() => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setMeteor(createMeteor()), randomBetween(MIN_INTERVAL_MS, MAX_INTERVAL_MS));
  }, [createMeteor]);

  const handleComplete = useCallback(() => {
    setMeteor(null);
    scheduleMeteor();
  }, [scheduleMeteor]);

  useEffect(() => {
    if (prefersReducedMotion) {
      window.clearTimeout(timerRef.current);
      setMeteor(null);
      return undefined;
    }

    scheduleMeteor();
    return () => window.clearTimeout(timerRef.current);
  }, [prefersReducedMotion, scheduleMeteor]);

  if (prefersReducedMotion || !meteor) return null;

  return <MeteorPass key={meteor.id} meteor={meteor} onComplete={handleComplete} />;
}
