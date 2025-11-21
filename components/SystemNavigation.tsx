
import React from 'react';
import { CelestialBodyData } from '../types';
import { MapPin, Navigation2, RotateCcw, History } from 'lucide-react';
import * as THREE from 'three';

interface SystemNavigationProps {
  systems: Record<string, CelestialBodyData>;
  currentSystemId: string;
  onSelectSystem: (id: string, pos: THREE.Vector3) => void;
}

export const SystemNavigation: React.FC<SystemNavigationProps> = ({ systems, currentSystemId, onSelectSystem }) => {
  const systemList = Object.values(systems).reverse(); // 最新访问的在上面

  return (
    <div className="absolute bottom-6 left-6 w-72 flex flex-col gap-2 pointer-events-auto animate-in slide-in-from-left-10 duration-500 z-30">
        <div className="bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-t-xl p-3 flex items-center justify-between shadow-lg shadow-cyan-900/20">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
                <History className="w-4 h-4" /> 星图跃迁记录
            </div>
            <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                {systemList.length} 已发现
            </span>
        </div>
        
        <div className="bg-black/70 backdrop-blur-md border-x border-b border-white/10 rounded-b-xl overflow-y-auto max-h-[300px] p-1 space-y-1 custom-scrollbar">
            {systemList.map((sys) => {
                const isCurrent = sys.id === currentSystemId;
                return (
                    <button
                        key={sys.id}
                        onClick={() => onSelectSystem(sys.id, new THREE.Vector3(0,0,0))} 
                        className={`w-full text-left p-3 rounded-lg flex items-center justify-between group transition-all
                            ${isCurrent 
                                ? 'bg-cyan-900/30 border border-cyan-500/40' 
                                : 'hover:bg-white/5 border border-transparent hover:border-white/10'}
                        `}
                    >
                        <div className="flex flex-col overflow-hidden">
                            <span className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-gray-400 group-hover:text-cyan-300'}`}>
                                {sys.systemName || sys.name}
                            </span>
                            <span className="text-[10px] text-gray-600 font-mono truncate">
                                {sys.name !== sys.systemName ? sys.name : '未知主星'}
                            </span>
                        </div>
                        
                        {isCurrent ? (
                            <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-900">
                                <MapPin className="w-3 h-3" /> 当前
                            </div>
                        ) : (
                            <RotateCcw className="w-3 h-3 text-gray-600 group-hover:text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </button>
                );
            })}
        </div>
    </div>
  );
};
