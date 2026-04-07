// calendar.ts — 月曆核心資料層（最終穩定版）
//
// 修正項目：
//   1. offsetMonth → 改用 new Date(year, month-1+offset, 1) 讓 JS 引擎自動處理進位
//   2. isToday     → 年/月/日 三值比對，消除時區歧義
//   3. 所有 Date 建構均使用 new Date(y, m-1, d) 本地時間形式，禁止字串解析
//   4. 節氣繁體化  → 完整 JIEQI_TC mapping 涵蓋全部 24 節氣

import { Solar } from 'lunar-javascript';

// ─── 節氣繁體對照表 ──────────────────────────────
// lunar-javascript 輸出簡體，這裡統一轉繁體

const JIEQI_TC: Record<string, string> = {
  '小寒': '小寒', '大寒': '大寒',
  '立春': '立春', '雨水': '雨水',
  '惊蛰': '驚蟄', '驚蟄': '驚蟄',
  '春分': '春分',
  '清明': '清明',
  '谷雨': '穀雨', '穀雨': '穀雨',
  '立夏': '立夏',
  '小满': '小滿', '小滿': '小滿',
  '芒种': '芒種', '芒種': '芒種',
  '夏至': '夏至',
  '小暑': '小暑', '大暑': '大暑',
  '立秋': '立秋',
  '处暑': '處暑', '處暑': '處暑',
  '白露': '白露',
  '秋分': '秋分',
  '寒露': '寒露', '霜降': '霜降',
  '立冬': '立冬',
  '小雪': '小雪', '大雪': '大雪',
  '冬至': '冬至',
};

function toTC(jieqi: string): string {
  return JIEQI_TC[jieqi] ?? jieqi;
}

// ─── 農曆中文對照 ────────────────────────────────

const LUNAR_MONTHS = [
  '正月','二月','三月','四月','五月','六月',
  '七月','八月','九月','十月','冬月','臘月',
];

const LUNAR_DAYS = [
  '','初一','初二','初三','初四','初五',
  '初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五',
  '十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五',
  '廿六','廿七','廿八','廿九','三十',
];

// ─── 型別定義 ────────────────────────────────────

export interface LunarInfo {
  year:        number;
  month:       number;   // 負數 = 閏月
  day:         number;
  isLeapMonth: boolean;
  monthStr:    string;   // "二月" / "閏二月"
  dayStr:      string;   // "初一"
  displayStr:  string;   // 格子顯示用
}

export interface GanzhiInfo {
  year:  string;   // "丙午"
  month: string;   // "壬辰"
  day:   string;   // "辛亥"
}

export interface DayCell {
  date:           Date;
  year:           number;
  month:          number;
  day:            number;
  weekday:        number;   // 0=Sun … 6=Sat
  isCurrentMonth: boolean;
  isToday:        boolean;
  isWeekend:      boolean;
  lunar:          LunarInfo;
  ganzhi:         GanzhiInfo;
  shengxiao:      string;
  solarTerm:      string | null;  // 繁體，無節氣為 null
  yi:             string[];
  ji:             string[];
}

// ─── 今日快照（模組載入時取一次，避免每格都 new Date()）──

let _todayY = 0, _todayM = 0, _todayD = 0;

function refreshToday() {
  const t = new Date();
  _todayY = t.getFullYear();
  _todayM = t.getMonth() + 1;
  _todayD = t.getDate();
}
refreshToday();

// 每分鐘更新一次（跨午夜時自動正確）
setInterval(refreshToday, 60_000);

// ─── 單日完整資料計算 ────────────────────────────

export function computeDayData(
  year:           number,
  month:          number,
  day:            number,
  isCurrentMonth: boolean,
): DayCell {
  // ✅ 使用本地時間建構，避免時區字串解析問題
  const date    = new Date(year, month - 1, day);
  const weekday = date.getDay();

  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  const lMonth     = lunar.getMonth();   // 負數 = 閏月
  const lDay       = lunar.getDay();
  const isLeapMonth = lMonth < 0;
  const absM       = Math.abs(lMonth);
  const monthStr   = (isLeapMonth ? '閏' : '') + (LUNAR_MONTHS[absM - 1] ?? '');
  const dayStr     = LUNAR_DAYS[lDay] ?? '';
  const displayStr = lDay === 1 ? monthStr : dayStr;

  const jieQiRaw = lunar.getJieQi();

  return {
    date, year, month, day, weekday,
    isCurrentMonth,
    // ✅ 年/月/日 三值比對，無時區歧義
    isToday:   year === _todayY && month === _todayM && day === _todayD,
    isWeekend: weekday === 0 || weekday === 6,
    lunar: {
      year: lunar.getYear(), month: lMonth, day: lDay,
      isLeapMonth, monthStr, dayStr, displayStr,
    },
    ganzhi: {
      year:  lunar.getYearInGanZhi(),
      month: lunar.getMonthInGanZhi(),
      day:   lunar.getDayInGanZhi(),
    },
    shengxiao: lunar.getYearShengXiao(),
    // ✅ 繁體化
    solarTerm: jieQiRaw ? toTC(jieQiRaw) : null,
    yi: (lunar.getDayYi() as string[]) ?? [],
    ji: (lunar.getDayJi() as string[]) ?? [],
  };
}

// ─── 月曆 42 格生成（6週×7天）───────────────────

export function generateCalendar(year: number, month: number): DayCell[] {
  const cells: DayCell[] = [];

  // ✅ 全部使用 new Date(y, m-1, d) 本地時間
  const firstDow    = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  // 前補（上月末尾）
  if (firstDow > 0) {
    const prev = new Date(year, month - 1, 0);    // 上月最後一天
    const pY = prev.getFullYear();
    const pM = prev.getMonth() + 1;
    const pD = prev.getDate();
    for (let i = firstDow - 1; i >= 0; i--) {
      cells.push(computeDayData(pY, pM, pD - i, false));
    }
  }

  // 當月
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(computeDayData(year, month, d, true));
  }

  // 後補（下月開頭）至滿 42 格
  const next = new Date(year, month, 1);           // 下月第一天（Date 自動進位）
  const nY = next.getFullYear();
  const nM = next.getMonth() + 1;
  for (let nd = 1; cells.length < 42; nd++) {
    cells.push(computeDayData(nY, nM, nd, false));
  }

  return cells;
}

// ─── 月份偏移（使用 Date 引擎自動處理進位）───────

export function offsetMonth(
  year: number, month: number, offset: number,
): { year: number; month: number } {
  // ✅ new Date(year, month-1+offset, 1) 讓 JS 引擎處理溢位
  const d = new Date(year, month - 1 + offset, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export const WEEKDAY_LABELS = ['日','一','二','三','四','五','六'];
