import { GoogleGenAI, Type } from "@google/genai";
import { CelestialType } from "../types";
import { getApiKey } from "./apiKeyManager";

const modelId = 'gemini-2.5-flash';

// 动态获取 AI 实例
const getAI = () => {
    const key = getApiKey();
    if (!key) throw new Error("API Key missing");
    return new GoogleGenAI({ apiKey: key });
};

export const generateEcosystemDetails = async (planetName: string, basicDesc: string) => {
  try {
    const ai = getAI();
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
    throw new Error("No text response");
  } catch (error) {
    console.error("Gemini generation failed:", error);
    return {
      atmosphere: "数据链路中断，需配置 API Key...",
      terrain: "传感器离线...",
      lifeform: "未检测到信号...",
      resources: "等待授权..."
    };
  }
};

export const generateNewPlanetData = async (existingCount: number) => {
  try {
    const ai = getAI();
    const prompt = `
      请创造一个新的、独特的太阳系外围天体。
      规则：
      1. 轨道半径必须大于 ${150 + existingCount * 25} AU
      2. 设计必须富有创意（例如：流浪行星、被捕获的黑洞伴星、水晶星球、气态矮星等）
      返回JSON: name, description, color, radius, rotationSpeed, orbitRadius, orbitSpeed, hasRings
    `;

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
          tilt: (Math.random() * 20) - 10, 
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
    return null;
  } catch (error) {
    console.error("Planet generation failed", error);
    return null;
  }
};

export const generateCosmicEvent = async () => {
  try {
    const ai = getAI();
    const prompt = `生成一个发生在深空的即时随机中文事件(anomaly, discovery, signal, meteor)。返回JSON: title, description, type`;
    
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
    
    if (response.text) return JSON.parse(response.text);
    return null;
  } catch (e) {
    return null;
  }
};