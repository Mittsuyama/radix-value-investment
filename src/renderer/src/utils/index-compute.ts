import { ACCOUNT_ITEM } from '@renderer/constants';
import { FinancialReport } from '@renderer/types';

export const sum = (reports: FinancialReport[], item: keyof typeof ACCOUNT_ITEM) => {
  let res = 0;
  for (let i = 0; i < reports.length && i < reports.length; i++) {
    res += Number(reports[i]?.[ACCOUNT_ITEM[item]]) || 0;
  }
  return res;
};

export const avg = (nums: number[]) =>
  nums.reduce((pre, cur) => pre + (Number(cur) || 0), 0) / nums.length;

export const computeSimpleCFC = (reports: FinancialReport[], years = 1) => {
  const cfcs = reports.map((report) => {
    return (
      Number(report.data[ACCOUNT_ITEM['x-jyhdcsdxjllje-经营活动产生的现金流量净额']]) -
        Number(
          report.data[
            ACCOUNT_ITEM['x-gdzczjyqzczhscxswzczj-固定资产折旧、油气资产折耗、生产性生物资产折旧']
          ],
        ) -
        Number(report.data[ACCOUNT_ITEM['x-wxzctx-无形资产摊销']]) || 0
    );
  });
  return avg(cfcs.slice(0, years));
};
