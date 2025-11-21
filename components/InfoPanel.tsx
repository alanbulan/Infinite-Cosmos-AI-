import React, { useState, useEffect } from 'react';
import { CelestialBodyData, CelestialType } from '../types';
import { generateEcosystemDetails } from '../services/geminiService';
import { Loader2, ChevronRight, Microscope, Activity, Wind, Mountain, Pickaxe } from 'lucide-react';

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
      // 在实际应用中，这里应该回调更新父组件的数据树，缓存AI结果
      // body.ecosystemDetails = { ...result, analyzed: true }; 
    } catch (e) {
      setError("探测器通讯故障，无法获取数据。");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-full md:w-96 bg-black/80 backdrop-blur-md border-l border-white/10 p-6 text-white overflow-y-auto transition-transform transform ease-in-out z-10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            {body.name}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
             <span className="px-2 py-0.5 border border-gray-600 rounded text-[10px] tracking-widest uppercase">
               {body.type}
             </span>
             <span>ID: {body.id.toUpperCase()}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronRight />
        </button>
      </div>

      <div className="mb-8 space-y-4">
        <div className="bg-white/5 p-4 rounded-lg border border-white/5">
          <h3 className="text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">基础遥测数据</h3>
          <p className="text-gray-300 leading-relaxed text-sm">{body.description}</p>
          <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-gray-400">
            <div>
              <span className="block text-gray-500">半径</span>
              {body.radius} R_unit
            </div>
            <div>
              <span className="block text-gray-500">自转速度</span>
              {body.rotationSpeed} rad/tick
            </div>
            {body.orbit && (
              <>
                 <div>
                  <span className="block text-gray-500">轨道半径</span>
                  {body.orbit.radius} AU
                </div>
                <div>
                  <span className="block text-gray-500">轨道速度</span>
                  {body.orbit.speed} km/s
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 深度生态分析部分 */}
      <div className="border-t border-white/10 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Microscope className="w-5 h-5 text-purple-400" />
            深层生态分析
          </h3>
          {!details && !analyzing && (
            <button 
              onClick={handleAnalyze}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)]"
            >
              启动探测无人机
            </button>
          )}
        </div>

        {analyzing && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4 text-cyan-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm animate-pulse">正在解析光谱数据...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        {details && (
          <div className="space-y-4 animate-fade-in">
             <div className="p-3 bg-purple-900/20 border border-purple-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-purple-300 mb-1 text-xs font-bold uppercase">
                  <Wind className="w-3 h-3" /> 大气环境
                </div>
                <p className="text-sm text-gray-300">{details.atmosphere}</p>
             </div>

             <div className="p-3 bg-amber-900/20 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-amber-300 mb-1 text-xs font-bold uppercase">
                  <Mountain className="w-3 h-3" /> 地质地貌
                </div>
                <p className="text-sm text-gray-300">{details.terrain}</p>
             </div>

             <div className="p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-300 mb-1 text-xs font-bold uppercase">
                  <Activity className="w-3 h-3" /> 生命迹象
                </div>
                <p className="text-sm text-gray-300">{details.lifeform}</p>
             </div>

             <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-blue-300 mb-1 text-xs font-bold uppercase">
                  <Pickaxe className="w-3 h-3" /> 资源评估
                </div>
                <p className="text-sm text-gray-300">{details.resources}</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};