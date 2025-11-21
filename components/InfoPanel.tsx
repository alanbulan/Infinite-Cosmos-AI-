
import React, { useState, useEffect } from 'react';
import { CelestialBodyData, CelestialType } from '../types';
import { generateEcosystemDetails } from '../services/geminiService';
import { Loader2, ChevronRight, Microscope, Activity, Wind, Mountain, Pickaxe, Orbit } from 'lucide-react';

interface InfoPanelProps {
  body: CelestialBodyData | null;
  onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ body, onClose }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [details, setDetails] = useState<CelestialBodyData['ecosystemDetails'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 当选中物体改变时，重置详情
  useEffect(() => {
    if (body) {
        setDetails(body.ecosystemDetails || null);
        setError(null);
        setAnalyzing(false);
    }
  }, [body]);

  if (!body) return null;

  const handleAnalyze = async () => {
    if (!process.env.API_KEY) {
        setError("未检测到 API Key，无法连接深空探测网络。");
        return;
    }
    
    setAnalyzing(true);
    setError(null);
    try {
      const result = await generateEcosystemDetails(body.name, body.description);
      setDetails({ ...result, analyzed: true });
      // 缓存数据 (注意：React state中的body是引用，直接修改会反映到App状态，但不推荐直接突变，此处为Demo简化)
      body.ecosystemDetails = { ...result, analyzed: true }; 
    } catch (e) {
      setError("探测器通讯故障，无法获取数据。");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-full md:w-96 bg-black/90 backdrop-blur-xl border-l border-cyan-500/20 p-6 text-white overflow-y-auto transition-transform transform ease-in-out z-10 shadow-2xl shadow-cyan-900/20">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 sticky top-0 bg-black/50 backdrop-blur-md py-2 -mt-2 z-20 border-b border-white/5">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            {body.name}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-cyan-200/70 font-mono">
             <span className="px-2 py-0.5 border border-cyan-800/50 bg-cyan-950/30 rounded text-[10px] tracking-widest uppercase">
               {body.type}
             </span>
             <span>ID: {body.id.toUpperCase().slice(0, 8)}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-cyan-900/20 text-cyan-400 rounded-full transition-colors">
          <ChevronRight />
        </button>
      </div>

      <div className="mb-8 space-y-4">
        <div className="bg-gradient-to-br from-gray-900 to-black p-5 rounded-xl border border-white/10 shadow-inner relative overflow-hidden">
           {/* Background grid effect */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          
          <h3 className="text-xs font-bold text-cyan-500 mb-3 uppercase tracking-widest flex items-center gap-2">
            <Orbit className="w-3 h-3" /> 
            基础遥测
          </h3>
          
          <p className="text-gray-300 leading-relaxed text-sm font-light mb-4 border-l-2 border-cyan-800 pl-3">
            {body.description}
          </p>
          
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs font-mono">
            <div className="group">
              <span className="block text-gray-600 group-hover:text-cyan-400 transition-colors">物理半径</span>
              <span className="text-gray-300">{body.radius.toFixed(2)} <span className="text-[10px] text-gray-600">R_UNIT</span></span>
            </div>
            <div className="group">
              <span className="block text-gray-600 group-hover:text-cyan-400 transition-colors">自转角速度</span>
              <span className="text-gray-300">{body.rotationSpeed} <span className="text-[10px] text-gray-600">RAD/T</span></span>
            </div>
            {body.orbit && (
              <>
                 <div className="group">
                  <span className="block text-gray-600 group-hover:text-cyan-400 transition-colors">轨道半长轴</span>
                  <span className="text-gray-300">{body.orbit.radius.toFixed(1)} <span className="text-[10px] text-gray-600">AU</span></span>
                </div>
                <div className="group">
                  <span className="block text-gray-600 group-hover:text-cyan-400 transition-colors">公转速度</span>
                  <span className="text-gray-300">{body.orbit.speed.toFixed(2)} <span className="text-[10px] text-gray-600">KM/S</span></span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 深度生态分析部分 */}
      <div className="border-t border-cyan-500/20 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-white">
            <Microscope className="w-5 h-5 text-purple-400" />
            深层生态分析
          </h3>
          {!details && !analyzing && (
            <button 
              onClick={handleAnalyze}
              className="relative overflow-hidden group flex items-center gap-2 px-5 py-2 bg-cyan-600 rounded-full text-xs font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></span>
              <span>启动探测</span>
            </button>
          )}
        </div>

        {analyzing && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 border border-dashed border-cyan-500/30 rounded-xl bg-cyan-950/10">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <div className="text-center">
                <span className="block text-sm text-cyan-300 font-mono animate-pulse">接收遥测数据流...</span>
                <span className="text-[10px] text-cyan-600 mt-1">正在解析光谱指纹</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            {error}
          </div>
        )}

        {details && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
             {/* Atmosphere */}
             <div className="group p-4 bg-gradient-to-r from-purple-900/10 to-transparent border-l-2 border-purple-500 rounded-r-lg hover:bg-purple-900/20 transition-all">
                <div className="flex items-center gap-2 text-purple-300 mb-2 text-xs font-bold uppercase tracking-wider">
                  <Wind className="w-4 h-4" /> 大气环境
                </div>
                <p className="text-sm text-gray-300 font-light leading-relaxed group-hover:text-white transition-colors">
                   {details.atmosphere}
                </p>
             </div>

             {/* Terrain */}
             <div className="group p-4 bg-gradient-to-r from-amber-900/10 to-transparent border-l-2 border-amber-500 rounded-r-lg hover:bg-amber-900/20 transition-all">
                <div className="flex items-center gap-2 text-amber-300 mb-2 text-xs font-bold uppercase tracking-wider">
                  <Mountain className="w-4 h-4" /> 地质地貌
                </div>
                <p className="text-sm text-gray-300 font-light leading-relaxed group-hover:text-white transition-colors">
                    {details.terrain}
                </p>
             </div>

             {/* Lifeform */}
             <div className="group p-4 bg-gradient-to-r from-green-900/10 to-transparent border-l-2 border-green-500 rounded-r-lg hover:bg-green-900/20 transition-all">
                <div className="flex items-center gap-2 text-green-300 mb-2 text-xs font-bold uppercase tracking-wider">
                  <Activity className="w-4 h-4" /> 生命迹象
                </div>
                 <p className="text-sm text-gray-300 font-light leading-relaxed group-hover:text-white transition-colors">
                    {details.lifeform}
                </p>
             </div>

             {/* Resources */}
             <div className="group p-4 bg-gradient-to-r from-blue-900/10 to-transparent border-l-2 border-blue-500 rounded-r-lg hover:bg-blue-900/20 transition-all">
                <div className="flex items-center gap-2 text-blue-300 mb-2 text-xs font-bold uppercase tracking-wider">
                  <Pickaxe className="w-4 h-4" /> 资源评估
                </div>
                 <p className="text-sm text-gray-300 font-light leading-relaxed group-hover:text-white transition-colors">
                    {details.resources}
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
