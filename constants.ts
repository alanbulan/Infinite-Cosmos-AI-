import { CelestialBodyData, CelestialType } from './types';

// 基础太阳系数据
// 注意：为了视觉效果，距离和大小并非严格按真实比例，而是采用对数或视觉优化后的比例
// 更新：大幅调整比例，确保恒星视觉上显著大于行星，且增加了陨石带
export const SOLAR_SYSTEM_ROOT: CelestialBodyData = {
  id: 'sun',
  name: '太阳',
  systemName: '太阳系',
  type: CelestialType.STAR,
  description: '太阳系的中心恒星，通过核聚变产生巨大的能量，维系着整个星系的引力平衡。',
  color: '#FDB813',
  radius: 18, 
  emissive: true,
  rotationSpeed: 0.002,
  orbit: null,
  // 太阳纹理
  textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Map_of_the_full_sun.jpg',
  children: [
    {
      id: 'mercury',
      name: '水星',
      type: CelestialType.PLANET,
      description: '太阳系中最小且最靠近太阳的行星。表面温差极大，布满陨石坑。',
      color: '#A5A5A5',
      radius: 0.8,
      rotationSpeed: 0.01,
      orbit: { radius: 30, speed: 1.2, tilt: 7, offset: 0 },
      textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Mercury_in_color_-_Prockter07_centered.jpg'
    },
    {
      id: 'venus',
      name: '金星',
      type: CelestialType.PLANET,
      description: '被浓厚的二氧化碳大气层包裹，温室效应极其严重，表面温度极高。',
      color: '#E3BB76',
      radius: 1.8,
      rotationSpeed: 0.005,
      orbit: { radius: 45, speed: 0.9, tilt: 3.4, offset: 2 },
      textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg'
    },
    {
      id: 'earth',
      name: '地球',
      type: CelestialType.PLANET,
      description: '我们的家园，拥有液态水和丰富生命的蓝色星球。',
      color: '#22A6B3',
      radius: 2,
      rotationSpeed: 0.02,
      orbit: { radius: 60, speed: 0.7, tilt: 0, offset: 4 },
      // 已修复: 使用更稳定的纹理源，之前的 404 链接已替换
      textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg',
      children: [
        {
          id: 'moon',
          name: '月球',
          type: CelestialType.MOON,
          description: '地球唯一的天然卫星，对地球潮汐有重要影响。',
          color: '#DDDDDD',
          radius: 0.5,
          rotationSpeed: 0.01,
          orbit: { radius: 5, speed: 2.5, tilt: 5, offset: 0 },
          textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg'
        }
      ]
    },
    {
      id: 'mars',
      name: '火星',
      type: CelestialType.PLANET,
      description: '这颗红色星球拥有太阳系最高的火山和巨大的峡谷，是人类探索的重点目标。',
      color: '#E05B35',
      radius: 1.5,
      rotationSpeed: 0.018,
      orbit: { radius: 80, speed: 0.6, tilt: 1.85, offset: 1 },
      textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg'
    },
    {
      id: 'jupiter',
      name: '木星',
      type: CelestialType.PLANET,
      description: '太阳系最大的行星，巨大的气态巨行星，拥有标志性的大红斑风暴。',
      color: '#C88B3A',
      radius: 7.0,
      rotationSpeed: 0.05,
      orbit: { radius: 140, speed: 0.3, tilt: 1.3, offset: 3 },
      textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg'
    },
    {
      id: 'saturn',
      name: '土星',
      type: CelestialType.PLANET,
      description: '以其壮观的行星环系统而闻名，是一颗低密度的气态巨行星。',
      color: '#E4D5B6',
      radius: 6.0,
      rotationSpeed: 0.045,
      orbit: { radius: 190, speed: 0.22, tilt: 2.5, offset: 5 },
      textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Saturn_%28planet%29_large.jpg',
      ringConfig: {
        innerRadius: 8.5,
        outerRadius: 14,
        color: '#C7B48F',
        opacity: 0.8
      }
    },
     {
      id: 'uranus',
      name: '天王星',
      type: CelestialType.PLANET,
      description: '冰巨星，大气中含有甲烷使其呈现青色，自转轴几乎躺在轨道面上。',
      color: '#ACE5EE',
      radius: 4.0,
      rotationSpeed: 0.03,
      orbit: { radius: 240, speed: 0.15, tilt: 0.8, offset: 1.5 },
      textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg',
       ringConfig: {
        innerRadius: 5,
        outerRadius: 7,
        color: '#FFFFFF',
        opacity: 0.3
      }
    },
    {
      id: 'neptune',
      name: '海王星',
      type: CelestialType.PLANET,
      description: '距离太阳最远的行星，拥有强烈的风暴和深蓝色的大气。',
      color: '#3E54E8',
      radius: 3.9,
      rotationSpeed: 0.032,
      orbit: { radius: 290, speed: 0.12, tilt: 1.8, offset: 4.2 },
      textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg'
    }
  ],
  // 添加小行星带配置
  asteroidBelt: {
    minRadius: 95,
    maxRadius: 115,
    count: 2000
  }
};