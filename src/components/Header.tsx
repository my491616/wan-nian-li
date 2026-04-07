// Header.tsx — 月份導航 + 今日按鈕
import React from 'react';

interface HeaderProps {
  year:          number;
  month:         number;
  onPrev:        () => void;
  onNext:        () => void;
  onToday:       () => void;
  isDark:        boolean;
  onToggleDark:  () => void;
  isViewingToday: boolean;  // 當前 view 是否正在今月
}

const Header: React.FC<HeaderProps> = ({
  year, month, onPrev, onNext, onToday,
  isDark, onToggleDark, isViewingToday,
}) => {
  const surface = isDark
    ? 'bg-gray-900 border-gray-800 text-white'
    : 'bg-white   border-gray-100 text-gray-900';

  const iconBtn = `
    w-9 h-9 rounded-full flex items-center justify-center
    transition-all duration-150 active:scale-95
    ${isDark
      ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}
  `;

  return (
    <header className={`
      flex items-center justify-between
      px-4 sm:px-6 py-3.5
      border-b transition-colors duration-300
      ${surface}
    `}>

      {/* 左：Logo */}
      <div className="flex items-center gap-2.5 min-w-[80px]">
        <div className={`
          w-7 h-7 rounded-lg flex items-center justify-center
          text-sm font-bold font-display flex-shrink-0
          ${isDark ? 'bg-amber-500 text-gray-900' : 'bg-gray-900 text-white'}
        `}>
          曆
        </div>
        <span className={`
          hidden sm:block text-xs font-medium tracking-[0.2em]
          ${isDark ? 'text-gray-500' : 'text-gray-400'}
        `}>
          萬年曆
        </span>
      </div>

      {/* 中：月份導航 */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button onClick={onPrev} className={iconBtn} aria-label="上個月">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="min-w-[130px] sm:min-w-[150px] text-center px-1">
          <h1 className={`
            text-lg sm:text-xl font-display font-semibold tracking-wide whitespace-nowrap
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            {year}
            <span className={`text-xs sm:text-sm font-body mx-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>年</span>
            {month}
            <span className={`text-xs sm:text-sm font-body ml-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>月</span>
          </h1>
        </div>

        <button onClick={onNext} className={iconBtn} aria-label="下個月">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* 右：工具列 */}
      <div className="flex items-center gap-1.5 min-w-[80px] justify-end">

        {/* 今日按鈕 — 不在今月時才顯示跳轉感 */}
        <button
          onClick={onToday}
          className={`
            hidden sm:flex items-center gap-1 px-3 py-1.5
            rounded-lg text-xs font-medium border
            transition-all duration-150 active:scale-95
            ${isViewingToday
              ? isDark
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 cursor-default'
                : 'bg-amber-50 border-amber-200 text-amber-700 cursor-default'
              : isDark
                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }
          `}
          aria-label="回到今天"
        >
          {/* 小圓點指示 */}
          {isViewingToday && (
            <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-amber-400' : 'bg-amber-500'}`} />
          )}
          今天
        </button>

        {/* 手機版今日按鈕（僅圓點） */}
        <button
          onClick={onToday}
          className={`sm:hidden ${iconBtn}`}
          aria-label="回到今天"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5 1v3M11 1v3M1 7h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="8" cy="11" r="1.5" fill="currentColor"/>
          </svg>
        </button>

        {/* 深色模式切換 */}
        <button
          onClick={onToggleDark}
          className={`
            ${iconBtn}
            ${isDark
              ? 'bg-gray-800 text-amber-400 hover:bg-gray-700'
              : 'bg-gray-50  text-gray-500 hover:bg-gray-100'}
          `}
          aria-label="切換深色模式"
        >
          {isDark ? (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M11.89 4.11l1.06-1.06M3.05 12.95l1.06-1.06"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 9.5A5.5 5.5 0 016 2a6 6 0 107.5 7.5z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

    </header>
  );
};

export default Header;
