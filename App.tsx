import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { InfoPanel } from './components/InfoPanel';
import { ControlBar } from './components/ControlBar';
import { GalaxyMap } from './components/GalaxyMap';
import { SystemNavigation } from './components/SystemNavigation';
import { WarpEffect } from './components/WarpEffect';
import { ApiKeyConfig } from './components/ApiKeyConfig';
import { SOLAR_SYSTEM_ROOT } from './constants';
import { CelestialBodyData, SimulationSettings, CosmicEvent } from './types';
import { generateNewPlanetData, generateCosmicEvent } from './services/geminiService';
import { generateRealisticSystem } from './services/realisticSystemGenerator'; 
import { loadUniverseState, saveUniverseState } from './services/storageManager';
import { hasValidKey } from './services/apiKeyManager';
import { Radio, Zap, Loader2, Send } from 'lucide-react';
import * as THREE from 'three';

const App: React.FC = () => {
  const [viewScope, setViewScope] = useState<'SYSTEM' | 'GALAXY'>('SYSTEM');
  const [systems, setSystems] = useState<Record<string, CelestialBodyData>>(() => loadUniverseState());
  const [currentSystemId, setCurrentSystemId] = useState<string>('sun');
  const [selectedBody, setSelectedBody] = useState<CelestialBodyData | null>(null);
  const [viewMode, setViewMode] = useState<'focus' | 'galaxy'>('galaxy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWarping, setIsWarping] = useState(false); 
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [currentEvent, setCurrentEvent] = useState<CosmicEvent | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(hasValidKey());

  const [settings, setSettings] = useState<SimulationSettings>({
    timeScale: 1.0,
    orbitScale: 1.0,
    bodyScale: 1.5,
    quality: 'MEDIUM',
    showOrbits: true,
    showLabels: false,
    paused: false
  });

  useEffect(() => {
    saveUniverseState(systems);
  }, [systems]);

  const handleKeyUpdate = () => {
      setHasApiKey(hasValidKey());
  };

  const handleSwitchToGalaxyMap = () => {
    setSelectedBody(null);
    setViewScope('GALAXY');
    setSettings(prev => ({ ...prev, paused: true }));
  };

  const handleWarpToSystem = async (id: string, position: THREE.Vector3) => {
    if (id === currentSystemId && viewScope === 'SYSTEM') {
        setViewScope('SYSTEM');
        setSettings(prev => ({ ...prev, paused: false }));
        return;
    }

    setLoadingMessage(`正在锁定星标: ${id.toUpperCase()} ...`);
    setIsGenerating(true);

    let targetSystem: CelestialBodyData | null = systems[id];

    if (!targetSystem) {
        if (id === 'sun') {
             targetSystem = SOLAR_SYSTEM_ROOT;
        } else {
            setLoadingMessage("正在进行光谱分析与质量测算...");
            targetSystem = await generateRealisticSystem(id, { x: position.x, y: position.y, z: position.z });
            setSystems(prev => ({ ...prev, [id]: targetSystem! }));
        }
    }

    setIsGenerating(false);
    setLoadingMessage("");
    setIsWarping(true);
    
    setTimeout(() => {
        setCurrentSystemId(id);
        setViewScope('SYSTEM');
        setSettings(prev => ({ ...prev, paused: false }));
        setViewMode('galaxy'); 
        setSelectedBody(null);
        setTimeout(() => { setIsWarping(false); }, 500);
    }, 2500); 
  };

  const activeSystemData = systems[currentSystemId];

  const handleBodySelect = (body: CelestialBodyData) => {
    setSelectedBody(body);
    setViewMode('focus');
  };

  const handleResetView = () => {
      setSelectedBody(null);
      setViewMode('galaxy');
  };

  const handleAddPlanet = async () => {
    if (!activeSystemData.children || !hasApiKey) return;
    setIsGenerating(true);
    setLoadingMessage("正在演算轨道参数...");
    
    const newPlanet = await generateNewPlanetData(activeSystemData.children.length);
    
    if (newPlanet) {
        const updatedSystem = {
            ...activeSystemData,
            children: [...(activeSystemData.children || []), newPlanet]
        };
        setSystems(prev => ({ ...prev, [currentSystemId]: updatedSystem }));
    }
    setIsGenerating(false);
    setLoadingMessage("");
  };

  useEffect(() => {
     if (settings.paused && viewScope === 'SYSTEM') return;
     // Only generate events if API key exists
     if (!hasApiKey) return;

     const interval = setInterval(async () => {
         if (Math.random() > 0.7 && viewScope === 'SYSTEM' && !isWarping) {
             const evt = await generateCosmicEvent();
             if (evt) {
                 setCurrentEvent({ ...evt, timestamp: Date.now() });
                 setTimeout(() => setCurrentEvent(null), 8000);
             }
         }
     }, 45000);
     return () => clearInterval(interval);
  }, [settings.paused, viewScope, isWarping, hasApiKey]);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black font-sans select-none">
      
      <ApiKeyConfig onKeyUpdate={handleKeyUpdate} />

      {isWarping && (
          <div className="absolute inset-0 z-[100]">
              <Canvas camera={{ position: [0, 0, 5], fov: 90 }}>
                  <WarpEffect />
              </Canvas>
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-cyan-400 font-mono text-xl tracking-[0.5em] animate-pulse">
                  HYPERSPACE JUMP
              </div>
          </div>
      )}

      <div className={`${isWarping ? 'opacity-0' : 'opacity-100'} transition-opacity duration-1000 w-full h-full`}>
          {viewScope === 'SYSTEM' ? (
              <Scene 
                universeData={activeSystemData} 
                settings={settings}
                selectedBody={selectedBody}
                onBodySelect={handleBodySelect}
                viewMode={viewMode}
              />
          ) : (
              <>
                  <GalaxyMap 
                    currentSystemId={currentSystemId}
                    knownSystems={Object.keys(systems)}
                    onSystemSelect={handleWarpToSystem}
                  />
                  <SystemNavigation 
                    systems={systems} 
                    currentSystemId={currentSystemId} 
                    onSelectSystem={handleWarpToSystem} 
                  />
              </>
          )}
      </div>

      {isGenerating && !isWarping && (
          <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-cyan-400">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <h3 className="text-xl font-mono tracking-widest animate-pulse uppercase">
                  {viewScope === 'GALAXY' ? 'Scanning Sector' : 'Synthesizing Data'}
              </h3>
              <p className="text-sm text-cyan-600 mt-2">{loadingMessage}</p>
          </div>
      )}

      {!isWarping && (
        <div className="absolute top-6 left-6 pointer-events-none z-10">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            INFINITE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">COSMOS</span>
            </h1>
            <div className="flex items-center gap-2 mt-2 opacity-70">
                <div className="h-[1px] w-10 bg-white/50"></div>
                <p className="text-xs text-cyan-200 tracking-[0.3em] uppercase">
                    {viewScope === 'GALAXY' ? 'Milky Way Sector Map' : `${activeSystemData.systemName || '未命名星系'} : ${activeSystemData.name}`}
                </p>
            </div>
        </div>
      )}

      {currentEvent && viewScope === 'SYSTEM' && !isWarping && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-10 duration-500">
              <div className="bg-black/80 backdrop-blur-xl border border-red-500/30 px-6 py-4 rounded-lg shadow-[0_0_30px_rgba(220,38,38,0.2)] flex items-start gap-4 max-w-md">
                 <div className="p-2 bg-red-500/20 rounded-full animate-pulse">
                     {currentEvent.type === 'signal' ? <Radio className="w-5 h-5 text-red-400" /> : <Zap className="w-5 h-5 text-red-400" />}
                 </div>
                 <div>
                     <h4 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-1">{currentEvent.title}</h4>
                     <p className="text-gray-300 text-xs leading-relaxed">{currentEvent.description}</p>
                 </div>
              </div>
          </div>
      )}

      {!isWarping && (
          <>
            {viewScope === 'SYSTEM' ? (
                <ControlBar 
                    settings={settings} 
                    setSettings={setSettings} 
                    onAddPlanet={handleAddPlanet}
                    isGeneratingPlanet={isGenerating}
                    onResetView={handleResetView}
                    onToggleGalaxyMap={handleSwitchToGalaxyMap}
                    hasApiKey={hasApiKey}
                />
            ) : (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
                    <button 
                        onClick={() => handleWarpToSystem(currentSystemId, new THREE.Vector3(0,0,0))}
                        className="px-8 py-3 bg-cyan-900/50 border border-cyan-500/50 text-cyan-100 rounded-full hover:bg-cyan-800/50 transition-all flex items-center gap-2 backdrop-blur-md hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] group"
                    >
                        <Send className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
                        <span>返回 {activeSystemData.name}</span>
                    </button>
                </div>
            )}
          </>
      )}

      {selectedBody && viewScope === 'SYSTEM' && !isWarping && (
        <InfoPanel 
          body={selectedBody} 
          onClose={() => setSelectedBody(null)} 
          hasApiKey={hasApiKey}
        />
      )}

    </div>
  );
};

export default App;