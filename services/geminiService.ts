
import { GoogleGenAI, Type } from "@google/genai";
import { CelestialType } from "../types";

// 初始化 Gemini 客户端
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = 'gemini-2.5-flash';

export const generateEcosystemDetails = async (planetName: string, basicDesc: string) => {
  const prompt = `
    你是一个科幻天体生物学家和地质学家。请根据以下信息，为这个星球生成详细的生态报告。
    星球名称: ${planetName}
    基础描述: ${basicDesc}
    
    请用中文输出，包含以下四个维度：
    1. 大气成分与气候 (atmosphere) - 描述详细的化学成分和气象活动
    2. 地表地貌特征 (terrain) - 描述独特的地理结构
    3. 可能存在的生命形式 (lifeform) - 即使是恶劣环境，也可以描述微观生命或能量生命
    4. 潜在资源与开采价值 (resources) - 稀有矿物或能源
    
    请发挥想象力，基于科学推测进行硬科幻风格扩展。
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
            atmosphere: { type: Type.STRING },
            terrain: { type: Type.STRING },
            lifeform: { type: Type.STRING },
            resources: { type: Type.STRING },
          },
          required: ["atmosphere", "terrain", "lifeform", "resources"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No text response from Gemini");
  } catch (error) {
    console.error("Gemini generation failed:", error);
    return {
      atmosphere: "数据链路中断，无法分析大气成分...",
      terrain: "传感器受阻，地表扫描失败...",
      lifeform: "未检测到生命信号...",
      resources: "光谱分析仪校准中..."
    };
  }
};

// 生成新的行星数据
export const generateNewPlanetData = async (existingCount: number) => {
  const prompt = `
    请创造一个新的、独特的太阳系外围天体。
    
    规则：
    1. 轨道半径必须大于 ${150 + existingCount * 25} AU
    2. 设计必须富有创意（例如：流浪行星、被捕获的黑洞伴星、水晶星球、气态矮星等）
    
    返回JSON:
    - name: 名称 (中文，富有史诗感)
    - description: 简短描述 (30字以内)
    - color: 十六进制颜色
    - radius: 半径 (1.0 - 6.0)
    - rotationSpeed: (0.001 - 0.05)
    - orbitRadius: (计算好的距离)
    - orbitSpeed: (计算好的速度，越远越慢)
    - hasRings: boolean (是否有环)
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
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            color: { type: Type.STRING },
            radius: { type: Type.NUMBER },
            rotationSpeed: { type: Type.NUMBER },
            orbitRadius: { type: Type.NUMBER },
            orbitSpeed: { type: Type.NUMBER },
            hasRings: { type: Type.BOOLEAN }
          },
          required: ["name", "description", "color", "radius", "rotationSpeed", "orbitRadius", "orbitSpeed", "hasRings"]
        }
      }
    });
    
    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        id: `generated_${Date.now()}`,
        type: CelestialType.PLANET,
        name: data.name,
        description: data.description,
        color: data.color,
        radius: data.radius,
        rotationSpeed: data.rotationSpeed,
        orbit: {
          radius: data.orbitRadius,
          speed: data.orbitSpeed,
          tilt: (Math.random() * 20) - 10, // 随机倾角大一点
          offset: Math.random() * 10
        },
        ringConfig: data.hasRings ? {
            innerRadius: data.radius * 1.4,
            outerRadius: data.radius * 2.2,
            color: data.color,
            opacity: 0.6
        } : undefined
      };
    }
    throw new Error("Failed to generate planet");
  } catch (error) {
    console.error("Planet generation failed", error);
    return null;
  }
};

// 生成随机宇宙事件
export const generateCosmicEvent = async () => {
  const prompt = `
    生成一个发生在深空的即时随机事件。
    类型可以是:
    - anomaly (空间异常)
    - discovery (新发现)
    - signal (神秘信号)
    - meteor (流星群/彗星)
    
    返回JSON:
    - title: 标题 (如：英仙座流星暴、空间折叠震荡)
    - description: 内容 (一句话，科幻风格)
    - type: enum string
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
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["anomaly", "discovery", "signal", "meteor"] }
          }
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (e) {
    return null;
  }
};
