
import React from 'react';
import { SimulationSettings } from '../types';
import { Play, Pause, Globe2, Plus, Eye, EyeOff, Map, Loader2, Monitor } from 'lucide-react';

interface ControlBarProps {
  settings: SimulationSettings;
  setSettings: React.Dispatch<React.SetStateAction<SimulationSettings>>;
  onAddPlanet: () => void;
  onResetView: () => void;
  onToggleGalaxyMap: () => void;
  isGeneratingPlanet: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({ 
    settings, 
    setSettings, 
    onAddPlanet, 
    onResetView,
    onToggleGalaxyMap,
    isGeneratingPlanet
}) => {
  
  const togglePause = () => {
    setSettings(prev => ({ ...prev, paused: !prev.paused }));
  };

  const handleChange = (key: keyof SimulationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="absolute bottom-6 left-6 right-auto md:right-auto w-80 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-white z-10 shadow-2xl">
      {/* Header / Main Actions */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
         <div className="flex items-center gap-3">
            <button 
              onClick={togglePause}
              className="w-10 h-10 flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-black rounded-full transition-all shadow-lg shadow-cyan-500/20"
            >
              {settings.paused ? <Play className="w-4 h-4 fill-current ml-0.5" /> : <Pause className="w-4 h-4 fill-current" />}
            </button>
            <div>
               <h3 className="font-bold text-sm text-white">时空控制台</h3>
               <div className="flex items-center gap-1">
                   <div className={`w-1.5 h-1.5 rounded-full ${settings.paused ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                   <span className="text-[10px] text-gray-400 uppercase">{settings.paused ? '已暂停' : '运行中'}</span>
               </div>
            </div>
         </div>
         
         {/* View Controls */}
         <div className="flex gap-1">
             <button 
                onClick={() => handleChange('showLabels', !settings.showLabels)}
                className={`p-2 rounded-lg transition-colors ${settings.showLabels ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                title="显示/隐藏 标签"
             >
                 {settings.showLabels ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
             </button>
             <button 
                onClick={onResetView}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="当前星系全景"
             >
                 <Globe2 className="w-4 h-4"/>
             </button>
             <button 
                onClick={onToggleGalaxyMap}
                className="p-2 text-purple-400 hover:text-white hover:bg-purple-900/50 rounded-lg transition-colors border border-transparent hover:border-purple-500/50"
                title="切换至银河系地图"
             >
                 <Map className="w-4 h-4"/>
             </button>
         </div>
      </div>

      {/* Sliders & Settings */}
      <div className="space-y-5 text-xs mb-6">
        <div className="space-y-2">
          <div className="flex justify-between text-gray-400">
              <span>时间流速</span>
              <span className="font-mono text-cyan-400">{settings.timeScale.toFixed(1)}x</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="5" 
            step="0.1" 
            value={settings.timeScale} 
            onChange={(e) => handleChange('timeScale', parseFloat(e.target.value))}
            className="w-full accent-cyan-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer hover:bg-gray-600 transition-colors"
          />
        </div>

        {/* Graphics Quality Control (Replaces Body Scale) */}
        <div className="space-y-2">
          <div className="flex justify-between text-gray-400 items-center">
              <span className="flex items-center gap-1"><Monitor className="w-3 h-3"/> 画质参数</span>
              <span className={`font-mono font-bold ${
                  settings.quality === 'HIGH' ? 'text-purple-400' : 
                  settings.quality === 'MEDIUM' ? 'text-blue-400' : 'text-gray-500'
              }`}>
                  {settings.quality === 'HIGH' ? '极致' : settings.quality === 'MEDIUM' ? '均衡' : '性能'}
              </span>
          </div>
          <div className="flex bg-gray-800/50 rounded-lg p-1">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleChange('quality', mode)}
                    className={`flex-1 py-1.5 rounded-md transition-all text-[10px] font-medium
                        ${settings.quality === mode 
                            ? 'bg-white/10 text-white shadow-sm' 
                            : 'text-gray-500 hover:text-gray-300'}
                    `}
                  >
                      {mode === 'HIGH' ? '高' : mode === 'MEDIUM' ? '中' : '低'}
                  </button>
              ))}
          </div>
        </div>
      </div>

      {/* Expansion Actions */}
      <div className="pt-2">
          <button 
            onClick={onAddPlanet}
            disabled={isGeneratingPlanet || !process.env.API_KEY}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border border-white/5
                ${isGeneratingPlanet || !process.env.API_KEY
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 hover:from-cyan-800 hover:to-blue-800 text-cyan-100 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] border-cyan-500/30'}
            `}
          >
            {isGeneratingPlanet ? (
                <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    正在计算轨道参数...
                </>
            ) : (
                <>
                    <Plus className="w-3 h-3" />
                    AI 生成新行星
                </>
            )}
          </button>
      </div>
    </div>
  );
};
