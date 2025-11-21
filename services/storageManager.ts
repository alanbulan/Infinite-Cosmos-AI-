
import { CelestialBodyData } from '../types';
import { SOLAR_SYSTEM_ROOT } from '../constants';

const STORAGE_KEY = 'infinite-cosmos-systems-v2';

// 加载已保存的宇宙状态
export const loadUniverseState = (): Record<string, CelestialBodyData> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // 确保太阳系始终存在且数据是最新的 (防止旧数据覆盖关键常量结构)
      if (!parsed['sun']) {
        parsed['sun'] = { ...SOLAR_SYSTEM_ROOT };
      } else {
        // 兼容旧数据，补全 systemName
        if (!parsed['sun'].systemName) parsed['sun'].systemName = '太阳系';
      }
      
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load universe state:", e);
  }
  // 默认状态
  return { 'sun': { ...SOLAR_SYSTEM_ROOT } };
};

// 保存当前宇宙状态
export const saveUniverseState = (systems: Record<string, CelestialBodyData>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(systems));
  } catch (e) {
    console.error("Failed to save universe state:", e);
  }
};
