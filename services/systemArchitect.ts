
import { GoogleGenAI, Type } from "@google/genai";
import { CelestialBodyData, CelestialType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = 'gemini-2.5-flash';

// 一次性生成整个星系结构的架构师服务
export const generateCompleteSystem = async (systemId: string, position: {x: number, y: number, z: number}): Promise<CelestialBodyData> => {
  const prompt = `
    你是一个高级天体物理模拟AI。请为一个位于银河系深处的新的恒星系统构建完整的数据模型。
    
    要求：
    1. 设计一颗独特的主恒星（可以是红矮星、蓝巨星、中子星等）。
    2. 设计 3-7 颗围绕它的行星，每颗行星必须有独特的特征（轨道、颜色、类型）。
    3. (可选) 决定是否需要一个小行星带 (Asteroid Belt)。
    4. 所有名称必须是中文，富有科幻史诗感或神话色彩。
    
    返回严格的 JSON 格式:
    {
      "star": { "name", "description", "color", "radius" (2-15), "rotationSpeed" },
      "planets": [
        { "name", "description", "color", "radius" (0.5-5), "orbitRadius" (20-150), "orbitSpeed", "hasRings" (bool) }
      ],
      "asteroidBelt": { "hasBelt": bool, "minRadius", "maxRadius" }
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
                 radius: { type: Type.NUMBER },
                 rotationSpeed: { type: Type.NUMBER }
               },
               required: ["name", "description", "color", "radius", "rotationSpeed"]
            },
            planets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    color: { type: Type.STRING },
                    radius: { type: Type.NUMBER },
                    orbitRadius: { type: Type.NUMBER },
                    orbitSpeed: { type: Type.NUMBER },
                    hasRings: { type: Type.BOOLEAN }
                },
                required: ["name", "description", "color", "radius", "orbitRadius", "orbitSpeed", "hasRings"]
              }
            },
            asteroidBelt: {
                type: Type.OBJECT,
                properties: {
                    hasBelt: { type: Type.BOOLEAN },
                    minRadius: { type: Type.NUMBER },
                    maxRadius: { type: Type.NUMBER }
                },
                required: ["hasBelt", "minRadius", "maxRadius"]
            }
          },
          required: ["star", "planets", "asteroidBelt"]
        }
      }
    });

    if (!response.text) throw new Error("AI response empty");

    const data = JSON.parse(response.text);
    
    // 组装行星数据
    const children: CelestialBodyData[] = data.planets.map((p: any, index: number) => ({
        id: `${systemId}_planet_${index}`,
        name: p.name,
        type: CelestialType.PLANET,
        description: p.description,
        color: p.color,
        radius: p.radius,
        rotationSpeed: 0.01 + Math.random() * 0.02,
        orbit: {
            radius: p.orbitRadius,
            speed: p.orbitSpeed,
            tilt: (Math.random() * 10) - 5,
            offset: Math.random() * 10
        },
        ringConfig: p.hasRings ? {
            innerRadius: p.radius * 1.3,
            outerRadius: p.radius * 2.0,
            color: p.color,
            opacity: 0.5
        } : undefined
    }));

    // 组装陨石带配置
    const asteroidBeltConfig = data.asteroidBelt.hasBelt ? {
        minRadius: data.asteroidBelt.minRadius,
        maxRadius: data.asteroidBelt.maxRadius,
        count: 1000
    } : undefined;

    // 组装最终系统根节点
    const systemRoot: CelestialBodyData = {
        id: systemId,
        name: data.star.name,
        type: CelestialType.STAR,
        description: data.star.description,
        color: data.star.color,
        radius: data.star.radius,
        emissive: true,
        rotationSpeed: data.star.rotationSpeed,
        orbit: null,
        children: children,
        asteroidBelt: asteroidBeltConfig,
        ecosystemDetails: {
            atmosphere: "恒星大气",
            terrain: "等离子态",
            lifeform: "无",
            resources: "极高能级",
            analyzed: true
        }
    };

    return systemRoot;

  } catch (error) {
    console.error("System generation failed", error);
    // Fallback
    return {
        id: systemId,
        name: `未知星系 ${systemId.slice(0,4)}`,
        type: CelestialType.STAR,
        description: "数据解析失败，显示默认星系模型。",
        color: "#ff0000",
        radius: 5,
        emissive: true,
        rotationSpeed: 0.01,
        orbit: null,
        children: []
    };
  }
};
