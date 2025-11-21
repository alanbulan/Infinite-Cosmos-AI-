import React from 'react';
import { SimulationSettings } from '../types';
import { Play, Pause, Sliders } from 'lucide-react';

interface ControlBarProps {
  settings: SimulationSettings;
  setSettings: React.Dispatch<React.SetStateAction<SimulationSettings>>;
}

export const ControlBar: React.FC<ControlBarProps> = ({ settings, setSettings }) => {
  
  const togglePause = () => {
    setSettings(prev => ({ ...prev, paused: !prev.paused }));
  };

  const handleChange = (key: keyof SimulationSettings, value: number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="absolute bottom-6 left-6 right-auto md:right-auto max-w-md bg-black/70 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white z-10">
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={togglePause}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
        >
          {settings.paused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
        </button>
        <div>
           <h3 className="font-bold text-sm flex items-center gap-2">
             <Sliders className="w-4 h-4" />
             时空控制台
           </h3>
           <p className="text-xs text-gray-400">调整宇宙运行参数</p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="w-16 text-gray-400">时间流速</span>
          <input 
            type="range" 
            min="0" 
            max="5" 
            step="0.1" 
            value={settings.timeScale} 
            onChange={(e) => handleChange('timeScale', parseFloat(e.target.value))}
            className="flex-1 accent-cyan-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="w-8 text-right">{settings.timeScale.toFixed(1)}x</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-16 text-gray-400">天体比例</span>
          <input 
            type="range" 
            min="0.1" 
            max="3" 
            step="0.1" 
            value={settings.bodyScale} 
            onChange={(e) => handleChange('bodyScale', parseFloat(e.target.value))}
            className="flex-1 accent-purple-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="w-8 text-right">{settings.bodyScale.toFixed(1)}x</span>
        </div>

        <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={settings.showOrbits}
                    onChange={(e) => handleChange('showOrbits', e.target.checked)}
                    className="accent-cyan-500"
                />
                <span className="text-gray-300">显示轨道</span>
            </label>
        </div>
      </div>
    </div>
  );
};