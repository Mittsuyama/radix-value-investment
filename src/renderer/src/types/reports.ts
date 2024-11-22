import { StockBaseInfo } from './stock-base';
import { ACCOUNT_ITEM } from '@renderer/constants';

export type ItemName = keyof typeof ACCOUNT_ITEM;
export type ReportMonth = 3 | 6 | 9 | 12;

export interface FinancialReport {
  month: ReportMonth;
  year: number;
  data: Record<string, string | number | undefined>;
}

export interface StockWithReportsDetail extends StockBaseInfo {
  /** 简易计算的近三年平均自由现金流 */
  fcfAvg3: number;

  /** 简易计算的自由现金流 */
  fcf: number;

  /** 毛利率标准差 */
  gprStd: number;

  /** ROE 标准差 */
  roeStd: number;

  /** 上年年末 roe */
  lastYearRoe: number;

  /** 财务报表 */
  reports: FinancialReport[];
}

export type BalanceSheetType =
  | 'asset'
  | 'debt'
  | 'current-asset'
  | 'current-debt'
  | 'non-currnet-asset'
  | 'non-current-debt';
