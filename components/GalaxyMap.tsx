
import React, { useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { generateIrregularGalaxyPoints } from '../services/galaxyStructure'; 

interface GalaxyMapProps {
  currentSystemId: string;
  knownSystems: string[];
  onSystemSelect: (id: string, position: THREE.Vector3) => void;
}

// 银河系粒子组件
const GalaxyParticles: React.FC<{ 
    onSelect: (id: string, pos: THREE.Vector3) => void; 
    currentSystemId: string;
    knownSystems: string[];
}> = ({ onSelect, currentSystemId, knownSystems }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // 使用新的不规则生成器
  const { positions, colors, sizes, ids } = useMemo(() => {
      return generateIrregularGalaxyPoints(12000, knownSystems);
  }, [knownSystems]);

  const handlePointerMove = (e: any) => {
    e.stopPropagation();
    if (e.index !== undefined) {
      document.body.style.cursor = 'pointer';
      setHoveredIdx(e.index);
    }
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
    setHoveredIdx(null);
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (e.index !== undefined) {
        const id = ids[e.index];
        const pos = new THREE.Vector3(
            positions[e.index * 3],
            positions[e.index * 3 + 1],
            positions[e.index * 3 + 2]
        );
        onSelect(id, pos);
    }
  };

  return (
    <>
      <points 
          ref={pointsRef} 
          onPointerOver={handlePointerMove}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
      >
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial 
          size={2.0} 
          vertexColors 
          transparent 
          opacity={0.9} 
          sizeAttenuation 
          depthWrite={false} 
          blending={THREE.AdditiveBlending} 
        />
      </points>
      
      {/* 悬停时显示信息 */}
      {hoveredIdx !== null && (
        <Html position={[
            positions[hoveredIdx * 3],
            positions[hoveredIdx * 3 + 1] + 5,
            positions[hoveredIdx * 3 + 2]
        ]}>
            <div className="bg-black/80 border border-cyan-500/50 px-3 py-2 rounded text-xs whitespace-nowrap backdrop-blur-md pointer-events-none select-none z-50 shadow-lg shadow-cyan-900/50">
                <div className="text-cyan-300 font-bold mb-0.5">
                     {ids[hoveredIdx] === 'sun' ? '太阳系 (Solar System)' : 
                      knownSystems.includes(ids[hoveredIdx]) ? '已探索星域' : `未知星域 [${ids[hoveredIdx].split('_')[1]}]`}
                </div>
                <div className="text-[10px] text-gray-400">
                    距离核心: {Math.round(Math.sqrt(positions[hoveredIdx*3]**2 + positions[hoveredIdx*3+2]**2))} LY
                </div>
            </div>
        </Html>
      )}
    </>
  );
};

export const GalaxyMap: React.FC<GalaxyMapProps> = ({ currentSystemId, knownSystems, onSystemSelect }) => {
  return (
    <div className="w-full h-screen bg-black relative animate-in fade-in duration-1000">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 tracking-[0.5em] uppercase drop-shadow-lg">
              Galaxy Sector Map
          </h2>
          <p className="text-gray-400 text-xs mt-2 font-mono opacity-70">Deep Field Scan: Active</p>
      </div>

      <Canvas camera={{ position: [0, 400, 500], fov: 55 }}>
        <color attach="background" args={['#020205']} />
        <OrbitControls 
            enablePan={true} 
            maxDistance={1000} 
            minDistance={50} 
            autoRotate 
            autoRotateSpeed={0.3} 
        />
        
        {/* 远景星星 */}
        <Stars radius={800} depth={200} count={10000} factor={6} fade />
        
        <GalaxyParticles 
            onSelect={onSystemSelect} 
            currentSystemId={currentSystemId}
            knownSystems={knownSystems}
        />

        <EffectComposer>
            <Bloom luminanceThreshold={0.15} intensity={1.5} radius={0.6} mipmapBlur />
            <Vignette eskil={false} offset={0.1} darkness={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
