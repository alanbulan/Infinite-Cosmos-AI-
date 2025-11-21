import React, { useRef, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { CelestialBodyData, CelestialType, SimulationSettings } from '../types';

interface OrbitSystemProps {
  data: CelestialBodyData;
  settings: SimulationSettings;
  onSelect: (body: CelestialBodyData, position: THREE.Vector3) => void;
  selectedId: string | null;
  depth?: number;
}

// Error Boundary Component to catch texture loading errors (e.g. 404, CORS)
class TextureErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.warn("Texture loading failed, switching to fallback material:", error);
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Shared Geometry and Interaction Logic
const BasePlanetMesh: React.FC<{
  data: CelestialBodyData;
  settings: SimulationSettings;
  onSelect: any;
  setHovered: any;
  children: React.ReactNode;
}> = ({ data, settings, onSelect, setHovered, children }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += data.rotationSpeed;
    }
  });

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        const worldPos = new THREE.Vector3();
        meshRef.current?.getWorldPosition(worldPos);
        onSelect(data, worldPos);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[data.radius * settings.bodyScale, 64, 64]} />
      {children}
      
      {data.ringConfig && (
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <ringGeometry
            args={[
              data.ringConfig.innerRadius * settings.bodyScale,
              data.ringConfig.outerRadius * settings.bodyScale,
              128,
            ]}
          />
          <meshStandardMaterial
            color={data.ringConfig.color}
            transparent
            opacity={data.ringConfig.opacity}
            side={THREE.DoubleSide}
            roughness={0.8}
          />
        </mesh>
      )}
    </mesh>
  );
};

// Component for Procedural (Color-only) Planet
const ProceduralPlanetMesh: React.FC<{
  data: CelestialBodyData;
  settings: SimulationSettings;
  isPlanet: boolean;
  onSelect: any;
  setHovered: any;
}> = (props) => {
  const { data, isPlanet } = props;
  return (
    <BasePlanetMesh {...props}>
      <meshPhysicalMaterial
        color={data.color}
        emissive={data.emissive ? data.color : '#000000'}
        emissiveIntensity={data.emissive ? 2 : 0}
        roughness={data.emissive ? 0.1 : 0.7}
        metalness={data.emissive ? 0.1 : 0.1}
        clearcoat={isPlanet ? 0.3 : 0}
        clearcoatRoughness={isPlanet ? 0.1 : 0}
      />
    </BasePlanetMesh>
  );
};

// Component for Textured Planet (Uses Hooks)
const TexturedPlanetMesh: React.FC<{
  data: CelestialBodyData;
  settings: SimulationSettings;
  isPlanet: boolean;
  onSelect: any;
  setHovered: any;
}> = (props) => {
  const { data, isPlanet } = props;
  // Safe to use hook here because this component is only rendered if textureUrl exists
  const texture = useLoader(THREE.TextureLoader, data.textureUrl!);

  return (
    <BasePlanetMesh {...props}>
      <meshPhysicalMaterial
        map={texture}
        color="#ffffff" // map overrides color, but setting white ensures tint is correct
        emissive={data.emissive ? data.color : '#000000'}
        emissiveIntensity={data.emissive ? 2 : 0}
        emissiveMap={data.emissive ? texture : null}
        roughness={data.emissive ? 0.1 : 0.7}
        metalness={data.emissive ? 0.1 : 0.1}
        clearcoat={isPlanet ? 0.3 : 0}
        clearcoatRoughness={isPlanet ? 0.1 : 0}
      />
    </BasePlanetMesh>
  );
};

export const OrbitSystem: React.FC<OrbitSystemProps> = ({ 
  data, 
  settings, 
  onSelect, 
  selectedId,
  depth = 0 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // 轨道计算
  useFrame(({ clock }) => {
    if (!groupRef.current || !data.orbit || settings.paused) return;

    const t = clock.getElapsedTime() * settings.timeScale * data.orbit.speed + data.orbit.offset;
    const r = data.orbit.radius * settings.orbitScale;

    const x = Math.cos(t) * r;
    const z = Math.sin(t) * r;

    groupRef.current.position.set(x, 0, z);
  });

  const isSelected = selectedId === data.id;
  const showOrbitLine = settings.showOrbits && data.orbit;
  const isPlanet = data.type === CelestialType.PLANET;

  // 动态计算轨道点
  const orbitPoints = React.useMemo(() => {
    if (!data.orbit) return null;
    const points = [];
    const r = data.orbit.radius * settings.orbitScale;
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r));
    }
    return points;
  }, [data.orbit, settings.orbitScale]);

  // Fallback content
  const FallbackComponent = (
      <ProceduralPlanetMesh 
        data={data} 
        settings={settings} 
        isPlanet={isPlanet} 
        onSelect={onSelect} 
        setHovered={setHovered} 
      />
  );

  return (
    <group>
      {/* 绘制轨道线 */}
      {showOrbitLine && orbitPoints && (
        <Line 
          points={orbitPoints} 
          color={isSelected ? "#06b6d4" : "#ffffff"} 
          opacity={isSelected ? 0.3 : 0.05} 
          transparent 
          lineWidth={isSelected ? 2 : 0.5} 
        />
      )}

      {/* 天体容器 */}
      <group ref={groupRef}>
        <group>
          <TextureErrorBoundary fallback={FallbackComponent}>
            <React.Suspense fallback={FallbackComponent}>
               {/* Conditionally render appropriate component to adhere to Rules of Hooks */}
               {data.textureUrl ? (
                   <TexturedPlanetMesh 
                      data={data} 
                      settings={settings} 
                      isPlanet={isPlanet} 
                      onSelect={onSelect} 
                      setHovered={setHovered} 
                   />
               ) : (
                   <ProceduralPlanetMesh 
                      data={data} 
                      settings={settings} 
                      isPlanet={isPlanet} 
                      onSelect={onSelect} 
                      setHovered={setHovered} 
                   />
               )}
            </React.Suspense>
          </TextureErrorBoundary>

          {/* === 选中状态：包络面 (Envelope) === */}
          {isSelected && (
            <mesh scale={[1.05, 1.05, 1.05]}> {/* Scale tighter to body */}
               <sphereGeometry args={[data.radius * settings.bodyScale, 64, 64]} />
               <meshBasicMaterial 
                  color="#ffffff" // White to be neutral
                  transparent 
                  opacity={0.05} // Very low opacity for "transparent" feel
                  side={THREE.BackSide} 
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
               />
            </mesh>
          )}

          {/* 悬停光效 (未选中时) */}
          {!isSelected && hovered && (
             <mesh scale={[1.05, 1.05, 1.05]}>
              <sphereGeometry args={[data.radius * settings.bodyScale, 32, 32]} />
              <meshBasicMaterial 
                color="#ffffff" 
                transparent 
                opacity={0.05} 
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          )}
        </group>

        {/* 标签 */}
        {settings.showLabels && (
          <Html distanceFactor={150} position={[0, (data.radius * settings.bodyScale) + (data.ringConfig ? 4 : 2), 0]}>
            <div 
              className={`px-2 py-1 rounded text-[10px] whitespace-nowrap transition-all duration-300 pointer-events-none select-none
                ${isSelected ? 'bg-cyan-500/90 text-black font-bold scale-110 border border-cyan-200' : 'bg-black/40 backdrop-blur-sm text-white border border-white/10'}
                ${!isSelected && !hovered ? 'opacity-60' : 'opacity-100'}
              `}
            >
              {data.name}
            </div>
          </Html>
        )}

        {/* 子天体 */}
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