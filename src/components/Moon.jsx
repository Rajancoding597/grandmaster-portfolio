import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const MOON_MAPS = [
  `${import.meta.env.BASE_URL}textures/moon/lroc-color-2k.jpg`,
  `${import.meta.env.BASE_URL}textures/moon/lola-elevation-1k.jpg`,
];
useTexture.preload(MOON_MAPS);

// A soft lunar terminator keeps the surface dimensional under the board's
// studio fill lights. Use the perturbed normal so the real terrain catches light.
function lunarLighting(shader) {
  shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
    float phase = smoothstep(-0.2, 0.75, dot(normal, normalize(vec3(0.9, 0.3, 0.45))));
    outgoingLight *= mix(0.12, 0.85, phase);
    #include <opaque_fragment>
  `);
}

export default function Moon() {
  const [colorMap, elevationMap] = useTexture(MOON_MAPS);
  colorMap.colorSpace = THREE.SRGBColorSpace;

  return (
    // This stays in scene space rather than following the camera, so it has
    // real parallax as the board and camera rotate together. It is deliberately
    // deep in the background; the larger scale preserves the cropped silhouette.
    <group name="lunar-background" position={[-10.5, -0.75, -20.95]} scale={12.3}>
      <mesh rotation={[0.05, Math.PI * 0.5, -0.25]} raycast={() => null} castShadow>
        <sphereGeometry args={[1, 96, 64]} />
        <meshStandardMaterial map={colorMap} bumpMap={elevationMap} bumpScale={0.025}
          color="#b8bec8" metalness={0} roughness={1} envMapIntensity={0.15}
          onBeforeCompile={lunarLighting} />
      </mesh>
      <mesh scale={1.02} raycast={() => null}>
        <sphereGeometry args={[1, 64, 48]} />
        <meshBasicMaterial color="#b7c8e2" side={THREE.BackSide} transparent opacity={0.025} depthWrite={false} />
      </mesh>
    </group>
  );
}
