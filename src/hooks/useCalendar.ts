// useCalendar.ts — 統一狀態管理（最終穩定版）
//
// 修正項目：
//   1. offsetMonth → 改從 calendar.ts 匯入（使用 Date 引擎進位）
//   2. popstate 監聽 → 瀏覽器返回/前進時 UI 同步更新
//   3. URL 同步用 pushState（可返回），初始化用 replaceState（不汙染歷史）
//   4. 快速連點防護：setView 用函數式更新，每次都基於最新狀態計算

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  generateCalendar, computeDayData, offsetMonth,
  type DayCell,
} from '../core/calendar';

// ─── helpers ─────────────────────────────────────

function getToday() {
  const t = new Date();
  return { year: t.getFullYear(), month: t.getMonth() + 1, day: t.getDate() };
}

function parseUrlDate(): { year: number; month: number; day: number } | null {
  try {
    const p = new URLSearchParams(window.location.search);
    const v = p.get('date');
    if (!v) return null;
    const [y, m, d] = v.split('-').map(Number);
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31)
      return { year: y, month: m, day: d };
  } catch { /* ignore */ }
  return null;
}

function fmtDate(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function buildUrl(y: number, m: number, d: number): string {
  const url = new URL(window.location.href);
  url.searchParams.set('date', fmtDate(y, m, d));
  return url.toString();
}

// ─── 介面 ────────────────────────────────────────

export interface CalendarStore {
  viewYear:        number;
  viewMonth:       number;
  selectedDate:    { year: number; month: number; day: number };
  calendarData:    DayCell[];
  selectedDayData: DayCell;
  today:           { year: number; month: number; day: number };
  prevMonth:    () => void;
  nextMonth:    () => void;
  goToToday:    () => void;
  onSelectDate: (year: number, month: number, day: number) => void;
}

// ─── hook ────────────────────────────────────────

export function useCalendar(): CalendarStore {
  const today = getToday();
  const init  = parseUrlDate() ?? today;

  // view 為單一物件，prevMonth/nextMonth 用函數式更新保證原子性
  const [view, setView] = useState({ year: init.year, month: init.month });
  const [selectedDate, setSelectedDate] = useState(init);

  // 追蹤「是否為初始載入」，初始化只做 replaceState，避免增加歷史記錄
  const isFirstRender = useRef(true);

  // ── calendarData：view 改變時 useMemo 重算 42 格 ────
  const calendarData = useMemo(
    () => generateCalendar(view.year, view.month),
    [view.year, view.month],
  );

  // ── selectedDayData：優先從 calendarData.find 取（O(42)，無重算）──
  //    fallback computeDayData 只在 selectedDate 不在當前 42 格時觸發（極罕見）
  const selectedDayData = useMemo<DayCell>(() => {
    return (
      calendarData.find(
        c => c.year  === selectedDate.year  &&
             c.month === selectedDate.month &&
             c.day   === selectedDate.day,
      ) ?? computeDayData(selectedDate.year, selectedDate.month, selectedDate.day, true)
    );
  }, [calendarData, selectedDate]);

  // ── URL 同步 ─────────────────────────────────────
  // 初次渲染：replaceState（不新增歷史）
  // 後續變更：pushState（可按返回鍵）
  useEffect(() => {
    const { year: y, month: m, day: d } = selectedDate;
    const url = buildUrl(y, m, d);
    if (isFirstRender.current) {
      window.history.replaceState({ year: y, month: m, day: d }, '', url);
      isFirstRender.current = false;
    } else {
      window.history.pushState({ year: y, month: m, day: d }, '', url);
    }
  }, [selectedDate]);

  // ── popstate 監聽：瀏覽器返回/前進時同步 UI ─────
  useEffect(() => {
    const handler = (e: PopStateEvent) => {
      // 優先從 state 物件取（由 pushState 存入）
      const st = e.state as { year?: number; month?: number; day?: number } | null;
      const parsed = st?.year && st?.month && st?.day
        ? { year: st.year, month: st.month, day: st.day }
        : parseUrlDate();

      if (parsed) {
        setView({ year: parsed.year, month: parsed.month });
        setSelectedDate(parsed);
      }
    };

    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);   // 只在 mount/unmount 執行

  // ── 月份切換：函數式更新 + Date 引擎進位（快速連點安全）──
  const prevMonth = useCallback(() => {
    setView(v => offsetMonth(v.year, v.month, -1));
  }, []);

  const nextMonth = useCallback(() => {
    setView(v => offsetMonth(v.year, v.month, +1));
  }, []);

  // ── 點擊日期：view 與 selectedDate 同 batch 更新 ──
  const onSelectDate = useCallback((year: number, month: number, day: number) => {
    setView({ year, month });
    setSelectedDate({ year, month, day });
  }, []);

  // ── 今日按鈕 ──────────────────────────────────
  const goToToday = useCallback(() => {
    const t = getToday();
    setView({ year: t.year, month: t.month });
    setSelectedDate(t);
  }, []);

  return {
    viewYear:  view.year,
    viewMonth: view.month,
    selectedDate,
    calendarData,
    selectedDayData,
    today,
    prevMonth,
    nextMonth,
    goToToday,
    onSelectDate,
  };
}
