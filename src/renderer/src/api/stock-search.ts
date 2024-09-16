import { SearchStockItem } from '@renderer/types';
import { get, makeSureiIsArray } from './request';

const sTypeOrder = ['SH', 'SZ', 'BJ', 'SH', 'HK'];

export const searchStockRequest = async (value: string): Promise<SearchStockItem[]> => {
  const res = await get('https://search-codetable.eastmoney.com/codetable/search/web', {
    client: 'web',
    keyword: value,
    pageIndex: 1,
    pageSize: 10,
  });
  try {
    return makeSureiIsArray(res?.result)
      .map((item) => {
        const { securityTypeName } = item;
        let sType = 'UNKNOWN';
        if (securityTypeName === '深A') {
          sType = 'SZ';
        } else if (securityTypeName === '沪A') {
          sType = 'SH';
        } else if (securityTypeName === '京A') {
          sType = 'BJ';
        } else if (securityTypeName === '科创板') {
          sType = 'SH';
        } else if (securityTypeName === '港股') {
          sType = 'HK';
        }
        return {
          stockId: `${item.code}.${sType}`,
          name: item.shortName,
          code: item.code,
          sType,
        };
      })
      .sort((a, b) => {
        const aIndex = sTypeOrder.findIndex((item) => a.sType === item);
        const bIndex = sTypeOrder.findIndex((item) => b.sType === item);
        if (aIndex === -1) {
          return 1;
        }
        if (bIndex === -1) {
          return -1;
        }
        return aIndex - bIndex;
      });
  } catch {
    return [];
  }
};
