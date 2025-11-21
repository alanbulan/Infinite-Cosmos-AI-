
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SimulationSettings } from '../types';

interface AsteroidBeltProps {
  count: number;
  minRadius: number;
  maxRadius: number;
  settings: SimulationSettings;
}

export const AsteroidBelt: React.FC<AsteroidBeltProps> = ({ count, minRadius, maxRadius, settings }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 生成陨石带的静态数据，增加颜色随机性
  const { asteroids, colors } = useMemo(() => {
    const temp = [];
    const cols = new Float32Array(count * 3);
    const baseColor = new THREE.Color('#888888');
    const colorVariation = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = THREE.MathUtils.lerp(minRadius, maxRadius, Math.random());
      const y = (Math.random() - 0.5) * 3; // 略微增加垂直散布
      
      const scale = Math.random() * 0.3 + 0.05;
      const rotationSpeed = (Math.random() - 0.5) * 0.05;

      temp.push({ angle, radius, y, scale, rotationSpeed, speedOffset: Math.random() * 0.5 + 0.5 });

      // 随机颜色 (灰、褐、暗红)
      const r = Math.random();
      if (r > 0.8) colorVariation.set('#5a4d41'); // Brownish
      else if (r > 0.6) colorVariation.set('#333333'); // Dark
      else colorVariation.set('#777777'); // Grey
      
      // 混合
      colorVariation.lerp(baseColor, Math.random() * 0.3);
      
      cols[i * 3] = colorVariation.r;
      cols[i * 3 + 1] = colorVariation.g;
      cols[i * 3 + 2] = colorVariation.b;
    }
    return { asteroids: temp, colors: cols };
  }, [count, minRadius, maxRadius]);

  useFrame(({ clock }) => {
    if (!meshRef.current || settings.paused) return;

    const t = clock.getElapsedTime() * settings.timeScale * 0.05;

    asteroids.forEach((data, i) => {
      const { angle, radius, y, scale, rotationSpeed, speedOffset } = data;
      
      const currentAngle = angle + t * (10 / radius) * speedOffset;
      const scaledRadius = radius * settings.orbitScale;
      
      const x = Math.cos(currentAngle) * scaledRadius;
      const z = Math.sin(currentAngle) * scaledRadius;

      dummy.position.set(x, y, z);
      // 添加随机旋转
      dummy.rotation.set(
          data.angle + t * rotationSpeed, 
          t * rotationSpeed, 
          t * rotationSpeed * 0.5
      );
      dummy.scale.set(scale, scale, scale);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* 使用 Icosahedron 看起来更像岩石 */}
      <icosahedronGeometry args={[0.8, 0]}>
          <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
      </icosahedronGeometry>
      <meshStandardMaterial 
        vertexColors
        roughness={0.8} 
        metalness={0.2} 
        flatShading 
      />
    </instancedMesh>
  );
};
