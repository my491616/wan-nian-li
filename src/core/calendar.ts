// calendar.ts — 月曆核心資料層（最終完整版）
// 所有欄位由 lunar-javascript 真實計算，無假資料

import { Solar, Lunar } from 'lunar-javascript';

// ─── 節氣繁體對照 ────────────────────────────────

const JIEQI_TC: Record<string, string> = {
  小寒:'小寒', 大寒:'大寒', 立春:'立春', 雨水:'雨水',
  惊蛰:'驚蟄', 春分:'春分', 清明:'清明', 谷雨:'穀雨',
  立夏:'立夏', 小满:'小滿', 芒种:'芒種', 夏至:'夏至',
  小暑:'小暑', 大暑:'大暑', 立秋:'立秋', 处暑:'處暑',
  白露:'白露', 秋分:'秋分', 寒露:'寒露', 霜降:'霜降',
  立冬:'立冬', 小雪:'小雪', 大雪:'大雪', 冬至:'冬至',
};

// ─── 農曆中文 ────────────────────────────────────

export const LUNAR_MONTHS = [
  '正月','二月','三月','四月','五月','六月',
  '七月','八月','九月','十月','冬月','臘月',
];
export const LUNAR_DAYS = [
  '','初一','初二','初三','初四','初五',
  '初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五',
  '十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五',
  '廿六','廿七','廿八','廿九','三十',
];

// ─── 彭祖百忌繁體 ────────────────────────────────

function tcPengzu(s: string): string {
  return s
    .replace(/主人不尝/,'主人不嘗')
    .replace(/不/g,'不').replace(/嫁娶/,'嫁娶')
    .replace(/灶/,'灶').replace(/仓/,'倉')
    .replace(/沟渠/,'溝渠').replace(/针/,'針')
    .replace(/词讼/,'詞訟').replace(/机织/,'機織')
    .replace(/无/,'無').replace(/祭祀/,'祭祀');
}

// ─── 建除十二神 ──────────────────────────────────

const ZHIXING_LUCK: Record<string, '吉'|'平'|'凶'> = {
  建:'凶', 除:'吉', 滿:'平', 平:'吉',
  定:'吉', 執:'平', 成:'吉', 收:'平',
  開:'吉', 閉:'凶', 破:'凶', 危:'平',
};
const ZHIXING_DESC: Record<string, string> = {
  建:'諸事不宜', 除:'掃除凶穢', 滿:'滿盈之日', 平:'地政普施',
  定:'安靜之日', 執:'守執之日', 成:'萬事吉成', 收:'收穫之日',
  開:'開通順暢', 閉:'閉塞不通', 破:'諸事不宜', 危:'慎行之日',
};

// ─── 方位繁體 ────────────────────────────────────

function tcDir(s: string): string {
  return s
    .replace(/东北/,'東北').replace(/东南/,'東南')
    .replace(/西北/,'西北').replace(/西南/,'西南')
    .replace(/正东/,'正東').replace(/正西/,'正西')
    .replace(/正南/,'正南').replace(/正北/,'正北')
    .replace(/东/,'東').replace(/西/,'西');
}

// ─── 納音繁體 ────────────────────────────────────

function tcNayin(s: string): string {
  return s
    .replace(/钗钏金/,'釵釧金').replace(/海中金/,'海中金')
    .replace(/炉中火/,'爐中火').replace(/霹雳火/,'霹靂火')
    .replace(/大林木/,'大林木').replace(/路旁土/,'路旁土')
    .replace(/剑锋金/,'劍鋒金').replace(/山头火/,'山頭火')
    .replace(/涧下水/,'澗下水').replace(/城头土/,'城頭土')
    .replace(/壁上土/,'壁上土').replace(/金箔金/,'金箔金')
    .replace(/覆灯火/,'覆燈火').replace(/天河水/,'天河水')
    .replace(/大驿土/,'大驛土').replace(/钗钏/,'釵釧')
    .replace(/长流水/,'長流水').replace(/沙中金/,'沙中金')
    .replace(/山下火/,'山下火').replace(/平地木/,'平地木')
    .replace(/壁上/,'壁上').replace(/松柏木/,'松柏木');
}

// ─── 沖煞繁體 ─────────────────────────────────────

function tcShengxiao(s: string): string {
  return s.replace(/马/,'馬').replace(/鸡/,'雞').replace(/猪/,'豬');
}

// ─── 型別定義 ────────────────────────────────────

export interface LunarInfo {
  year:        number;
  month:       number;
  day:         number;
  isLeapMonth: boolean;
  monthStr:    string;
  dayStr:      string;
  displayStr:  string;
}

export interface GanzhiInfo {
  year:  string;
  month: string;
  day:   string;
}

export interface TimeInfo {
  zhi:       string;   // 地支名
  ganZhi:    string;   // 干支，如「庚子」
  nayin:     string;   // 納音，繁體
  tianShen:  string;   // 天神，如「青龍」
  shenType:  string;   // '黃道'|'黑道'
  luck:      '吉'|'凶';
  timeRange: string;   // '23:00–01:00'
  shengxiao: string;   // 生肖
}

export interface DayDetails {
  // 干支四柱
  ganzhi:       GanzhiInfo;
  // 納音
  dayNayin:     string;
  yearNayin:    string;
  monthNayin:   string;
  // 建除十二神
  zhiXing:      string;
  zhiXingLuck:  '吉'|'平'|'凶';
  zhiXingDesc:  string;
  // 天神黃黑道
  tianShen:     string;
  tianShenType: string;
  tianShenLuck: string;
  // 沖煞
  chong:        string;   // 沖 地支
  chongDesc:    string;   // 沖 完整（乙巳）蛇
  sha:          string;   // 煞方
  // 彭祖百忌
  pengZuGan:    string;
  pengZuZhi:    string;
  // 胎神
  dayTai:       string;   // 胎神所在
  // 吉神方位
  posXi:        string;   // 喜神
  posYangGui:   string;   // 陽貴
  posYinGui:    string;   // 陰貴
  posFu:        string;   // 福神
  posCai:       string;   // 財神
  // 宜忌（由 lunar-javascript 提供）
  yi:           string[];
  ji:           string[];
  // 12 時辰
  timeList:     TimeInfo[];
}

export interface DayCell {
  date:           Date;
  year:           number;
  month:          number;
  day:            number;
  weekday:        number;
  isCurrentMonth: boolean;
  isToday:        boolean;
  isWeekend:      boolean;
  lunar:          LunarInfo;
  ganzhi:         GanzhiInfo;
  shengxiao:      string;
  solarTerm:      string | null;
  yi:             string[];
  ji:             string[];
  // 詳細資訊（完整計算）
  details:        DayDetails;
}

// ─── 今日快照 ────────────────────────────────────

let _todayY = 0, _todayM = 0, _todayD = 0;
function refreshToday() {
  const t = new Date();
  _todayY = t.getFullYear(); _todayM = t.getMonth() + 1; _todayD = t.getDate();
}
refreshToday();
setInterval(refreshToday, 60_000);

// ─── 時辰資訊計算 ────────────────────────────────

const HOUR_ZHI  = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const HOUR_MAP  = [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21];
const HOUR_RANGE = [
  '23:00–01:00','01:00–03:00','03:00–05:00','05:00–07:00',
  '07:00–09:00','09:00–11:00','11:00–13:00','13:00–15:00',
  '15:00–17:00','17:00–19:00','19:00–21:00','21:00–23:00',
];

function computeTimeList(lunarYear: number, lunarMonth: number, lunarDay: number): TimeInfo[] {
  return HOUR_ZHI.map((zhi, i) => {
    const h = HOUR_MAP[i];
    const lu = Lunar.fromYmdHms(lunarYear, lunarMonth, lunarDay, h, 0, 0);
    const gz  = lu.getTimeInGanZhi ? lu.getTimeInGanZhi() : '';
    const ny  = lu.getTimeNaYin   ? tcNayin(lu.getTimeNaYin()) : '';
    const ts  = lu.getTimeTianShen     ? lu.getTimeTianShen()     : '';
    const tst = lu.getTimeTianShenType ? lu.getTimeTianShenType() : '';
    const tsl = lu.getTimeTianShenLuck ? lu.getTimeTianShenLuck() : '';
    const sx  = lu.getTimeShengXiao   ? tcShengxiao(lu.getTimeShengXiao()) : '';
    return {
      zhi,
      ganZhi:   gz,
      nayin:    ny,
      tianShen: ts,
      shenType: tst,
      luck:     tsl === '吉' ? '吉' : '凶',
      timeRange: HOUR_RANGE[i],
      shengxiao: sx,
    };
  });
}

// ─── 單日完整計算 ────────────────────────────────

export function computeDayData(
  year: number, month: number, day: number,
  isCurrentMonth: boolean,
): DayCell {
  const date    = new Date(year, month - 1, day);
  const weekday = date.getDay();

  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  const lMonth      = lunar.getMonth();
  const lDay        = lunar.getDay();
  const isLeapMonth = lMonth < 0;
  const absM        = Math.abs(lMonth);
  const monthStr    = (isLeapMonth ? '閏' : '') + (LUNAR_MONTHS[absM - 1] ?? '');
  const dayStr      = LUNAR_DAYS[lDay] ?? '';

  const jieQiRaw = lunar.getJieQi();

  // 建除
  const zhiXingRaw  = lunar.getZhiXing ? lunar.getZhiXing() : '';
  // 對照表有時輸出簡體，補繁體對應
  const zhiXingMap: Record<string,string> = { 闭:'閉',满:'滿',执:'執',开:'開',收:'收',危:'危',建:'建',除:'除',平:'平',定:'定',成:'成',破:'破' };
  const zhiXing     = zhiXingMap[zhiXingRaw] ?? zhiXingRaw;
  const zhiXingLuck = ZHIXING_LUCK[zhiXing] ?? '平';
  const zhiXingDesc = ZHIXING_DESC[zhiXing] ?? '';

  // 天神
  const tianShen     = lunar.getDayTianShen     ? lunar.getDayTianShen()     : '';
  const tianShenType = lunar.getDayTianShenType ? lunar.getDayTianShenType() : '';
  const tianShenLuck = lunar.getDayTianShenLuck ? lunar.getDayTianShenLuck() : '';

  // 沖煞
  const chongDesc = lunar.getDayChongDesc ? lunar.getDayChongDesc() : '';
  const sha       = lunar.getDaySha       ? tcDir(lunar.getDaySha()) : '';

  // 彭祖百忌
  const pgGan = lunar.getPengZuGan ? tcPengzu(lunar.getPengZuGan()) : '';
  const pgZhi = lunar.getPengZuZhi ? tcPengzu(lunar.getPengZuZhi()) : '';

  // 胎神
  const dayTai = lunar.getDayPositionTai ? lunar.getDayPositionTai() : '';

  // 方位
  const posXi     = tcDir(lunar.getDayPositionXiDesc     ? lunar.getDayPositionXiDesc()     : '');
  const posYangGui = tcDir(lunar.getDayPositionYangGuiDesc ? lunar.getDayPositionYangGuiDesc() : '');
  const posYinGui  = tcDir(lunar.getDayPositionYinGuiDesc  ? lunar.getDayPositionYinGuiDesc()  : '');
  const posFu      = tcDir(lunar.getDayPositionFuDesc      ? lunar.getDayPositionFuDesc()      : '');
  const posCai     = tcDir(lunar.getDayPositionCaiDesc     ? lunar.getDayPositionCaiDesc()     : '');

  // 納音
  const dayNayin   = tcNayin(lunar.getDayNaYin   ? lunar.getDayNaYin()   : '');
  const yearNayin  = tcNayin(lunar.getYearNaYin  ? lunar.getYearNaYin()  : '');
  const monthNayin = tcNayin(lunar.getMonthNaYin ? lunar.getMonthNaYin() : '');

  // 宜忌
  const yi: string[] = (lunar.getDayYi() as string[]) ?? [];
  const ji: string[] = (lunar.getDayJi() as string[]) ?? [];

  // 時辰
  const timeList = computeTimeList(lunar.getYear(), lunar.getMonth(), lunar.getDay());

  const ganzhi: GanzhiInfo = {
    year:  lunar.getYearInGanZhi(),
    month: lunar.getMonthInGanZhi(),
    day:   lunar.getDayInGanZhi(),
  };

  const details: DayDetails = {
    ganzhi, dayNayin, yearNayin, monthNayin,
    zhiXing, zhiXingLuck, zhiXingDesc,
    tianShen, tianShenType, tianShenLuck,
    chong: lunar.getDayChong ? lunar.getDayChong() : '',
    chongDesc,
    sha,
    pengZuGan: pgGan, pengZuZhi: pgZhi,
    dayTai,
    posXi, posYangGui, posYinGui, posFu, posCai,
    yi, ji, timeList,
  };

  return {
    date, year, month, day, weekday,
    isCurrentMonth,
    isToday:   year === _todayY && month === _todayM && day === _todayD,
    isWeekend: weekday === 0 || weekday === 6,
    lunar: {
      year: lunar.getYear(), month: lMonth, day: lDay,
      isLeapMonth, monthStr, dayStr,
      displayStr: lDay === 1 ? monthStr : dayStr,
    },
    ganzhi,
    shengxiao: tcShengxiao(lunar.getYearShengXiao()),
    solarTerm: jieQiRaw ? (JIEQI_TC[jieQiRaw] ?? jieQiRaw) : null,
    yi, ji,
    details,
  };
}

// ─── 月曆 42 格 ──────────────────────────────────

export function generateCalendar(year: number, month: number): DayCell[] {
  const cells: DayCell[] = [];
  const firstDow    = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  if (firstDow > 0) {
    const prev = new Date(year, month - 1, 0);
    const pY = prev.getFullYear(), pM = prev.getMonth() + 1, pD = prev.getDate();
    for (let i = firstDow - 1; i >= 0; i--)
      cells.push(computeDayData(pY, pM, pD - i, false));
  }
  for (let d = 1; d <= daysInMonth; d++)
    cells.push(computeDayData(year, month, d, true));

  const next = new Date(year, month, 1);
  const nY = next.getFullYear(), nM = next.getMonth() + 1;
  for (let nd = 1; cells.length < 42; nd++)
    cells.push(computeDayData(nY, nM, nd, false));

  return cells;
}

export function offsetMonth(year: number, month: number, offset: number) {
  const d = new Date(year, month - 1 + offset, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export const WEEKDAY_LABELS = ['日','一','二','三','四','五','六'];
