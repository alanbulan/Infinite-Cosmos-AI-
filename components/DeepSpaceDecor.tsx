import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, Billboard } from '@react-three/drei';
import * as THREE from 'three';

// 优化后的黑洞：更深邃，吸积盘更细腻
const BlackHole = () => {
  const diskRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (diskRef.current) {
      diskRef.current.rotation.z += 0.002; // 缓慢旋转
    }
  });

  return (
    <group position={[800, 200, -1500]} scale={50}>
      {/* 视界 (Event Horizon) - 纯黑核心，吞噬光线 */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 光子环 (Photon Ring) - 紧贴视界的极亮光圈 */}
      <mesh>
        <ringGeometry args={[2.05, 2.15, 64]} />
        <meshBasicMaterial 
            color="#ffffff" 
            side={THREE.DoubleSide} 
            transparent 
            opacity={0.8} 
            blending={THREE.AdditiveBlending} 
        />
      </mesh>
       {/* 垂直光子环 */}
       <mesh rotation={[Math.PI/2, 0, 0]}>
        <ringGeometry args={[2.05, 2.15, 64]} />
        <meshBasicMaterial 
            color="#ffffff" 
            side={THREE.DoubleSide} 
            transparent 
            opacity={0.3} 
            blending={THREE.AdditiveBlending} 
        />
      </mesh>

      {/* 吸积盘 (Accretion Disk) - 多层渐变光环 */}
      <group ref={diskRef} rotation={[Math.PI / 3, 0, 0]}>
        {/* 内部高热区 (橙/白) */}
        <mesh>
            <ringGeometry args={[2.2, 4, 64]} />
            <meshBasicMaterial 
                color="#ffaa00" 
                side={THREE.DoubleSide} 
                transparent 
                opacity={0.5} 
                blending={THREE.AdditiveBlending} 
            />
        </mesh>
        {/* 中部过渡区 (红/橙) */}
        <mesh position={[0,0, -0.01]}>
            <ringGeometry args={[3.5, 6, 64]} />
            <meshBasicMaterial 
                color="#ff4400" 
                side={THREE.DoubleSide} 
                transparent 
                opacity={0.3} 
                blending={THREE.AdditiveBlending} 
            />
        </mesh>
        {/* 外部冷区 (紫/暗红) */}
        <mesh position={[0,0, 0.01]}>
            <ringGeometry args={[5.5, 10, 64]} />
            <meshBasicMaterial 
                color="#8800ff" 
                side={THREE.DoubleSide} 
                transparent 
                opacity={0.15} 
                blending={THREE.AdditiveBlending} 
            />
        </mesh>
      </group>
      
      {/* 引力透镜辉光 (Billboard 始终朝向相机) */}
       <Billboard follow={true}>
          <mesh>
             <circleGeometry args={[15, 32]} />
             <meshBasicMaterial 
                color="#ffaa00" 
                transparent 
                opacity={0.03} 
                blending={THREE.AdditiveBlending} 
                depthWrite={false}
             />
          </mesh>
       </Billboard>
    </group>
  );
};

// 替换原有的线框遗迹，改为"维度裂隙" (Dimensional Rift)
const DimensionalRift = () => {
    const ref = useRef<THREE.Group>(null);
    
    useFrame(({ clock }) => {
        if (ref.current) {
            // 混沌旋转
            ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.3;
            ref.current.rotation.y += 0.005;
            ref.current.rotation.z = Math.cos(clock.getElapsedTime() * 0.15) * 0.1;
        }
    });

    return (
        <group position={[-1000, -300, -800]} scale={30}>
            <group ref={ref}>
                {/* 核心异常点 */}
                <mesh>
                    <octahedronGeometry args={[2, 0]} />
                    <meshPhysicalMaterial 
                        color="#00ffff" 
                        emissive="#0088ff"
                        emissiveIntensity={1.5}
                        roughness={0.1}
                        metalness={0.9}
                        transparent
                        opacity={0.9}
                    />
                </mesh>
                
                {/* 外部能量壳 */}
                <mesh scale={1.4} rotation={[0.5, 0.5, 0]}>
                    <dodecahedronGeometry args={[2, 0]} />
                    <meshBasicMaterial 
                        color="#00ffff" 
                        wireframe 
                        transparent 
                        opacity={0.05} 
                        blending={THREE.AdditiveBlending} 
                    />
                </mesh>

                {/* 漂浮的能量碎片 */}
                <Sparkles count={60} scale={10} size={6} speed={0.2} opacity={0.6} color="#aaddff" />
            </group>
            
            {/* 远距离辉光 */}
             <Billboard follow={true}>
                <mesh scale={3}>
                    <circleGeometry args={[5, 32]} />
                    <meshBasicMaterial 
                        color="#0044ff" 
                        transparent 
                        opacity={0.05} 
                        blending={THREE.AdditiveBlending} 
                        depthWrite={false} 
                    />
                </mesh>
            </Billboard>
        </group>
    );
}

export const DeepSpaceDecor: React.FC = () => {
  return (
    <group>
      <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.2}>
        <BlackHole />
      </Float>
      <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.3}>
        <DimensionalRift />
      </Float>
    </group>
  );
};