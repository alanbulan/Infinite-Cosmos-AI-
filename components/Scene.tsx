
import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import * as THREE from 'three';
import { OrbitSystem } from './OrbitSystem';
import { AsteroidBelt } from './AsteroidBelt';
import { CosmicBackground } from './CosmicBackground'; 
import { CometSystem } from './CometSystem'; 
import { DeepSpaceDecor } from './DeepSpaceDecor'; // New import
import { CelestialBodyData, SimulationSettings } from '../types';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';

interface SceneProps {
  universeData: CelestialBodyData;
  settings: SimulationSettings;
  selectedBody: CelestialBodyData | null;
  onBodySelect: (body: CelestialBodyData) => void;
  viewMode: 'focus' | 'galaxy'; 
}

const CameraManager: React.FC<{ 
    targetPos: THREE.Vector3 | null; 
    focusing: boolean; 
    viewMode: 'focus' | 'galaxy';
}> = ({ targetPos, focusing, viewMode }) => {
  const controlsRef = useRef<CameraControls>(null);
  
  useEffect(() => {
    if (!controlsRef.current) return;

    if (viewMode === 'galaxy') {
        controlsRef.current.setLookAt(
            0, 350, 250, 
            0, 0, 0,     
            true         
        );
    } else if (targetPos && focusing) {
      const offset = new THREE.Vector3(12, 12, 12);
      controlsRef.current.setLookAt(
        targetPos.x + offset.x, targetPos.y + offset.y, targetPos.z + offset.z,
        targetPos.x, targetPos.y, targetPos.z,
        true
      );
    }
  }, [targetPos, focusing, viewMode]);

  return <CameraControls ref={controlsRef} makeDefault minDistance={5} maxDistance={3000} />;
};


export const Scene: React.FC<SceneProps> = ({ universeData, settings, selectedBody, onBodySelect, viewMode }) => {
  const [focusPos, setFocusPos] = React.useState<THREE.Vector3 | null>(null);

  const handleSelect = (body: CelestialBodyData, pos: THREE.Vector3) => {
    setFocusPos(pos);
    onBodySelect(body);
  };

  // 根据画质设置调整参数
  const isHighQuality = settings.quality === 'HIGH';
  const isLowQuality = settings.quality === 'LOW';

  return (
    <div className="w-full h-screen bg-black">
      <Canvas 
        camera={{ position: [0, 200, 300], fov: 40 }} 
        dpr={isHighQuality ? [1, 2] : [1, 1]} 
        gl={{ antialias: isHighQuality }}
        performance={{ min: 0.5 }}
      >
        <color attach="background" args={['#010103']} />
        
        {/* 环境光源 */}
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 0, 0]} intensity={3} color={universeData.color || "#ffaa55"} distance={2000} decay={0.5} />
        
        {/* 宇宙背景 (星云 + 尘埃 + 星星) */}
        <CosmicBackground starColor={universeData.color} />
        
        {/* 动态彗星与流星系统 - 低画质下减少计算 */}
        {!isLowQuality && <CometSystem />}
        
        {/* 新增：深空装饰物 (黑洞、遗迹) */}
        <DeepSpaceDecor />
        
        {/* 太阳系核心 */}
        <OrbitSystem 
          data={universeData} 
          settings={settings}
          onSelect={handleSelect}
          selectedId={selectedBody?.id || null}
        />

        {/* 动态陨石带 */}
        {universeData.asteroidBelt && (
           <AsteroidBelt 
              count={isLowQuality ? 300 : (universeData.asteroidBelt.count || 1000)} 
              minRadius={universeData.asteroidBelt.minRadius} 
              maxRadius={universeData.asteroidBelt.maxRadius} 
              settings={settings} 
           />
        )}

        <CameraManager 
            targetPos={focusPos} 
            focusing={!!selectedBody} 
            viewMode={viewMode}
        />

        {/* 后处理特效 - 低画质下完全关闭 */}
        {!isLowQuality && (
          <EffectComposer enableNormalPass={false} multisampling={isHighQuality ? 4 : 0}>
            <Bloom 
                luminanceThreshold={0.85} 
                mipmapBlur 
                intensity={isHighQuality ? 1.5 : 1.0} 
                radius={isHighQuality ? 0.4 : 0.2} 
            />
            <Vignette eskil={false} offset={0.2} darkness={0.7} />
            {isHighQuality && <Noise opacity={0.02} />}
          </EffectComposer>
        )}

      </Canvas>
    </div>
  );
};
