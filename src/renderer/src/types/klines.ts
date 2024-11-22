export enum KLineType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export interface KLineItem {
  /** 类型 */
  type: KLineType;
  /** 日期 */
  time: number;
  /** 开盘 */
  open: number;
  /** 收盘 */
  close: number;
  /** 最高 */
  high: number;
  /** 最低 */
  low: number;
  /** 成交量 */
  volume: number;
  /** 成交额 */
  turnover: number;
  /** 振幅 */
  amplitude: number;
  /** 涨跌额 */
  change: number;
  /** 涨跌幅 */
  changeRate: number;
  /** 换手率 */
  turnoverRate: number;
}
