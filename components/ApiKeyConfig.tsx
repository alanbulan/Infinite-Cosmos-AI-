import React, { useState, useEffect } from 'react';
import { Key, User, CheckCircle2, AlertCircle, Settings2 } from 'lucide-react';
import { getApiKey, setApiKey } from '../services/apiKeyManager';

export const ApiKeyConfig: React.FC<{ onKeyUpdate: () => void }> = ({ onKeyUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const current = getApiKey();
    if (current) {
        setKey(current);
        setSaved(true);
    } else {
        // 如果没有 Key，自动打开提示
        setIsOpen(true);
    }
  }, []);

  const handleSave = () => {
    if (!key.trim()) return;
    setApiKey(key.trim());
    setSaved(true);
    setIsOpen(false);
    onKeyUpdate();
  };

  return (
    <>
      {/* Trigger Button - Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border transition-all shadow-lg group
                ${saved 
                    ? 'bg-cyan-950/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/80' 
                    : 'bg-red-950/50 border-red-500/50 text-red-400 animate-pulse hover:bg-red-900/80'}
            `}
        >
            {saved ? <Settings2 className="w-4 h-4 group-hover:rotate-90 transition-transform" /> : <Key className="w-4 h-4" />}
            <span className="text-xs font-bold tracking-wider">{saved ? '系统已就绪' : '配置 API KEY'}</span>
        </button>
      </div>

      {/* Configuration Modal */}
      {isOpen && (
        <div className="absolute top-20 right-6 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl z-50 animate-in slide-in-from-right-5 duration-300">
            <div className="flex items-center gap-2 mb-4 text-white">
                <div className="p-2 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-lg shadow-lg shadow-cyan-900/50">
                    <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-sm text-cyan-100">接入深空网络</h3>
                    <p className="text-[10px] text-cyan-400/60 font-mono">System Access Configuration</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg opacity-30 group-hover:opacity-50 transition duration-200 blur"></div>
                    <div className="relative">
                        <input 
                            type="password" 
                            value={key}
                            onChange={(e) => {
                                setKey(e.target.value);
                                setSaved(false);
                            }}
                            placeholder="输入您的 Gemini API Key..."
                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors font-mono tracking-wide"
                        />
                        {saved && <CheckCircle2 className="absolute right-3 top-3 w-4 h-4 text-green-500" />}
                    </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <p className="text-[10px] text-gray-400 leading-relaxed flex gap-2">
                        <AlertCircle className="w-3 h-3 shrink-0 mt-0.5 text-cyan-500" />
                        <span>
                           Key 仅存储在您的本地浏览器中，用于直接调用 Google Gemini 模型生成无限宇宙数据。
                        </span>
                    </p>
                </div>

                <button 
                    onClick={handleSave}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-xs font-bold text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {saved ? '更新连接' : '保存并启动'}
                </button>

                <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-1 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-light">
                        <User className="w-3 h-3" />
                        <span>开发人构思者：</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-bold">alanbulan</span>
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
};