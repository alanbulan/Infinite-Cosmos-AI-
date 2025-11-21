
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Ring } from '@react-three/drei';
import * as THREE from 'three';

// 一个风格化的黑洞组件
const BlackHole = () => {
  return (
    <group position={[500, 100, -800]} scale={20}>
       {/* 视界核心 */}
       <mesh>
         <sphereGeometry args={[3, 64, 64]} />
         <meshBasicMaterial color="#000000" />
       </mesh>
       {/* 吸积盘 - 辉光 */}
       <mesh rotation={[Math.PI/3, 0, 0]}>
         <ringGeometry args={[3.2, 8, 64]} />
         <meshBasicMaterial color="#ff4400" transparent opacity={0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
       </mesh>
       <mesh rotation={[Math.PI/2.5, 0, 0]}>
         <ringGeometry args={[3.5, 12, 64]} />
         <meshBasicMaterial color="#aa00ff" transparent opacity={0.2} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
       </mesh>
    </group>
  );
};

// 远古巨型结构遗迹 (线框)
const AncientStructure = () => {
    const ref = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.rotation.y = clock.getElapsedTime() * 0.05;
            ref.current.rotation.z = clock.getElapsedTime() * 0.02;
        }
    });

    return (
        <group ref={ref} position={[-600, -200, 500]} scale={40}>
            <mesh>
                <icosahedronGeometry args={[1, 0]} />
                <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.1} />
            </mesh>
            <mesh scale={0.6}>
                <octahedronGeometry args={[1, 0]} />
                <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.15} />
            </mesh>
        </group>
    );
}

export const DeepSpaceDecor: React.FC = () => {
  return (
    <group>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <BlackHole />
      </Float>
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <AncientStructure />
      </Float>
    </group>
  );
};
