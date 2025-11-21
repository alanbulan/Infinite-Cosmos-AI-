
import { GoogleGenAI, Type } from "@google/genai";
import { CelestialBodyData, CelestialType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = 'gemini-2.5-flash';

// 辅助函数：增强颜色饱和度 (如果AI生成的颜色太灰，强制提亮)
const enhanceColor = (hex: string, type: string): string => {
  // 简单的预设映射，作为保底
  const palette: Record<string, string[]> = {
    'LAVA': ['#ff4500', '#ff8c00', '#e3170d', '#800000'],
    'OCEAN': ['#00bfff', '#1e90ff', '#00ced1', '#4169e1'],
    'FOREST': ['#32cd32', '#228b22', '#00fa9a', '#2e8b57'],
    'ICE': ['#e0ffff', '#afeeee', '#f0ffff', '#b0e0e6'],
    'GAS': ['#dda0dd', '#ba55d3', '#ffd700', '#ff69b4'],
    'DESERT': ['#f4a460', '#d2691e', '#cd853f', '#ffd700']
  };

  // 如果是特定类型，随机从色板中选一个混合
  for (const key in palette) {
    if (type.toUpperCase().includes(key)) {
       const colors = palette[key];
       return colors[Math.floor(Math.random() * colors.length)];
    }
  }
  return hex; // 默认返回 AI 的颜色
};

export const generateAdvancedSystem = async (systemId: string, position: {x: number, y: number, z: number}): Promise<CelestialBodyData> => {
  // Prompt 重点强调视觉多样性和非灰度
  const prompt = `
    你是一个科幻视觉艺术总监和天体物理学家。请设计一个视觉震撼的、位于银河系边缘的恒星系统。
    
    设计要求：
    1. **拒绝单调**：恒星和行星的颜色必须高饱和度、鲜艳、具有科幻感（如霓虹蓝、岩浆红、剧毒绿、紫罗兰）。**严禁使用灰色、暗淡的颜色**。
    2. **多样性**：行星类型必须包含以下至少三种：气态巨行星 (Gas Giant)、熔岩行星 (Lava Planet)、海洋行星 (Ocean World)、冰封星球 (Ice World)、水晶星球 (Crystal Planet)。
    3. **主恒星**：设计一颗非黄色的恒星（如蓝超巨星、红矮星、双子脉冲星）。
    
    返回 JSON 格式:
    {
      "star": { "name", "description", "color" (HEX), "typeLabel" (e.g. "Blue Giant") },
      "planets": [
        { 
          "name", 
          "description", 
          "color" (HEX, VIBRANT!), 
          "visualType" (e.g. "GAS", "LAVA", "OCEAN", "ICE", "ROCK"),
          "hasRings" (bool)
        }
      ],
      "asteroidBelt": { "hasBelt": bool }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            star: {
               type: Type.OBJECT,
               properties: {
                 name: { type: Type.STRING },
                 description: { type: Type.STRING },
                 color: { type: Type.STRING },
                 typeLabel: { type: Type.STRING }
               },
               required: ["name", "description", "color", "typeLabel"]
            },
            planets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    color: { type: Type.STRING },
                    visualType: { type: Type.STRING },
                    hasRings: { type: Type.BOOLEAN }
                },
                required: ["name", "description", "color", "visualType", "hasRings"]
              }
            },
            asteroidBelt: {
                type: Type.OBJECT,
                properties: { hasBelt: { type: Type.BOOLEAN } },
                required: ["hasBelt"]
            }
          },
          required: ["star", "planets", "asteroidBelt"]
        }
      }
    });

    if (!response.text) throw new Error("AI response empty");

    const data = JSON.parse(response.text);
    
    // === 核心优化逻辑：程序化重算轨道与比例 ===
    
    // 1. 恒星：确保足够大
    const starRadius = 12 + Math.random() * 8; // 12 - 20

    // 2. 行星：根据类型分配物理尺寸 (radius)
    // 避免所有行星一样大，气态巨行星必须明显巨大
    const children: CelestialBodyData[] = data.planets.map((p: any, index: number) => {
        let baseRadius = 2.0;
        const typeUpper = p.visualType.toUpperCase();
        
        if (typeUpper.includes('GAS') || typeUpper.includes('GIANT')) {
            baseRadius = 6.0 + Math.random() * 3.0; // 6-9
        } else if (typeUpper.includes('DWARF') || typeUpper.includes('MOON')) {
            baseRadius = 1.2 + Math.random() * 0.5; // 1.2-1.7
        } else {
            baseRadius = 2.5 + Math.random() * 1.5; // 2.5-4.0 (Standard Earth-like/Lava/Ice)
        }

        // 3. 轨道：使用递增算法，确保不拥挤
        // 这里的逻辑是：第一颗星在 35-45，之后每颗星增加 (30 + 半径因子)
        // 越远的行星轨道越宽
        const orbitBase = 40 + (index * 35) + (index * index * 5); 
        const orbitSpeed = 2.0 / Math.sqrt(orbitBase / 20); // 模拟开普勒定律，越远越慢

        return {
            id: `${systemId}_planet_${index}`,
            name: p.name,
            type: CelestialType.PLANET,
            description: p.description,
            color: enhanceColor(p.color, p.visualType), // 颜色增强
            radius: baseRadius,
            rotationSpeed: 0.005 + Math.random() * 0.03,
            orbit: {
                radius: orbitBase,
                speed: orbitSpeed,
                tilt: (Math.random() * 15) - 7.5,
                offset: Math.random() * 10
            },
            ringConfig: p.hasRings ? {
                innerRadius: baseRadius * 1.4,
                outerRadius: baseRadius * 2.2,
                color: p.color, // 环的颜色跟随行星
                opacity: 0.7
            } : undefined,
            ecosystemDetails: {
                atmosphere: "等待探测...",
                terrain: "未知地貌",
                lifeform: "扫描中...",
                resources: "未评估",
                analyzed: false
            }
        };
    });

    // 组装陨石带
    // 通常放在内行星和外行星之间，或者最外围
    // 这里简单处理：如果有，放在第3和第4颗行星之间，或者最外层
    let asteroidBeltConfig = undefined;
    if (data.asteroidBelt.hasBelt) {
        const beltIndex = Math.min(2, children.length - 1); 
        const innerOrbit = children[beltIndex]?.orbit?.radius || 60;
        const outerOrbit = children[beltIndex + 1]?.orbit?.radius || (innerOrbit + 50);
        
        asteroidBeltConfig = {
            minRadius: innerOrbit + 15,
            maxRadius: outerOrbit - 15,
            count: 1500
        };
        // 如果计算出的空间太小，推到最外层
        if (asteroidBeltConfig.maxRadius <= asteroidBeltConfig.minRadius) {
            const lastOrbit = children[children.length - 1].orbit!.radius;
            asteroidBeltConfig = {
                minRadius: lastOrbit + 20,
                maxRadius: lastOrbit + 50,
                count: 2000
            };
        }
    }

    // 组装最终系统
    const systemRoot: CelestialBodyData = {
        id: systemId,
        name: data.star.name,
        type: CelestialType.STAR,
        description: `[${data.star.typeLabel}] ${data.star.description}`,
        color: data.star.color,
        radius: starRadius,
        emissive: true,
        rotationSpeed: 0.002,
        orbit: null,
        children: children,
        asteroidBelt: asteroidBeltConfig,
    };

    return systemRoot;

  } catch (error) {
    console.error("Advanced System generation failed", error);
    // Fallback
    return {
        id: systemId,
        name: `深空异常区 ${systemId.slice(0,4)}`,
        type: CelestialType.STAR,
        description: "传感器受到严重干扰，视觉成像模糊。",
        color: "#ff00ff",
        radius: 10,
        emissive: true,
        rotationSpeed: 0.01,
        orbit: null,
        children: []
    };
  }
};
