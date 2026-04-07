declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    getLunar(): Lunar;
  }
  export class Lunar {
    getYear(): number;
    getMonth(): number;   // negative = leap month
    getDay(): number;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getTimeInGanZhi(hour: number): string;
    getYearShengXiao(): string;
    getMonthShengXiao(): string;
    getDayShengXiao(): string;
    getJieQi(): string;
    getJie(): string;
    getQi(): string;
    getDayYi(): string[];
    getDayJi(): string[];
    getTimeYi(hour?: number): string[];
    getTimeJi(hour?: number): string[];
    getYearGanIndex(): number;
    getYearZhiIndex(): number;
    getMonthGanIndex(): number;
    getMonthZhiIndex(): number;
    getDayGanIndex(): number;
    getDayZhiIndex(): number;
  }
}
