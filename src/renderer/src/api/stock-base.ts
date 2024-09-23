import { StockBaseInfo } from '@renderer/types';
import { get, makeSureiIsArray } from './request';

const url = 'https://data.eastmoney.com/dataapi/xuangu/list';

export interface FilterConfigs {
  /** PE 不大于 */
  maxPe?: number;

  /** PE 不小于 */
  minPe?: number;

  /** 总市值不低于 */
  minTotalMarketCAP?: number;

  /** ROE 不小于 */
  minROE?: number;

  /** 是否需要要求上市五年 */
  isOverFiveYear?: boolean;

  minPB?: number;
  maxPB?: number;
}

/** 根据一些过滤规则返回股票信息（没有规则，则返回所有股票） */
export const getStockBaseInfoListByFilterRequeset = async (
  params: FilterConfigs,
): Promise<Array<StockBaseInfo>> => {
  const { maxPe, minPe, minPB, maxPB, minTotalMarketCAP, minROE, isOverFiveYear } = params;

  let filter = '';
  if (typeof minPe === 'number') {
    filter += `(PE9>=${minPe})`;
  }
  if (typeof maxPe === 'number') {
    filter += `(PE9<=${maxPe})`;
  }
  if (typeof minTotalMarketCAP === 'number') {
    filter += `(TOTAL_MARKET_CAP>=${minTotalMarketCAP})`;
  }
  if (typeof minROE === 'number') {
    filter += `(ROE_WEIGHT>=${minROE})`;
  }
  if (isOverFiveYear) {
    filter += '(@LISTING_DATE="OVER5Y")';
  }
  if (typeof minPB === 'number') {
    filter += `(PBNEWMRQ>${minPB})`;
  }
  if (typeof maxPB === 'number') {
    filter += `(PBNEWMRQ<=${maxPB})`;
  }

  const search = new URLSearchParams({
    st: 'CHANGE_RATE',
    sr: '-1',
    ps: '9999',
    p: '1',
    sty: 'SECUCODE,SECURITY_CODE,SECURITY_NAME_ABBR,NEW_PRICE,CHANGE_RATE,VOLUME_RATIO,HIGH_PRICE,LOW_PRICE,PRE_CLOSE_PRICE,VOLUME,DEAL_AMOUNT,TURNOVERRATE,PE9,TOTAL_MARKET_CAP,ROE_WEIGHT,LISTING_DATE,INDUSTRY,PBNEWMRQ,SALE_GPR',
    filter,
    source: 'SELECT_SECURITIES',
    client: 'WEB',
    size: '9999',
  });
  const res = await get(`${url}?${search.toString()}`);

  if (!Array.isArray(res?.result?.data)) {
    return [];
  }

  return makeSureiIsArray(res.result.data).map<StockBaseInfo>((item) => {
    const { SECUCODE } = item;
    const [code, stockExchangeName] = SECUCODE.split('.');

    const ttmPE = item['PE9'];
    const pb = item['PBNEWMRQ'];
    const ttmROE = (pb / ttmPE) * 100;

    return {
      id: SECUCODE,
      code,
      stockExchangeName,
      name: item['SECURITY_NAME_ABBR'],
      roe: item['ROE_WEIGHT'],
      totalMarketCap: item['TOTAL_MARKET_CAP'],
      industry: item['INDUSTRY'],
      GPR: Number(item['SALE_GPR']) || 0,
      ttmPE,
      pb,
      ttmROE,
      currentPrice: item.NEW_PRICE,
      changeRate: item.CHANGE_RATE,
      years: (Date.now() - new Date(item.LISTING_DATE).getTime()) / (86400_000 * 365),
    };
  });
};
