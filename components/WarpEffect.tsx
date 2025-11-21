
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

// 超空间跃迁特效
export const WarpEffect: React.FC = () => {
  const count = 2000;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = React.useMemo(() => new THREE.Object3D(), []);

  // 初始化星流数据
  const particles = React.useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = Math.random() * 1000; // 深度分布
      const speed = Math.random() * 5 + 2;
      const len = Math.random() * 20 + 5;
      temp.push({ x, y, z, speed, len });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    particles.forEach((particle, i) => {
      // 让粒子向相机冲过来 (Z轴减小)
      particle.z -= particle.speed * 15; 
      if (particle.z < -100) {
        particle.z = 1000; // 循环
        particle.x = (Math.random() - 0.5) * 200;
        particle.y = (Math.random() - 0.5) * 200;
      }

      dummy.position.set(particle.x, particle.y, particle.z);
      // 拉长效果模拟速度感
      dummy.scale.set(1, 1, particle.len); 
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <color attach="background" args={['#000000']} />
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[0.2, 0.2, 1]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </instancedMesh>

      {/* 强烈的模糊和发光效果模拟速度线 */}
      <EffectComposer>
        <Bloom intensity={2} luminanceThreshold={0} radius={0.8} />
        <Vignette offset={0.1} darkness={0.5} />
      </EffectComposer>
    </>
  );
};
