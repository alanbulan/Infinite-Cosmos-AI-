
import { GoogleGenAI, Type } from "@google/genai";
import { CelestialBodyData, CelestialType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = 'gemini-2.5-flash';

// === 1. 恒星光谱分类 (Hertzsprung-Russell 简化版 - 视觉优化版) ===
// 更新：大幅提升恒星半径下限，确保即使是红矮星也比巨行星大
const STAR_SPECTRA: Record<string, { color: string, minR: number, maxR: number, desc: string, prob: number }> = {
  'O': { color: '#9bb0ff', minR: 35, maxR: 50, desc: '蓝超巨星 (O型)', prob: 0.05 },
  'B': { color: '#aabfff', minR: 25, maxR: 35, desc: '蓝白巨星 (B型)', prob: 0.1 },
  'A': { color: '#cad7ff', minR: 20, maxR: 25, desc: '白矮星/主序星 (A型)', prob: 0.15 },
  'F': { color: '#f8f7ff', minR: 18, maxR: 22, desc: '黄白主序星 (F型)', prob: 0.2 },
  'G': { color: '#fff4ea', minR: 15, maxR: 18, desc: '黄矮星 (G型 - 类日)', prob: 0.25 }, // 类似太阳
  'K': { color: '#ffd2a1', minR: 12, maxR: 15, desc: '橙矮星 (K型)', prob: 0.15 },
  'M': { color: '#ffcc6f', minR: 10, maxR: 12, desc: '红矮星 (M型)', prob: 0.1 }
};

// === 2. 行星类型与颜色映射 ===
const PLANET_TYPES = [
    { type: 'LAVA', color: ['#ff4d00', '#8a2be2', '#330000'], minR: 0.8, maxR: 1.5 },
    { type: 'ROCKY', color: ['#8b4513', '#a0522d', '#cd853f'], minR: 0.5, maxR: 1.2 },
    { type: 'EARTH_LIKE', color: ['#2e8b57', '#1e90ff', '#00ced1'], minR: 0.9, maxR: 1.3 },
    { type: 'GAS_GIANT', color: ['#dda0dd', '#f0e68c', '#e6e6fa'], minR: 4.0, maxR: 7.0 },
    { type: 'ICE_GIANT', color: ['#add8e6', '#00ffff', '#e0ffff'], minR: 3.0, maxR: 5.0 },
    { type: 'ICE', color: ['#ffffff', '#f5f5f5', '#afeeee'], minR: 0.6, maxR: 1.4 }
];

// 辅助：根据距离选择合理的行星类型 (Habitable Zone Logic)
const getPlanetTypeByDistance = (distance: number, starType: string) => {
    // 简单的宜居带估算
    let heatMap = 1.0;
    if (starType === 'O' || starType === 'B') heatMap = 3.0;
    if (starType === 'M') heatMap = 0.3;

    const adjustedDist = distance / heatMap;

    if (adjustedDist < 50) return PLANET_TYPES[0]; // Lava
    if (adjustedDist < 90) return Math.random() > 0.5 ? PLANET_TYPES[1] : PLANET_TYPES[0]; // Rocky
    if (adjustedDist < 140) return PLANET_TYPES[2]; // Earth-like (Goldilocks)
    if (adjustedDist < 250) return PLANET_TYPES[3]; // Gas Giant
    return Math.random() > 0.5 ? PLANET_TYPES[4] : PLANET_TYPES[5]; // Ice/Ice Giant
};

// 辅助：增强颜色饱和度
const pickVibrantColor = (candidates: string[]) => candidates[Math.floor(Math.random() * candidates.length)];


export const generateRealisticSystem = async (systemId: string, position: {x: number, y: number, z: number}): Promise<CelestialBodyData> => {
  // 1. 随机决定恒星光谱类型 (加权随机)
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

  // 2. AI 生成文案部分 (Name, Description)
  const prompt = `
    请为一个 ${starConfig.desc} 恒星系统生成详细的中文名称。
    这颗恒星位于银河系旋臂，光谱类型为 ${selectedClass}。
    
    要求：
    1. **星系名称** (systemName)：星系的整体称呼，例如"天狼星域"、"猎户座θ星系"、"第7扇区"。
    2. **恒星名称** (starName)：主恒星的具体名称，例如"天狼星 A"、"参宿四"。
    3. **行星名称**：生成 3-6 个富有科幻感的名称。

    返回 JSON:
    {
      "systemName": "星系整体名称",
      "starName": "主恒星名称",
      "starDesc": "恒星的简短描述",
      "planetNames": ["行星1", "行星2", ...]
    }
  `;

  let aiData = { 
    systemName: `未命名星域 ${systemId.slice(0,4)}`, 
    starName: `恒星 ${systemId.slice(0,4)}`, 
    starDesc: "未探测", 
    planetNames: [] 
  };

  try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      if (response.text) aiData = JSON.parse(response.text);
  } catch (e) {
      console.warn("AI text gen failed, using defaults");
  }

  // 3. 物理构建系统
  const children: CelestialBodyData[] = [];
  const planetCount = Math.floor(Math.random() * 4) + 3; // 3-6 planets

  // 调整轨道起始点，防止行星被巨大的恒星吞没
  const startOrbitRadius = starConfig.minR * 2.0 + 10; 

  for (let i = 0; i < planetCount; i++) {
      // 提丢斯-波得定则变体，扩大间距
      const orbitRadius = startOrbitRadius + (Math.pow(1.6, i) * 20) + (Math.random() * 15);
      
      const typeConfig = getPlanetTypeByDistance(orbitRadius, selectedClass);
      const radius = typeConfig.minR + Math.random() * (typeConfig.maxR - typeConfig.minR);
      const color = pickVibrantColor(typeConfig.color);
      
      const orbitSpeed = 15 / Math.sqrt(orbitRadius); // 调整速度系数

      children.push({
          id: `${systemId}_p_${i}`,
          name: aiData.planetNames[i] || `${aiData.starName} ${['I','II','III','IV','V','VI'][i]}`,
          type: CelestialType.PLANET,
          description: `一颗位于 ${Math.round(orbitRadius)} AU 处的${typeConfig.type === 'GAS_GIANT' ? '气态巨行星' : '岩石行星'}。`,
          color: color,
          radius: radius,
          rotationSpeed: 0.01 + Math.random() * 0.03,
          orbit: {
              radius: orbitRadius,
              speed: orbitSpeed * 0.5,
              tilt: (Math.random() * 10) - 5,
              offset: Math.random() * 10
          },
          ringConfig: (typeConfig.type === 'GAS_GIANT' || typeConfig.type === 'ICE_GIANT') && Math.random() > 0.4 ? {
              innerRadius: radius * 1.4,
              outerRadius: radius * 2.2,
              color: color,
              opacity: 0.4
          } : undefined
      });
  }

  // 4. 组装结果
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
    asteroidBelt: Math.random() > 0.5 ? {
        minRadius: children[children.length-1].orbit!.radius + 30,
        maxRadius: children[children.length-1].orbit!.radius + 60,
        count: 1200
    } : undefined
  };
};
