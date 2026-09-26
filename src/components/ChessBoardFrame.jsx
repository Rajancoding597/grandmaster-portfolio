import { RoundedBox } from '@react-three/drei';

export default function ChessBoardFrame() {
  return (
    <group>
      <RoundedBox args={[9.12, 0.36, 9.12]} radius={0.1} smoothness={6} position={[0, -0.27, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#211b18" roughness={0.38} metalness={0} />
      </RoundedBox>
      <RoundedBox args={[9.02, 0.055, 9.02]} radius={0.05} smoothness={6} position={[0, -0.095, 0]} receiveShadow>
        <meshStandardMaterial color="#937347" roughness={0.34} metalness={0.65} />
      </RoundedBox>
      <RoundedBox args={[8.94, 0.13, 8.94]} radius={0.055} smoothness={6} position={[0, -0.015, 0]} receiveShadow>
        <meshStandardMaterial color="#35281f" roughness={0.4} metalness={0} />
      </RoundedBox>
      {/* Fine brass inlay surrounds the playing surface without a bulky rim. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 4.075, 0.052, 0]}>
            <boxGeometry args={[0.018, 0.008, 8.16]} />
            <meshStandardMaterial color="#b59860" metalness={0.65} roughness={0.34} />
          </mesh>
          <mesh position={[0, 0.052, side * 4.075]}>
            <boxGeometry args={[8.16, 0.008, 0.018]} />
            <meshStandardMaterial color="#b59860" metalness={0.65} roughness={0.34} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
