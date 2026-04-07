declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    getLunar(): Lunar;
  }

  export class Lunar {
    static fromYmdHms(
      year: number, month: number, day: number,
      hour: number, minute: number, second: number,
    ): Lunar;

    // 基本
    getYear(): number;
    getMonth(): number;   // negative = leap month
    getDay(): number;

    // 干支
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getTimeInGanZhi(): string;

    // 生肖
    getYearShengXiao(): string;
    getMonthShengXiao(): string;
    getDayShengXiao(): string;
    getTimeShengXiao(): string;

    // 節氣
    getJieQi(): string;
    getJie(): string;
    getQi(): string;

    // 宜忌
    getDayYi(): string[];
    getDayJi(): string[];
    getTimeYi(): string[];
    getTimeJi(): string[];

    // 納音
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getTimeNaYin(): string;
    getBaZiNaYin(): string[];

    // 建除十二神
    getZhiXing(): string;

    // 天神
    getDayTianShen(): string;
    getDayTianShenType(): string;
    getDayTianShenLuck(): string;
    getTimeTianShen(): string;
    getTimeTianShenType(): string;
    getTimeTianShenLuck(): string;

    // 沖煞
    getDayChong(): string;
    getDayChongGan(): string;
    getDayChongShengXiao(): string;
    getDayChongDesc(): string;
    getDaySha(): string;
    getTimeChong(): string;
    getTimeChongShengXiao(): string;
    getTimeChongDesc(): string;
    getTimeSha(): string;

    // 彭祖百忌
    getPengZuGan(): string;
    getPengZuZhi(): string;

    // 胎神
    getDayPositionTai(): string;

    // 方位（含描述）
    getDayPositionXiDesc(): string;
    getDayPositionYangGuiDesc(): string;
    getDayPositionYinGuiDesc(): string;
    getDayPositionFuDesc(): string;
    getDayPositionCaiDesc(): string;
    getTimePositionXiDesc(): string;
    getTimePositionYangGuiDesc(): string;
    getTimePositionYinGuiDesc(): string;
    getTimePositionFuDesc(): string;
    getTimePositionCaiDesc(): string;

    // Index
    getYearGanIndex(): number;
    getYearZhiIndex(): number;
    getMonthGanIndex(): number;
    getMonthZhiIndex(): number;
    getDayGanIndex(): number;
    getDayZhiIndex(): number;
    getTimeGanIndex(): number;
    getTimeZhiIndex(): number;
  }
}
