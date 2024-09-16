import { genFinancialReport } from './common';
import { makeSureiIsArray, get } from './request';

const url = 'https://datacenter.eastmoney.com/securities/api/data/get';

export const getLeadingIndexRequest = async (stockId: string) => {
  const [code, sType] = stockId.split('.');
  const filter = `(SECUCODE="${code}.${sType.toUpperCase()}")`;

  const res = await get(url, {
    type: 'RPT_F10_FINANCE_MAINFINADATA',
    sty: 'APP_F10_MAINFINADATA',
    quoteColumns: '',
    filter,
    p: '1',
    ps: '99',
    sr: '-1',
    st: 'REPORT_DATE',
    source: 'HSF10',
    client: 'PC',
  });
  return makeSureiIsArray(res.result.data).map(genFinancialReport);
};
