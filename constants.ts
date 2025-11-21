import { CelestialBodyData, CelestialType } from './types';

// 基础太阳系数据
// 注意：为了视觉效果，距离和大小并非严格按真实比例，而是采用对数或视觉优化后的比例
export const SOLAR_SYSTEM_ROOT: CelestialBodyData = {
  id: 'sun',
  name: '太阳',
  type: CelestialType.STAR,
  description: '太阳系的中心恒星，通过核聚变产生巨大的能量，维系着整个星系的引力平衡。',
  color: '#FDB813',
  radius: 5, // 视觉半径
  emissive: true,
  rotationSpeed: 0.002,
  orbit: null,
  children: [
    {
      id: 'mercury',
      name: '水星',
      type: CelestialType.PLANET,
      description: '太阳系中最小且最靠近太阳的行星。表面温差极大，布满陨石坑。',
      color: '#A5A5A5',
      radius: 0.8,
      rotationSpeed: 0.01,
      orbit: { radius: 10, speed: 1.5, tilt: 7, offset: 0 },
    },
    {
      id: 'venus',
      name: '金星',
      type: CelestialType.PLANET,
      description: '被浓厚的二氧化碳大气层包裹，温室效应极其严重，表面温度极高。',
      color: '#E3BB76',
      radius: 1.8,
      rotationSpeed: 0.005,
      orbit: { radius: 15, speed: 1.2, tilt: 3.4, offset: 2 },
    },
    {
      id: 'earth',
      name: '地球',
      type: CelestialType.PLANET,
      description: '我们的家园，拥有液态水和丰富生命的蓝色星球。',
      color: '#22A6B3',
      radius: 2,
      rotationSpeed: 0.02,
      orbit: { radius: 22, speed: 1.0, tilt: 0, offset: 4 },
      children: [
        {
          id: 'moon',
          name: '月球',
          type: CelestialType.MOON,
          description: '地球唯一的天然卫星，对地球潮汐有重要影响。',
          color: '#DDDDDD',
          radius: 0.5,
          rotationSpeed: 0.01,
          orbit: { radius: 4, speed: 3, tilt: 5, offset: 0 }
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
      orbit: { radius: 32, speed: 0.8, tilt: 1.85, offset: 1 },
    },
    {
      id: 'jupiter',
      name: '木星',
      type: CelestialType.PLANET,
      description: '太阳系最大的行星，巨大的气态巨行星，拥有标志性的大红斑风暴。',
      color: '#C88B3A',
      radius: 4.5,
      rotationSpeed: 0.05,
      orbit: { radius: 55, speed: 0.4, tilt: 1.3, offset: 3 },
    },
    {
      id: 'saturn',
      name: '土星',
      type: CelestialType.PLANET,
      description: '以其壮观的行星环系统而闻名，是一颗低密度的气态巨行星。',
      color: '#E4D5B6',
      radius: 4,
      rotationSpeed: 0.045,
      orbit: { radius: 75, speed: 0.3, tilt: 2.5, offset: 5 },
    },
     {
      id: 'uranus',
      name: '天王星',
      type: CelestialType.PLANET,
      description: '冰巨星，大气中含有甲烷使其呈现青色，自转轴几乎躺在轨道面上。',
      color: '#ACE5EE',
      radius: 3,
      rotationSpeed: 0.03,
      orbit: { radius: 95, speed: 0.2, tilt: 0.8, offset: 1.5 },
    },
    {
      id: 'neptune',
      name: '海王星',
      type: CelestialType.PLANET,
      description: '距离太阳最远的行星，拥有强烈的风暴和深蓝色的大气。',
      color: '#3E54E8',
      radius: 2.9,
      rotationSpeed: 0.032,
      orbit: { radius: 110, speed: 0.18, tilt: 1.8, offset: 4.2 },
    }
  ]
};