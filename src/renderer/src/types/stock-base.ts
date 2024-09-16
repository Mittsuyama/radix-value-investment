export interface StockBaseInfo {
  /** 唯一标识符，由 {code}.{stockExchangeNam} 组成 */
  id: string;

  /** 股票代码 */
  code: string;

  /** 交易所名称 */
  stockExchangeName: string;

  /** 股票中文名 */
  name: string;

  /** ROE_WEIGHT */
  roe: number;

  /** 总市值 */
  totalMarketCap: number;

  /** 滚动市盈率 */
  ttmPE: number;

  /** 行业 */
  industry: string;

  /** 市净率 */
  pb: number;

  /** 滚动 ROE */
  ttmROE: number;

  /** 毛利率 */
  GPR: number;

  /** 当前价格 */
  currentPrice: number;

  /** 涨跌幅 */
  changeRate: number;
}

export interface SearchStockItem {
  stockId: string;
  name: string;
  code: string;
  /** 交易所名称 */
  sType: string;
}
