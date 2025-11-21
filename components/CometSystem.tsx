
import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail, Line } from '@react-three/drei';
import * as THREE from 'three';

// 1. 单个彗星组件
const Comet: React.FC<{ offset: number }> = ({ offset }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.3 + offset;
    
    // 高偏心率椭圆轨道
    const a = 180; // 半长轴
    const b = 60;  // 半短轴
    
    const x = a * Math.cos(t);
    const z = b * Math.sin(t);
    
    // 倾斜
    ref.current.position.set(x, x * 0.2, z);
  });

  return (
    <group>
        <Trail width={2} length={15} color={'#00ffff'} attenuation={(t) => t * t}>
            <mesh ref={ref}>
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
        </Trail>
    </group>
  );
};

// 2. 随机流星组件
const Meteor: React.FC<{ onEnd: () => void }> = ({ onEnd }) => {
    const startPos = useMemo(() => new THREE.Vector3(
        (Math.random() - 0.5) * 400, 
        (Math.random() - 0.5) * 200 + 100, 
        (Math.random() - 0.5) * 400
    ), []);
    
    const endPos = useMemo(() => new THREE.Vector3().copy(startPos).add(
        new THREE.Vector3((Math.random()-0.5)*100, -100, (Math.random()-0.5)*100)
    ), [startPos]);

    const [progress, setProgress] = useState(0);

    useFrame((_, delta) => {
        if (progress >= 1) {
            onEnd();
            return;
        }
        setProgress(p => p + delta * 2); // 速度很快
    });
    
    // 计算当前线段
    const currentHead = new THREE.Vector3().lerpVectors(startPos, endPos, progress);
    const currentTail = new THREE.Vector3().lerpVectors(startPos, endPos, Math.max(0, progress - 0.2));

    if (progress >= 1) return null;

    return (
        <Line points={[currentTail, currentHead]} color="white" lineWidth={2} transparent opacity={1 - progress} />
    );
};


export const CometSystem: React.FC = () => {
  const [meteors, setMeteors] = useState<{id: number}[]>([]);
  
  // 随机生成流星
  useFrame(() => {
      if (Math.random() < 0.005) { // 0.5% 概率每帧生成
          setMeteors(prev => [...prev, { id: Date.now() }]);
      }
  });

  const removeMeteor = (id: number) => {
      setMeteors(prev => prev.filter(m => m.id !== id));
  };

  return (
    <group>
        {/* 周期性彗星 */}
        <Comet offset={0} />
        <Comet offset={Math.PI} />
        
        {/* 随机流星 */}
        {meteors.map(m => (
            <Meteor key={m.id} onEnd={() => removeMeteor(m.id)} />
        ))}
    </group>
  );
};
