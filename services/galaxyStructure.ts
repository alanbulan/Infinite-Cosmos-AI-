
import * as THREE from 'three';

// 生成更自然、不规则的星系结构
export const generateIrregularGalaxyPoints = (count: number, knownSystemIds: string[]) => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const ids: string[] = [];

  const coreColor = new THREE.Color('#ffaa00'); // 核心偏黄/红
  const armColor = new THREE.Color('#00ffff');  // 旋臂偏蓝青
  const dustColor = new THREE.Color('#8a2be2'); // 尘埃偏紫

  for (let i = 0; i < count; i++) {
    // 1. 核心区域黑洞 (中心留空)
    // 随机分布算法：混合螺旋 + 随机团簇
    const branchCount = 5; // 更多的旋臂，显得杂乱
    const branchAngle = (i % branchCount) * ((2 * Math.PI) / branchCount);
    
    // 半径分布：中心有空洞 (Black Hole Horizon)，外围衰减
    // 使用指数分布让中心密集，但强制偏移掉最中心
    let radius = 40 + Math.pow(Math.random(), 1.5) * 600; 
    
    // 加上大量随机扰动，破坏完美螺旋
    const randomness = Math.random() * 100;
    const angleRandom = (Math.random() - 0.5) * 1.5;
    
    const spinAngle = radius * 0.005; 
    
    const currentAngle = branchAngle + spinAngle + angleRandom;

    const x = Math.cos(currentAngle) * radius + (Math.random()-0.5) * randomness;
    const z = Math.sin(currentAngle) * radius + (Math.random()-0.5) * randomness;
    
    // 垂直分布：越靠外越厚，中心较扁但有球状核
    const verticalSpread = (radius < 100 ? 30 : 10 + radius * 0.15);
    const y = (Math.random() - 0.5) * verticalSpread;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // 颜色逻辑
    const mixedColor = new THREE.Color();
    if (radius < 150) {
        mixedColor.copy(coreColor).lerp(dustColor, Math.random() * 0.5);
    } else {
        mixedColor.copy(armColor).lerp(dustColor, Math.random());
    }
    
    // ID 生成
    const isSun = i === 0;
    ids.push(isSun ? 'sun' : `system_${i}`);

    // 强制覆盖太阳位置
    if (isSun) {
        positions[0] = 180; positions[1] = 10; positions[2] = 50; // 放在旋臂外侧
        mixedColor.set('#ffcc00');
        sizes[i] = 25.0;
    } else if (knownSystemIds.includes(ids[i])) {
        sizes[i] = 15.0;
        mixedColor.set('#00ff00');
    } else {
        sizes[i] = Math.random() * 3.0 + 1.0;
    }

    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
  }

  return { positions, colors, sizes, ids };
};
