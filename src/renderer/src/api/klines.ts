import dayjs from 'dayjs';
import { KLineItem, KLineType } from '@renderer/types';
import { makeSureiIsArray, get } from './request';

const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';

export const fetchKLineItemsRequest = async (stockId: string, type: KLineType) => {
  const [code, sType] = stockId.split('.');

  const res = await get(url, {
    secid: `${sType.toLowerCase() === 'sh' ? '1' : '0'}.${code}`,
    fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
    end: dayjs().add(1, 'day').format('YYYYMMDD'),
    // 难道是日/周/月？
    klt: '101',
    beg: '0',
    rtntype: '6',
    fqt: '1',
  });
  return makeSureiIsArray(res.data.klines).map<KLineItem>((line) => {
    const items = line.split(',');
    return {
      type,
      time: items[0],
      open: Number(items[1]),
      close: Number(items[2]),
      high: Number(items[3]),
      low: Number(items[4]),
      volume: Number(items[5]),
      turnover: Number(items[6]),
      amplitude: Number(items[7]),
      changeRate: Number(items[8]),
      change: Number(items[9]),
      turnoverRate: Number(items[10]),
    };
  });
};
