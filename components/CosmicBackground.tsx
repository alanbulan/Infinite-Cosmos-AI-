import React from 'react';
import { Stars, Cloud, Sparkles } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CosmicBackgroundProps {
  starColor: string;
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ starColor }) => {
  // 将恒星颜色转换稍微暗一点，作为星云的基调
  const nebulaColor = React.useMemo(() => {
      const c = new THREE.Color(starColor);
      c.multiplyScalar(0.2); // 调暗
      return c;
  }, [starColor]);

  return (
    <group>
        {/* 基础星空 */}
        <Stars radius={400} depth={100} count={8000} factor={4} saturation={1} fade speed={0.5} />
        
        {/* 远景星云 - 使用 Cloud 模拟 */}
        <group position={[0, -100, -200]}>
            <Cloud opacity={0.3} speed={0.1} bounds={[100, 20, 100]} segments={20} color={nebulaColor} />
        </group>
        
        <group position={[-200, 100, 200]}>
             <Cloud opacity={0.2} speed={0.1} bounds={[100, 20, 100]} segments={20} color="#220044" />
        </group>

        {/* 空间尘埃 */}
        <Sparkles 
            count={500} 
            scale={600} 
            size={4} 
            speed={0.2} 
            opacity={0.5} 
            color={starColor}
        />
    </group>
  );
};