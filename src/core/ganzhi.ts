// 天干地支核心計算

export const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const SHENGXIAO = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];

export const WUXING: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火',
  '戊': '土', '己': '土', '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 年干支：以1984甲子年為基準
export function getYearGanzhi(year: number): { gan: string; zhi: string; ganzhi: string } {
  const base = 1984; // 甲子年
  const offset = ((year - base) % 60 + 60) % 60;
  const gan = TIANGAN[offset % 10];
  const zhi = DIZHI[offset % 12];
  return { gan, zhi, ganzhi: gan + zhi };
}

// 生肖
export function getShengxiao(year: number): string {
  const idx = ((year - 4) % 12 + 12) % 12;
  return SHENGXIAO[idx];
}

// 月干支：根據年干和月份（中氣月份計算）
export function getMonthGanzhi(year: number, month: number): { gan: string; zhi: string; ganzhi: string } {
  // 月支固定：1月=寅(index 2), 依序排列
  const zhiIndex = ((month + 1) % 12);
  const zhi = DIZHI[zhiIndex];

  // 月干：根據年干決定起始
  const yearGan = getYearGanzhi(year).gan;
  const yearGanIndex = TIANGAN.indexOf(yearGan);
  // 甲己年起丙寅，乙庚年起戊寅，丙辛年起庚寅，丁壬年起壬寅，戊癸年起甲寅
  const monthGanBase = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  const baseGanIndex = monthGanBase[yearGanIndex];
  const ganIndex = (baseGanIndex + month - 1) % 10;
  const gan = TIANGAN[ganIndex];

  return { gan, zhi, ganzhi: gan + zhi };
}

// 日干支：以2000年1月1日為甲戌日(index=50)計算
export function getDayGanzhi(year: number, month: number, day: number): { gan: string; zhi: string; ganzhi: string } {
  const baseDate = new Date(2000, 0, 1); // 甲戌日，index 50
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.round((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const index = ((50 + diffDays) % 60 + 60) % 60;
  const gan = TIANGAN[index % 10];
  const zhi = DIZHI[index % 12];
  return { gan, zhi, ganzhi: gan + zhi };
}

// 時干支：根據日干和小時
export function getHourGanzhi(dayGan: string, hour: number): { gan: string; zhi: string; ganzhi: string } {
  // 時支：子(23-1), 丑(1-3), ..., 亥(21-23)
  const hourZhiIndex = Math.floor((hour + 1) / 2) % 12;
  const zhi = DIZHI[hourZhiIndex];

  // 時干：根據日干決定子時干支
  const dayGanIndex = TIANGAN.indexOf(dayGan);
  // 甲己日子時起甲子，乙庚日子時起丙子，丙辛日子時起戊子，丁壬日子時起庚子，戊癸日子時起壬子
  const hourGanBase = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  const baseGanIndex = hourGanBase[dayGanIndex];
  const ganIndex = (baseGanIndex + hourZhiIndex) % 10;
  const gan = TIANGAN[ganIndex];

  return { gan, zhi, ganzhi: gan + zhi };
}

// 取得五行屬性
export function getWuxing(char: string): string {
  return WUXING[char] || '';
}
