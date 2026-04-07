// 日期工具函數

export function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseDate(dateStr: string): { year: number; month: number; day: number } | null {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return {
    year: parseInt(match[1]),
    month: parseInt(match[2]),
    day: parseInt(match[3]),
  };
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  let m = month - 1 + delta;
  let y = year + Math.floor(m / 12);
  m = ((m % 12) + 12) % 12;
  return { year: y, month: m + 1 };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// 中文星期
export const WEEKDAY_ZH = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

// 農曆節日（固定農曆日期）
export const LUNAR_FESTIVALS: Record<string, string> = {
  '1-1': '春節',
  '1-15': '元宵節',
  '5-5': '端午節',
  '7-7': '七夕',
  '7-15': '中元節',
  '8-15': '中秋節',
  '9-9': '重陽節',
  '12-30': '除夕',
  '12-29': '除夕',
};

// 國定節日（陽曆）
export const SOLAR_FESTIVALS: Record<string, string> = {
  '1-1': '元旦',
  '2-14': '情人節',
  '3-8': '婦女節',
  '4-4': '兒童節',
  '4-5': '清明節',
  '5-1': '勞動節',
  '5-9': '母親節', // 第二個週日，此處簡化
  '6-18': '父親節',
  '10-10': '國慶日',
  '12-25': '聖誕節',
};

export function getLunarFestival(lunarMonth: number, lunarDay: number): string | null {
  return LUNAR_FESTIVALS[`${lunarMonth}-${lunarDay}`] || null;
}

export function getSolarFestival(month: number, day: number): string | null {
  return SOLAR_FESTIVALS[`${month}-${day}`] || null;
}
