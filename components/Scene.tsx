import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, CameraControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { OrbitSystem } from './OrbitSystem';
import { CelestialBodyData, SimulationSettings } from '../types';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

interface SceneProps {
  universeData: CelestialBodyData;
  settings: SimulationSettings;
  selectedBody: CelestialBodyData | null;
  onBodySelect: (body: CelestialBodyData) => void;
}

// 摄像机控制器组件，用于平滑移动
const CameraManager: React.FC<{ targetPos: THREE.Vector3 | null; focusing: boolean }> = ({ targetPos, focusing }) => {
  const controlsRef = useRef<CameraControls>(null);
  
  useEffect(() => {
    if (targetPos && focusing && controlsRef.current) {
      // 平滑移动到目标附近
      // 偏移量稍微在上方和侧面
      const offset = new THREE.Vector3(10, 10, 10);
      controlsRef.current.setLookAt(
        targetPos.x + offset.x, targetPos.y + offset.y, targetPos.z + offset.z, // 摄像机位置
        targetPos.x, targetPos.y, targetPos.z, // 观察点
        true // 启用过渡动画
      );
    } else if (!focusing && controlsRef.current) {
        // Reset view roughly
        // controlsRef.current.setLookAt(0, 100, 150, 0, 0, 0, true);
    }
  }, [targetPos, focusing]);

  // 每一帧更新摄像机以跟随移动的目标 (如果处于聚焦模式)
  useFrame(() => {
      if (focusing && targetPos && controlsRef.current) {
           // 这里简化处理，因为targetPos是React状态传进来的快照，
           // 实际上若要完美跟随移动物体，需要在useFrame里直接获取物体ref的世界坐标。
           // 但考虑到本Demo的复杂度，点击时移动过去即可。
           // 若需实时跟随，OrbitControls 会打架。
      }
  });

  return <CameraControls ref={controlsRef} makeDefault minDistance={2} maxDistance={500} />;
};


export const Scene: React.FC<SceneProps> = ({ universeData, settings, selectedBody, onBodySelect }) => {
  const [focusPos, setFocusPos] = React.useState<THREE.Vector3 | null>(null);

  const handleSelect = (body: CelestialBodyData, pos: THREE.Vector3) => {
    setFocusPos(pos);
    onBodySelect(body);
  };

  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 60, 90], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={['#050505']} />
        
        {/* 环境光照 */}
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#ffddaa" distance={500} decay={1} />
        
        <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* 宇宙结构渲染 */}
        <OrbitSystem 
          data={universeData} 
          settings={settings}
          onSelect={handleSelect}
          selectedId={selectedBody?.id || null}
        />

        {/* 控制器 */}
        <CameraManager targetPos={focusPos} focusing={!!selectedBody} />

        {/* 后处理效果 */}
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.8} mipmapBlur intensity={1.5} radius={0.4} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

      </Canvas>
    </div>
  );
};