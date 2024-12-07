import { FinancialReport, StockWithReportsDetail } from './reports';

export interface StockDetailInMarket extends StockWithReportsDetail {
  /** 更新时间 */
  updateTime: string;
}

export interface FractileConfig {
  title: string;
  compute: (detai: StockWithReportsDetail, lastYearReport: FinancialReport['data']) => number;
  better: 'high' | 'low';

  /** 权重，默认 1 */
  weight?: number;

  /** 特殊情况 */
  special?: (value: number) => undefined | number;
}

export interface FractileIndex extends FractileConfig {
  values: [number, number];
}
