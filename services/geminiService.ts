import { GoogleGenAI, Type } from "@google/genai";

// 初始化 Gemini 客户端
// 注意：在实际生产中，API Key 应该在服务端处理，或者用户自行输入。这里遵循 Demo 要求使用 process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEcosystemDetails = async (planetName: string, basicDesc: string) => {
  const modelId = 'gemini-2.5-flash';
  
  const prompt = `
    你是一个科幻天体生物学家和地质学家。请根据以下信息，为这个星球生成详细的生态报告。
    星球名称: ${planetName}
    基础描述: ${basicDesc}
    
    请用中文输出，包含以下四个维度：
    1. 大气成分与气候 (atmosphere)
    2. 地表地貌特征 (terrain)
    3. 可能存在的生命形式 (lifeform) - 如果是气态行星或恒星，描述其能量流动或奇异物理现象
    4. 潜在资源与开采价值 (resources)
    
    请发挥想象力，基于科学推测进行适度科幻扩展。
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