import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { InfoPanel } from './components/InfoPanel';
import { ControlBar } from './components/ControlBar';
import { SOLAR_SYSTEM_ROOT } from './constants';
import { CelestialBodyData, SimulationSettings } from './types';

const App: React.FC = () => {
  // 宇宙状态管理
  // 注意：为了演示可扩展性，这里使用常量 SOLAR_SYSTEM_ROOT。
  // 如果要扩展宇宙，可以动态加载其他星系数据到这个状态树中。
  const [universeData] = useState<CelestialBodyData>(SOLAR_SYSTEM_ROOT);
  
  const [selectedBody, setSelectedBody] = useState<CelestialBodyData | null>(null);
  
  const [settings, setSettings] = useState<SimulationSettings>({
    timeScale: 1.0,
    orbitScale: 1.0,
    bodyScale: 1.0,
    showOrbits: true,
    paused: false
  });

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* 3D 场景层 */}
      <Scene 
        universeData={universeData} 
        settings={settings}
        selectedBody={selectedBody}
        onBodySelect={setSelectedBody}
      />

      {/* UI 层: 标题 */}
      <div className="absolute top-6 left-6 pointer-events-none z-10">
        <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          INFINITE <span className="text-cyan-400">COSMOS</span>
        </h1>
        <p className="text-sm text-gray-400 tracking-widest uppercase mt-1">
          Generative Universe Explorer
        </p>
      </div>

      {/* UI 层: 控制栏 */}
      <ControlBar settings={settings} setSettings={setSettings} />

      {/* UI 层: 信息面板 (当选中物体时滑出) */}
      {selectedBody && (
        <InfoPanel 
          body={selectedBody} 
          onClose={() => setSelectedBody(null)} 
        />
      )}

      {/* 简单的引导提示 */}
      {!selectedBody && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/50 text-xs pointer-events-none animate-pulse">
          点击天体查看详情 • 滚轮缩放 • 拖拽旋转
        </div>
      )}
    </div>
  );
};

export default App;