import { FinancialReport, ReportMonth } from '@renderer/types/reports';
import { get, makeSureiIsArray } from './request';
import { getLeadingIndexRequest } from './leading-index';
import { genFinancialReport } from './common';

const CURRENT_YEAR = new Date().getFullYear();
const DATES_EX_YEAR: Array<{ month: ReportMonth; str: string }> = [
  { month: 12, str: '-12-31' },
  { month: 9, str: '-09-30' },
  { month: 6, str: '-06-30' },
  { month: 3, str: '-03-31' },
];

export type ReportParams = {
  /** 4 */
  companyType: number;
  /** 0 */
  reportDateType: number;
  /** 2 */
  ReportMonth: number;
  dates: string[];
  code: string;
};

interface getReportsRequestParams {
  code: string;
  cType: number;
  hostname: string;
  path: string;
  years: number;
  months: ReportMonth[];
}

const getReportsRequest = async (params: getReportsRequestParams) => {
  const { code, cType, hostname, path, years, months } = params;

  const requestYears = Array.from({ length: years }, (_, index) => CURRENT_YEAR - index);
  const dates = requestYears.flatMap((year) =>
    DATES_EX_YEAR.filter((date) => months.includes(date.month)).map((date) => `${year}${date.str}`),
  );

  const body = {
    companyType: String(cType),
    reportDateType: '0',
    reportType: '1',
    code,
  };

  // 一次只能请求 5 条数据
  const batch = 5;
  const batchResponse = await Promise.all(
    Array.from({ length: Math.ceil(dates.length / batch) }).map(async (_, index) => {
      const res = await get(`${hostname}${path}`, {
        ...body,
        dates: dates.slice(index * batch, Math.min((index + 1) * batch, dates.length)).join(','),
      });
      try {
        return res.data;
      } catch {
        return undefined;
      }
    }),
  );
  const resList = batchResponse.reduce((pre, cur) => {
    return pre.concat(cur);
  }, []);

  const usableDataList = makeSureiIsArray(resList)
    .filter(Boolean)
    .map<FinancialReport>(genFinancialReport)
    .sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.month - a.month;
    });

  return usableDataList;
};

interface BundleRequestParams {
  stockId: string;
}

const bundleRequest = async (
  params: BundleRequestParams &
    Pick<getReportsRequestParams, 'hostname' | 'path' | 'years' | 'months'>,
) => {
  const { stockId, hostname, path, years, months } = params;
  const [code, exchange] = stockId.split('.');
  const usableCode = `${exchange.toUpperCase()}${code}`;
  for (let j = 4; j > 0; j--) {
    const data = await getReportsRequest({
      hostname,
      path,
      code: usableCode,
      cType: j,
      years,
      months,
    });
    if (!data.length) {
      continue;
    }
    return data;
  }
  return [];
};

export const getTreeFinancialReportsRequest = async (
  stockId: string,
  years: number,
  months: ReportMonth[] = [3, 6, 9, 12],
) => {
  const [leadingList, zcfz, lr, xjll] = await Promise.all([
    getLeadingIndexRequest(stockId),
    bundleRequest({
      stockId,
      years,
      hostname: 'https://emweb.securities.eastmoney.com',
      path: '/PC_HSF10/NewFinanceAnalysis/zcfzbAjaxNew',
      months,
    }),
    bundleRequest({
      stockId,
      years,
      hostname: 'https://emweb.securities.eastmoney.com',
      path: '/PC_HSF10/NewFinanceAnalysis/lrbAjaxNew',
      months,
    }),
    bundleRequest({
      stockId,
      years,
      hostname: 'https://emweb.securities.eastmoney.com',
      path: '/PC_HSF10/NewFinanceAnalysis/xjllbAjaxNew',
      months,
    }),
  ]);
  return zcfz.map<FinancialReport>((report, index) => {
    const leading = leadingList.find(
      (item) => item.year === report.year && item.month === report.month,
    );
    return {
      year: report.year,
      month: report.month,
      data: {
        ...report.data,
        ...leading?.data,
        ...lr[index].data,
        ...xjll[index].data,
      },
    };
  });
};
