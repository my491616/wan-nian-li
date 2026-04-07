// App.tsx — 根元件，唯一狀態持有者
import { useState, useEffect } from 'react';
import Header from './components/Header';
import CalendarGrid from './components/CalendarGrid';
import DetailPanel from './components/DetailPanel';
import { useCalendar } from './hooks/useCalendar';

export default function App() {
  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false,
  );

  const {
    viewYear, viewMonth,
    selectedDate,
    calendarData,        // DayCell[] 42 格，月份切換時 useMemo 重算
    selectedDayData,     // 從 calendarData.find() 取，保證與 Grid 一致
    today,
    prevMonth, nextMonth, goToToday, onSelectDate,
  } = useCalendar();

  // 深色模式同步 document class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // 當前 view 是否正是今月（給 Header 判斷 today 按鈕狀態）
  const isViewingToday =
    viewYear  === today.year &&
    viewMonth === today.month;

  return (
    <div className={`min-h-screen font-body transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto flex flex-col min-h-screen">

        <Header
          year={viewYear}
          month={viewMonth}
          onPrev={prevMonth}
          onNext={nextMonth}
          onToday={goToToday}
          isDark={isDark}
          onToggleDark={() => setIsDark(v => !v)}
          isViewingToday={isViewingToday}
        />

        <main className="flex flex-col lg:flex-row gap-4 p-4 sm:p-5 flex-1">

          {/* 左：月曆 Grid */}
          <div className={`
            flex-1 min-w-0 rounded-2xl p-4 sm:p-5
            border shadow-sm transition-colors duration-300
            ${isDark
              ? 'bg-gray-900/60 border-gray-800'
              : 'bg-white       border-gray-100'}
          `}>
            <CalendarGrid
              cells={calendarData}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              isDark={isDark}
            />
          </div>

          {/* 右：Detail Panel（selectedDayData 來自 calendarData.find，UI 保證一致） */}
          <DetailPanel
            data={selectedDayData}
            isDark={isDark}
          />

        </main>

        <footer className={`text-center py-4 text-[11px] tracking-widest ${isDark ? 'text-gray-800' : 'text-gray-300'}`}>
          萬年曆 · 天干地支 · 農曆 · 節氣
        </footer>

      </div>
    </div>
  );
}
