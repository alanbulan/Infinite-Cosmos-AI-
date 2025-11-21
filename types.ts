
// 定义天体类型
export enum CelestialType {
  STAR = 'STAR',
  PLANET = 'PLANET',
  MOON = 'MOON',
  ASTEROID = 'ASTEROID',
  STATION = 'STATION'
}

// 轨道参数
export interface OrbitData {
  radius: number; // 距离父天体的距离 (AU 或相对单位)
  speed: number;  // 公转速度
  tilt: number;   // 轨道倾角 (degrees)
  offset: number; // 初始相位偏移
}

export interface RingConfig {
  innerRadius: number;
  outerRadius: number;
  color: string;
  opacity: number;
}

export interface AsteroidBeltConfig {
  minRadius: number;
  maxRadius: number;
  count: number;
}

// 天体基础数据
export interface CelestialBodyData {
  id: string;
  name: string; // 恒星/天体本身的名称
  systemName?: string; // 新增：星系整体的名称 (例如：太阳系 vs 太阳)
  type: CelestialType;
  description: string; // 简短描述
  color: string;
  radius: number; // 天体自身半径
  orbit: OrbitData | null; // 如果是恒星（根节点），轨道可以为 null
  textureUrl?: string; // 可选纹理
  children?: CelestialBodyData[]; // 子天体 (卫星等)
  emissive?: boolean; // 是否发光 (恒星)
  rotationSpeed: number; // 自转速度
  ringConfig?: RingConfig; // 新增：行星环配置
  asteroidBelt?: AsteroidBeltConfig; // 新增：该星系内的陨石带配置
  
  // 生态/细节数据 (AI 生成后填充)
  ecosystemDetails?: {
    atmosphere: string;
    terrain: string;
    lifeform: string;
    resources: string;
    analyzed: boolean;
  };
}

// 模拟参数上下文
export interface SimulationSettings {
  timeScale: number; // 时间流逝速度
  orbitScale: number; // 轨道显示比例
  bodyScale: number; // 天体大小比例 (不再由用户控制，内部固定优化值)
  quality: 'LOW' | 'MEDIUM' | 'HIGH'; // 新增：画质设置
  showOrbits: boolean;
  showLabels: boolean; 
  paused: boolean;
}

// 选中状态
export interface SelectionState {
  selectedBodyId: string | null;
  focusMode: boolean; // 是否锁定摄像机跟随
}

// 随机事件
export interface CosmicEvent {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  type: 'anomaly' | 'discovery' | 'signal' | 'meteor';
}
