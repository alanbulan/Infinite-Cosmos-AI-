
import { GoogleGenAI, Type } from "@google/genai";
import { CelestialBodyData, CelestialType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = 'gemini-2.5-flash';

// 生成一个新的恒星系统（根节点）
export const generateStarSystem = async (id: string, position: {x: number, y: number, z: number}) => {
  const prompt = `
    你是一个天体物理学家。请创造一个新的恒星系统的主恒星。
    这个恒星位于银河系的某个旋臂上。
    
    请随机决定它的类型（例如：红矮星、蓝巨星、双星系统主星、脉冲星、白矮星等）。
    
    返回JSON:
    - name: 恒星名字 (中文，富有神话或科幻感)
    - description: 恒星描述 (30字以内)
    - color: 恒星光色 (Hex)
    - radius: 恒星半径 (基于太阳=8的相对值，范围 2-20)
    - type: "STAR"
    - rotationSpeed: 自转速度
    - temperature: 表面温度描述 (string)
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
            temperature: { type: Type.STRING }
          },
          required: ["name", "description", "color", "radius", "rotationSpeed"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      
      // 构建恒星数据结构
      const starSystem: CelestialBodyData = {
        id: id, // 使用GalaxyMap传递的唯一ID
        name: data.name,
        type: CelestialType.STAR,
        description: data.description,
        color: data.color,
        radius: data.radius,
        emissive: true,
        rotationSpeed: data.rotationSpeed,
        orbit: null, // 恒星没有相对于系统的轨道（它是中心）
        children: [], // 初始没有行星，可以在进入后通过"添加行星"功能生成
        ecosystemDetails: {
            atmosphere: "恒星日冕层",
            terrain: "等离子体海洋",
            lifeform: "无已知碳基生命",
            resources: "核聚变燃料",
            analyzed: true
        }
      };
      return starSystem;
    }
    throw new Error("AI response empty");
  } catch (error) {
    console.error("Star generation failed", error);
    // Fallback generator
    return {
      id: id,
      name: `未知恒星 ${id.substring(0,4)}`,
      type: CelestialType.STAR,
      description: "一颗未被记录的深空恒星，散发着神秘的光芒。",
      color: "#ffaa00",
      radius: 6,
      emissive: true,
      rotationSpeed: 0.005,
      orbit: null,
      children: []
    };
  }
};
