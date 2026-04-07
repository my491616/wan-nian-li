# 萬年曆 — 天干地支 · 農曆 · 節氣

> 現代極簡風格的中文萬年曆系統，支援農曆、天干地支四柱、節氣、宜忌顯示。

## 功能

- 📅 月曆切換（前後月份）
- 🌙 農曆顯示（初一顯示月份）
- ☯️ 天干地支四柱（年/月/日/時）
- 🌿 節氣（2024-2028 精確日期）
- 🐉 生肖
- ✅ 宜忌顯示
- 🌙 深色模式
- 📱 響應式設計（手機友好）
- 🔗 URL 帶參數（`?date=2026-04-07`）
- ⬅️ 今日按鈕

## 快速開始

```bash
npm install
npm run dev
```

打開 http://localhost:5173

## 部署到 Vercel

### 方法一：Vercel CLI（最快）

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 方法二：GitHub + Vercel Dashboard

1. 推送到 GitHub：
```bash
git init
git add .
git commit -m "init: 萬年曆 Web App"
git remote add origin https://github.com/你的帳號/wan-nian-li.git
git push -u origin main
```

2. 登入 [vercel.com](https://vercel.com)
3. 點擊 **Add New Project**
4. 選擇你的 GitHub repo
5. 設定：
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. 點擊 **Deploy**

部署完成後即可透過 Vercel 提供的網址訪問。

## 技術架構

```
src/
  core/
    calendar.ts    # 月曆生成（42格）
    lunar.ts       # 農曆轉換
    ganzhi.ts      # 干支計算
    solarTerms.ts  # 節氣
  components/
    CalendarGrid.tsx   # 月曆格子
    Header.tsx         # 導航標頭
    DetailPanel.tsx    # 右側詳細面板
  hooks/
    useCalendar.ts     # 狀態管理
  utils/
    date.ts            # 日期工具
  App.tsx
```

## 技術選型

- React 18 + Vite
- TypeScript
- TailwindCSS
- lunar-javascript（農曆計算）
