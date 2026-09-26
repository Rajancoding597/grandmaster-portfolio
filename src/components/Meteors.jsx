import { Trail } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const MIN_INTERVAL_MS = 12000;
const MAX_INTERVAL_MS = 28000;

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
        width={1.35}
        length={8}
        decay={1.15}
        stride={0.025}
        attenuation={(width) => width * width}
        color="#7698e6"
      />
      <Trail
        target={headRef}
        width={0.48}
        length={7}
        decay={1.25}
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

    const distance = randomBetween(42, 56);
    const start = camera.position.clone()
      .addScaledVector(forward, distance)
      .addScaledVector(right, randomBetween(8, 14))
      .addScaledVector(up, randomBetween(4.5, 7));
    const end = camera.position.clone()
      .addScaledVector(forward, distance - randomBetween(5, 8))
      .addScaledVector(right, randomBetween(1.5, 5))
      .addScaledVector(up, randomBetween(1, 3));

    meteorIdRef.current += 1;
    return {
      id: meteorIdRef.current,
      start,
      end,
      duration: randomBetween(0.9, 1.3),
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
