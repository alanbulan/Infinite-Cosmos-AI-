import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, Line, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { CelestialBodyData, CelestialType, SimulationSettings } from '../types';

interface OrbitSystemProps {
  data: CelestialBodyData;
  settings: SimulationSettings;
  onSelect: (body: CelestialBodyData, position: THREE.Vector3) => void;
  selectedId: string | null;
  depth?: number;
}

export const OrbitSystem: React.FC<OrbitSystemProps> = ({ 
  data, 
  settings, 
  onSelect, 
  selectedId,
  depth = 0 
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // 轨道计算
  useFrame(({ clock }) => {
    if (!meshRef.current || !data.orbit || settings.paused) return;

    const t = clock.getElapsedTime() * settings.timeScale * data.orbit.speed + data.orbit.offset;
    const r = data.orbit.radius * settings.orbitScale;

    // 计算新位置
    const x = Math.cos(t) * r;
    const z = Math.sin(t) * r;

    meshRef.current.position.set(x, 0, z);
    
    // 自转
    if (meshRef.current.children[0]) {
       meshRef.current.children[0].rotation.y += data.rotationSpeed;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (meshRef.current) {
      // 获取世界坐标用于摄像机聚焦
      const worldPos = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPos);
      onSelect(data, worldPos);
    }
  };

  const isSelected = selectedId === data.id;
  const showOrbitLine = settings.showOrbits && data.orbit;

  // 动态计算轨道点用于绘制圆环
  const orbitPoints = React.useMemo(() => {
    if (!data.orbit) return null;
    const points = [];
    const r = data.orbit.radius * settings.orbitScale;
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r));
    }
    return points;
  }, [data.orbit, settings.orbitScale]);

  return (
    <group>
      {/* 绘制轨道线 */}
      {showOrbitLine && orbitPoints && (
        <Line 
          points={orbitPoints} 
          color="#ffffff" 
          opacity={0.15} 
          transparent 
          lineWidth={1} 
        />
      )}

      {/* 天体容器 */}
      <group ref={meshRef}>
        {/* 天体网格 */}
        <mesh 
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[data.radius * settings.bodyScale, 32, 32]} />
          <meshStandardMaterial 
            color={data.color} 
            emissive={data.emissive ? data.color : '#000000'}
            emissiveIntensity={data.emissive ? 2 : 0}
            roughness={0.7}
            metalness={0.2}
          />
           {/* 选中或悬停时的光环效果 */}
           {(isSelected || hovered) && (
            <mesh scale={[1.2, 1.2, 1.2]}>
              <sphereGeometry args={[data.radius * settings.bodyScale, 32, 32]} />
              <meshBasicMaterial 
                color="#4fd1c5" 
                transparent 
                opacity={0.2} 
                side={THREE.BackSide}
              />
            </mesh>
          )}
        </mesh>

        {/* 标签 (仅当不被太远遮挡时显示) */}
        <Html distanceFactor={150} position={[0, data.radius * settings.bodyScale + 2, 0]}>
          <div 
            className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-all duration-300 pointer-events-none
              ${isSelected ? 'bg-cyan-500 text-black font-bold scale-110' : 'bg-black/50 text-white'}
              ${!isSelected && !hovered ? 'opacity-70' : 'opacity-100'}
            `}
          >
            {data.name}
          </div>
        </Html>

        {/* 递归渲染子天体 (卫星) */}
        {data.children && data.children.map((child) => (
          <OrbitSystem 
            key={child.id} 
            data={child} 
            settings={settings}
            onSelect={onSelect}
            selectedId={selectedId}
            depth={depth + 1}
          />
        ))}
      </group>
    </group>
  );
};