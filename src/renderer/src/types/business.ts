export interface BizItem {
  SECUCODE: string;
  SECURITY_CODE: string;

  // 2023-06-30 00:00:00
  REPORT_DATE: string;

  // 1 2 3
  MAINOP_TYPE: string;

  // 茅台酒
  ITEM_NAME: string;

  // 59278599200
  MAIN_BUSINESS_INCOME: number;

  // 0.851998
  MBI_RATIO: number;

  // 1 2 3...
  RANK: number;

  /** 毛利率 */
  GROSS_RPOFIT_RATIO: number;
}
