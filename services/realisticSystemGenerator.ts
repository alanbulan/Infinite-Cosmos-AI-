import { GoogleGenAI, Type } from "@google/genai";
import { CelestialBodyData, CelestialType } from "../types";
import { getApiKey } from "./apiKeyManager";

const modelId = 'gemini-2.5-flash';

const getAI = () => {
    const key = getApiKey();
    if (!key) throw new Error("API Key missing");
    return new GoogleGenAI({ apiKey: key });
};

// === 1. 视觉增强系统 (来自 Advanced Generator) ===
// 强制提升颜色饱和度，避免生成暗淡的灰色星球
const enhanceColor = (hex: string, type: string): string => {
  const palette: Record<string, string[]> = {
    'LAVA': ['#ff4500', '#ff8c00', '#e3170d', '#800000', '#ff3300'],
    'ROCKY': ['#8b4513', '#a0522d', '#cd853f', '#d2691e', '#b8860b'],
    'EARTH_LIKE': ['#00bfff', '#1e90ff', '#00ced1', '#2e8b57', '#32cd32'],
    'GAS_GIANT': ['#dda0dd', '#ba55d3', '#ffd700', '#ff69b4', '#f0e68c'],
    'ICE_GIANT': ['#00ffff', '#afeeee', '#40e0d0', '#7fffd4', '#87ceeb'],
    'ICE': ['#ffffff', '#f0ffff', '#e0ffff', '#b0e0e6', '#f5f5f5']
  };

  // 尝试匹配类型并随机返回一个高饱和度颜色
  for (const key in palette) {
    if (type.toUpperCase().includes(key)) {
       const colors = palette[key];
       return colors[Math.floor(Math.random() * colors.length)];
    }
  }
  return hex; 
};

// === 2. 天体物理规则 (来自 Realistic Generator) ===
// 恒星光谱分类 (Hertzsprung-Russell 简化版) - 调整了颜色使其更具科幻感
const STAR_SPECTRA: Record<string, { color: string, minR: number, maxR: number, desc: string, prob: number }> = {
  'O': { color: '#5D9CEC', minR: 35, maxR: 50, desc: '蓝超巨星 (O型)', prob: 0.05 },
  'B': { color: '#4FC1E9', minR: 25, maxR: 35, desc: '蓝白巨星 (B型)', prob: 0.1 },
  'A': { color: '#A0D468', minR: 20, maxR: 25, desc: '白矮星/主序星 (A型)', prob: 0.15 }, // 科幻调整：A型偏绿
  'F': { color: '#FCE38A', minR: 18, maxR: 22, desc: '黄白主序星 (F型)', prob: 0.2 },
  'G': { color: '#FFCE54', minR: 15, maxR: 18, desc: '黄矮星 (G型 - 类日)', prob: 0.25 }, 
  'K': { color: '#FC6E51', minR: 12, maxR: 15, desc: '橙矮星 (K型)', prob: 0.15 },
  'M': { color: '#ED5565', minR: 10, maxR: 12, desc: '红矮星 (M型)', prob: 0.1 }
};

// 行星类型定义 (包含基础色板，但会通过 enhanceColor 增强)
const PLANET_TYPES = [
    { type: 'LAVA', visualType: 'LAVA', minR: 0.8, maxR: 1.5 },
    { type: 'ROCKY', visualType: 'ROCKY', minR: 0.5, maxR: 1.2 },
    { type: 'EARTH_LIKE', visualType: 'EARTH_LIKE', minR: 0.9, maxR: 1.3 },
    { type: 'GAS_GIANT', visualType: 'GAS_GIANT', minR: 4.0, maxR: 7.0 },
    { type: 'ICE_GIANT', visualType: 'ICE_GIANT', minR: 3.0, maxR: 5.0 },
    { type: 'ICE', visualType: 'ICE', minR: 0.6, maxR: 1.4 }
];

// 宜居带逻辑：根据恒星类型和距离决定行星类型
const getPlanetTypeByDistance = (distance: number, starType: string) => {
    let heatMap = 1.0;
    if (starType === 'O' || starType === 'B') heatMap = 3.0; // 热恒星，宜居带更远
    if (starType === 'M') heatMap = 0.3; // 冷恒星，宜居带更近

    const adjustedDist = distance / heatMap;

    if (adjustedDist < 50) return PLANET_TYPES[0]; // Lava
    if (adjustedDist < 90) return Math.random() > 0.5 ? PLANET_TYPES[1] : PLANET_TYPES[0]; // Rocky
    if (adjustedDist < 140) return PLANET_TYPES[2]; // Habitable
    if (adjustedDist < 250) return PLANET_TYPES[3]; // Gas Giant
    return Math.random() > 0.5 ? PLANET_TYPES[4] : PLANET_TYPES[5]; // Ice
};

export const generateRealisticSystem = async (systemId: string, position: {x: number, y: number, z: number}): Promise<CelestialBodyData> => {
  // 1. 物理随机：决定恒星类型
  const rand = Math.random();
  let cumulative = 0;
  let selectedClass = 'G';
  for (const [key, data] of Object.entries(STAR_SPECTRA)) {
      cumulative += data.prob;
      if (rand <= cumulative) {
          selectedClass = key;
          break;
      }
  }
  const starConfig = STAR_SPECTRA[selectedClass];

  // 2. AI 创意：生成命名和独特的描述 (Name & Lore)
  let aiData = { 
    systemName: `未命名星域 ${systemId.slice(0,4)}`, 
    starName: `恒星 ${systemId.slice(0,4)}`, 
    starDesc: "未探测区域", 
    planetNames: [] 
  };

  try {
      const ai = getAI();
      // Prompt 结合了 Realistic 的命名结构和 Advanced 的视觉要求
      const prompt = `
        请为一个光谱类型为 ${selectedClass} (${starConfig.desc}) 的恒星系统生成详细设定。
        
        要求：
        1. **命名**：生成宏大的中文"星系名称" (如：天苑四星域) 和"恒星名称" (如：天苑四)。
        2. **描述**：恒星描述要体现其光谱颜色特征和科幻感。
        3. **行星**：生成 5-8 个行星名称，名称风格要统一 (例如神话系、编号系或抽象系)。
        
        返回 JSON:
        {
          "systemName": "星系整体名称",
          "starName": "主恒星名称",
          "starDesc": "恒星描述",
          "planetNames": ["行星1", "行星2", ...]
        }
      `;
      
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      if (response.text) aiData = JSON.parse(response.text);
  } catch (e) {
      console.warn("AI text gen failed, using procedural defaults");
  }

  // 3. 混合构建：数学轨道 + AI 命名 + 视觉增强
  const children: CelestialBodyData[] = [];
  const planetCount = Math.floor(Math.random() * 4) + 4; // 4-8 planets
  const startOrbitRadius = starConfig.minR * 2.0 + 15; 

  for (let i = 0; i < planetCount; i++) {
      // 提丢斯-波得定则变体：指数增长的轨道间距
      const orbitRadius = startOrbitRadius + (Math.pow(1.55, i) * 25) + (Math.random() * 10);
      
      // 根据物理距离决定类型
      const typeConfig = getPlanetTypeByDistance(orbitRadius, selectedClass);
      
      // 视觉增强：获取高饱和度颜色
      const color = enhanceColor(typeConfig.visualType, typeConfig.visualType);
      
      // 物理半径：增加一点随机性
      const radius = typeConfig.minR + Math.random() * (typeConfig.maxR - typeConfig.minR);
      
      // 轨道速度：开普勒定律模拟 (近快远慢)
      const orbitSpeed = 18 / Math.sqrt(orbitRadius); 

      // 环的生成逻辑
      const hasRings = (typeConfig.visualType === 'GAS_GIANT' || typeConfig.visualType === 'ICE_GIANT') && Math.random() > 0.4;

      children.push({
          id: `${systemId}_p_${i}`,
          name: aiData.planetNames[i] || `${aiData.starName} ${['I','II','III','IV','V','VI','VII','VIII'][i]}`,
          type: CelestialType.PLANET,
          description: `一颗位于 ${Math.round(orbitRadius)} AU 处的${typeConfig.visualType === 'GAS_GIANT' ? '气态巨行星' : '岩石行星'}。`,
          color: color,
          radius: radius,
          rotationSpeed: 0.01 + Math.random() * 0.03,
          orbit: {
              radius: orbitRadius,
              speed: orbitSpeed * 0.5,
              tilt: (Math.random() * 10) - 5,
              offset: Math.random() * 10
          },
          ringConfig: hasRings ? {
              innerRadius: radius * 1.4,
              outerRadius: radius * 2.2,
              color: color, // 环的颜色通常接近行星色调
              opacity: 0.5
          } : undefined,
          // 预置空的生态数据，等待用户点击探测
          ecosystemDetails: {
            atmosphere: "等待深空扫描...",
            terrain: "未解析地貌",
            lifeform: "扫描中...",
            resources: "未评估",
            analyzed: false
          }
      });
  }

  // 4. 陨石带生成 (Advanced Generator 的特性)
  // 寻找类地行星和气态行星之间的空隙，或者是系统最外围
  let asteroidBeltConfig = undefined;
  if (Math.random() > 0.3) {
      const lastPlanet = children[children.length - 1];
      asteroidBeltConfig = {
          minRadius: lastPlanet.orbit!.radius + 30,
          maxRadius: lastPlanet.orbit!.radius + 60,
          count: 1500
      };
  }

  return {
    id: systemId,
    name: aiData.starName,
    systemName: aiData.systemName,
    type: CelestialType.STAR,
    description: `[${selectedClass}型] ${aiData.starDesc}`,
    color: starConfig.color,
    radius: starConfig.minR + Math.random() * (starConfig.maxR - starConfig.minR),
    emissive: true,
    rotationSpeed: 0.002,
    orbit: null,
    children: children,
    asteroidBelt: asteroidBeltConfig
  };
};