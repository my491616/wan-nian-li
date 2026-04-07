// CalendarGrid.tsx — 月曆格子（純 UI，接收 DayCell[]）
// 修正點：
//   - 今天：明顯背景色 + 小點
//   - 選中：清晰邊框
//   - 節氣：綠色文字
//   - 非本月：透明度降低
//   - 跨月點擊：正確委派給 onSelectDate（hook 內處理 view 切換）

import React from 'react';
import { type DayCell, WEEKDAY_LABELS } from '../core/calendar';

interface CalendarGridProps {
  cells:          DayCell[];
  selectedDate:   { year: number; month: number; day: number };
  onSelectDate:   (year: number, month: number, day: number) => void;
  isDark:         boolean;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  cells, selectedDate, onSelectDate, isDark,
}) => (
  <div className="flex-1 min-w-0 select-none">

    {/* 星期標題 */}
    <div className="grid grid-cols-7 mb-1">
      {WEEKDAY_LABELS.map((label, i) => (
        <div
          key={label}
          className={`
            text-center py-2 text-xs font-medium tracking-widest
            ${i === 0
              ? isDark ? 'text-red-400'  : 'text-red-500'
              : i === 6
              ? isDark ? 'text-blue-400' : 'text-blue-500'
              : isDark ? 'text-gray-500' : 'text-gray-400'}
          `}
        >
          {label}
        </div>
      ))}
    </div>

    {/* 42 格 */}
    <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
      {cells.map(cell => {
        const isSel =
          cell.year  === selectedDate.year  &&
          cell.month === selectedDate.month &&
          cell.day   === selectedDate.day;

        return (
          <DayCell
            key={`${cell.year}-${cell.month}-${cell.day}`}
            cell={cell}
            isSelected={isSel}
            isDark={isDark}
            onSelect={onSelectDate}
          />
        );
      })}
    </div>

  </div>
);

// ── 單格 ──────────────────────────────────────────

interface DayCellProps {
  cell:       DayCell;
  isSelected: boolean;
  isDark:     boolean;
  onSelect:   (y: number, m: number, d: number) => void;
}

const DayCell: React.FC<DayCellProps> = React.memo(({
  cell, isSelected, isDark, onSelect,
}) => {
  const { year, month, day, weekday, isCurrentMonth, isToday, solarTerm, lunar } = cell;

  // ── 容器樣式 ──────────────────────────────────
  let containerCls = `
    relative flex flex-col items-center justify-start
    rounded-xl py-1.5 px-0.5 sm:py-2
    min-h-[58px] sm:min-h-[74px] w-full
    cursor-pointer transition-all duration-150 active:scale-95
  `;

  if (isSelected) {
    // 選中：深色填充 + 明顯 ring
    containerCls += isDark
      ? ' bg-amber-500 ring-2 ring-amber-300/70 ring-offset-1 ring-offset-gray-900'
      : ' bg-gray-900 ring-2 ring-gray-600/50 ring-offset-1 ring-offset-white';
  } else if (isToday) {
    // 今天（未選中）：淡底 + 細 ring
    containerCls += isDark
      ? ' bg-amber-500/20 ring-2 ring-amber-400/60'
      : ' bg-amber-50   ring-2 ring-amber-400/70';
  } else {
    // 普通 hover
    containerCls += isDark
      ? ' hover:bg-gray-800/70'
      : ' hover:bg-gray-50';
  }

  // 非本月：整體淡化
  if (!isCurrentMonth) containerCls += ' opacity-30';

  // ── 國曆數字顏色 ──────────────────────────────
  let numCls = 'text-base sm:text-lg font-display font-semibold leading-tight ';
  if (isSelected) {
    numCls += isDark ? 'text-gray-900' : 'text-white';
  } else if (isToday) {
    numCls += isDark ? 'text-amber-300 font-bold' : 'text-amber-700 font-bold';
  } else if (weekday === 0) {
    numCls += isDark ? 'text-red-400'  : 'text-red-500';
  } else if (weekday === 6) {
    numCls += isDark ? 'text-blue-400' : 'text-blue-500';
  } else {
    numCls += isDark ? 'text-gray-200' : 'text-gray-800';
  }

  // ── 農曆 / 節氣副文字顏色 ─────────────────────
  let subCls = 'text-[9px] sm:text-[10px] leading-tight mt-0.5 font-body ';
  if (isSelected) {
    subCls += isDark ? 'text-gray-900/80' : 'text-white/80';
  } else if (solarTerm) {
    // 節氣：綠色
    subCls += isDark ? 'text-emerald-400 font-medium' : 'text-emerald-600 font-medium';
  } else if (lunar.day === 1) {
    // 農曆初一（顯示月份名）：琥珀色
    subCls += isDark ? 'text-amber-400/90' : 'text-amber-600';
  } else {
    subCls += isDark ? 'text-gray-500' : 'text-gray-400';
  }

  return (
    <button
      onClick={() => onSelect(year, month, day)}
      className={containerCls}
      aria-label={`${year}年${month}月${day}日${solarTerm ? ' ' + solarTerm : ''}`}
      aria-pressed={isSelected}
    >
      {/* 國曆日 */}
      <span className={numCls}>{day}</span>

      {/* 節氣優先，其次農曆 */}
      <span className={subCls}>
        {solarTerm ?? lunar.displayStr}
      </span>

      {/* 今日圓點（未選中時顯示） */}
      {isToday && !isSelected && (
        <span className={`
          absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full
          ${isDark ? 'bg-amber-400' : 'bg-amber-500'}
        `} />
      )}
    </button>
  );
});

DayCell.displayName = 'DayCell';

export default CalendarGrid;
