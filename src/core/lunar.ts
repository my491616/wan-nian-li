// 農曆轉換核心
// 使用 lunar-javascript 庫

// 農曆月份中文
export const LUNAR_MONTHS = [
  '正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '冬月', '臘月'
];

// 農曆日期中文
export const LUNAR_DAYS = [
  '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
  monthStr: string;
  dayStr: string;
  displayStr: string; // 在格子內顯示的簡短文字
}

// 使用 lunar-javascript 庫進行轉換
// 此函數在運行時動態調用庫
export function getLunarDate(year: number, month: number, day: number): LunarDate {
  try {
    // @ts-ignore - lunar-javascript 是 CommonJS 模組
    const { Lunar, Solar } = window.__lunar__ || {};
    if (Lunar && Solar) {
      const solar = Solar.fromYmd(year, month, day);
      const lunar = solar.getLunar();
      const lMonth = lunar.getMonth();
      const lDay = lunar.getDay();
      const isLeap = lunar.isLeap();
      
      const monthStr = (isLeap ? '閏' : '') + LUNAR_MONTHS[Math.abs(lMonth) - 1];
      const dayStr = LUNAR_DAYS[lDay];
      
      return {
        year: lunar.getYear(),
        month: lMonth,
        day: lDay,
        isLeap,
        monthStr,
        dayStr,
        displayStr: lDay === 1 ? monthStr : dayStr,
      };
    }
  } catch (e) {
    // fallback
  }
  
  // Fallback：簡易農曆估算（僅供顯示，不精確）
  return computeLunarFallback(year, month, day);
}

// 簡易農曆估算 fallback
function computeLunarFallback(year: number, month: number, day: number): LunarDate {
  // 農曆新年大約的陽曆日期（近似值）
  const lunarNewYear: Record<number, [number, number]> = {
    2020: [1, 25], 2021: [2, 12], 2022: [2, 1], 2023: [1, 22],
    2024: [2, 10], 2025: [1, 29], 2026: [2, 17], 2027: [2, 6],
    2028: [1, 26], 2029: [2, 13], 2030: [2, 3],
  };
  
  const newYear = lunarNewYear[year] || [2, 5];
  const newYearDate = new Date(year, newYear[0] - 1, newYear[1]);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.round((targetDate.getTime() - newYearDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let lMonth: number;
  let lDay: number;
  
  if (diffDays < 0) {
    // 前一年農曆
    const prevNewYear = lunarNewYear[year - 1] || [2, 5];
    const prevNY = new Date(year - 1, prevNewYear[0] - 1, prevNewYear[1]);
    const diffFromPrev = Math.round((targetDate.getTime() - prevNY.getTime()) / (1000 * 60 * 60 * 24));
    lMonth = Math.floor(diffFromPrev / 29.5) + 1;
    lDay = (diffFromPrev % 30) + 1;
  } else {
    lMonth = Math.floor(diffDays / 29.5) + 1;
    lDay = (diffDays % 30) + 1;
  }
  
  lMonth = Math.max(1, Math.min(12, lMonth));
  lDay = Math.max(1, Math.min(30, lDay));
  
  const monthStr = LUNAR_MONTHS[lMonth - 1] || '正月';
  const dayStr = LUNAR_DAYS[lDay] || '初一';
  
  return {
    year,
    month: lMonth,
    day: lDay,
    isLeap: false,
    monthStr,
    dayStr,
    displayStr: lDay === 1 ? monthStr : dayStr,
  };
}
