// DetailPanel.tsx — 詳細資訊面板
// 修正點：完全由傳入的 DayCell 驅動，零自行計算

import React from 'react';
import { type DayCell } from '../core/calendar';

interface DetailPanelProps {
  data:   DayCell;
  isDark: boolean;
}

// ── 五行 ─────────────────────────────────────────

const WX_MAP: Record<string, string> = {
  甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',
  庚:'金',辛:'金',壬:'水',癸:'水',
  子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',
  午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水',
};

const WX_DARK: Record<string, string>  = { 木:'text-green-400', 火:'text-red-400', 土:'text-yellow-400', 金:'text-slate-300', 水:'text-blue-400' };
const WX_LIGHT: Record<string, string> = { 木:'text-green-700', 火:'text-red-600',  土:'text-yellow-700', 金:'text-slate-500', 水:'text-blue-600' };

// ── 生肖 emoji ────────────────────────────────────

const SX_EMOJI: Record<string, string> = {
  鼠:'🐭',牛:'🐮',虎:'🐯',兔:'🐰',龍:'🐲',蛇:'🐍',
  马:'🐴',馬:'🐴',羊:'🐑',猴:'🐵',雞:'🐔',鸡:'🐔',
  狗:'🐶',豬:'🐷',猪:'🐷',
};

const WEEKDAY_ZH = ['週日','週一','週二','週三','週四','週五','週六'];

// ── 干支柱格子 ────────────────────────────────────

const Pillar: React.FC<{ label: string; gz: string; isDark: boolean }> = ({ label, gz, isDark }) => {
  const gan = gz[0] ?? '';
  const zhi = gz[1] ?? '';
  const ganWx = WX_MAP[gan] ?? '';
  const zhiWx = WX_MAP[zhi] ?? '';

  const wxC = (wx: string) => isDark
    ? (WX_DARK[wx]  ?? 'text-gray-500')
    : (WX_LIGHT[wx] ?? 'text-gray-400');

  return (
    <div className={`flex flex-col items-center gap-0.5 px-2 py-2.5 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}>
      <span className={`text-[10px] tracking-wider mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
      <span className={`text-xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{gan}</span>
      <span className={`text-[9px] font-semibold ${wxC(ganWx)}`}>{ganWx}</span>
      <div className={`w-4 h-px my-0.5 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
      <span className={`text-xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{zhi}</span>
      <span className={`text-[9px] font-semibold ${wxC(zhiWx)}`}>{zhiWx}</span>
    </div>
  );
};

// ── Badge ─────────────────────────────────────────

const TagList: React.FC<{
  items:   string[];
  color:   'green' | 'red';
  isDark:  boolean;
}> = ({ items, color, isDark }) => {
  if (items.length === 0) return null;
  const cls = color === 'green'
    ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
    : isDark ? 'bg-red-500/15 text-red-400'         : 'bg-red-50 text-red-600';
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(it => (
        <span key={it} className={`text-xs px-2.5 py-1 rounded-lg ${cls}`}>{it}</span>
      ))}
    </div>
  );
};

// ── 主元件 ───────────────────────────────────────

const DetailPanel: React.FC<DetailPanelProps> = ({ data, isDark }) => {
  const { year, month, day, weekday, lunar, ganzhi, shengxiao, solarTerm, yi, ji } = data;

  const card = `rounded-2xl p-4 transition-colors ${isDark
    ? 'bg-gray-800/60 border border-gray-800'
    : 'bg-white      border border-gray-100 shadow-sm'}`;

  const sectionLabel = `text-xs tracking-wider mb-2.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`;
  const sectionBar   = (c: string) => `w-1 h-4 rounded-full ${c}`;

  return (
    <aside className={`
      w-full lg:w-72 xl:w-80 flex-shrink-0
      flex flex-col gap-3
      overflow-y-auto scrollbar-hide
      lg:max-h-[calc(100vh-80px)]
    `}>

      {/* ① 日期卡 */}
      <div className={card}>
        <div className="flex items-end gap-3">
          <span className={`text-6xl font-display font-bold leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {day}
          </span>
          <div className="flex flex-col pb-1 gap-0.5">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {year} 年 {month} 月
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {WEEKDAY_ZH[weekday]}
            </span>
          </div>
        </div>

        {/* 農曆行 */}
        <div className={`flex items-center gap-2 mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <span className={`text-xs tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>農曆</span>
          <span className={`font-medium tracking-wide ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {lunar.year} 年&nbsp;{lunar.monthStr}&nbsp;{lunar.dayStr}
          </span>
          {lunar.isLeapMonth && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
              閏月
            </span>
          )}
        </div>

        {/* 節氣 badge */}
        {solarTerm && (
          <div className={`
            inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full w-fit mt-3 font-medium
            ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}
          `}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            今日&nbsp;{solarTerm}
          </div>
        )}
      </div>

      {/* ② 四柱干支 */}
      <div className={card}>
        <div className={sectionLabel}>四柱干支</div>
        <div className="grid grid-cols-3 gap-1.5">
          <Pillar label="年柱" gz={ganzhi.year}  isDark={isDark} />
          <Pillar label="月柱" gz={ganzhi.month} isDark={isDark} />
          <Pillar label="日柱" gz={ganzhi.day}   isDark={isDark} />
        </div>
        <p className={`text-[10px] mt-2.5 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
          時柱依出生小時而定，需個別計算
        </p>
      </div>

      {/* ③ 生肖 */}
      <div className={`${card} flex items-center justify-between`}>
        <div>
          <div className={sectionLabel}>今年生肖</div>
          <div className={`text-3xl font-display font-bold leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {shengxiao}
          </div>
          <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {ganzhi.year} 年
          </div>
        </div>
        <span className="text-6xl leading-none opacity-20 select-none">
          {SX_EMOJI[shengxiao] ?? '🐉'}
        </span>
      </div>

      {/* ④ 宜 */}
      {yi.length > 0 && (
        <div className={card}>
          <div className="flex items-center gap-2 mb-2.5">
            <span className={sectionBar('bg-emerald-500')} />
            <span className={sectionLabel.replace('mb-2.5', '')}>今日宜</span>
          </div>
          <TagList items={yi.slice(0, 6)} color="green" isDark={isDark} />
        </div>
      )}

      {/* ⑤ 忌 */}
      {ji.length > 0 && (
        <div className={card}>
          <div className="flex items-center gap-2 mb-2.5">
            <span className={sectionBar('bg-red-500')} />
            <span className={sectionLabel.replace('mb-2.5', '')}>今日忌</span>
          </div>
          <TagList items={ji.slice(0, 6)} color="red" isDark={isDark} />
        </div>
      )}

    </aside>
  );
};

export default DetailPanel;
