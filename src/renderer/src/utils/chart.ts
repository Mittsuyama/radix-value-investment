import { ACCOUNT_ITEM } from '@renderer/constants';
import { FinancialReport } from '@renderer/types';

export interface ChartDataItem {
  seriesName: string;
  percent: number;
  percentToBase: number;
  value: number;
  year: number;
  month: number;
}

interface GetValidItemsParams {
  report: FinancialReport;
  accountItemKeys: Array<keyof typeof ACCOUNT_ITEM>;
  total?: number;
  base?: number;
  minPercent?: number;
}

const getValidItems = ({
  report,
  total,
  base,
  accountItemKeys,
  minPercent,
}: GetValidItemsParams) => {
  const datas = accountItemKeys
    .map<ChartDataItem | undefined>((key) => {
      const value = Number(report.data[ACCOUNT_ITEM[key]]) || 0;
      const percent = (value / (total || 1)) * 100;
      const percentToBase = (value / (base || 1)) * 100;
      if (typeof minPercent === 'undefined' || percent > minPercent) {
        const [, , chinese] = key.split('-');
        return {
          seriesName: chinese,
          value,
          percent,
          percentToBase,
          year: report.year,
          month: report.month,
        };
      }
      return undefined;
    })
    .filter((item): item is ChartDataItem => !!item);

  const totalValue = datas.reduce((pre, cur) => pre + (cur?.value || 0), 0);

  const restItem: ChartDataItem[] =
    total && Math.abs(total - totalValue) > 1_0000
      ? [
          {
            year: report.year,
            month: report.month,
            seriesName: '剩余',
            value: total - totalValue,
            percent: ((total - totalValue) / total) * 100,
            percentToBase: ((total - totalValue) / (base || 1)) * 100,
          },
        ]
      : [];

  return datas
    .concat(restItem)
    .filter((data): data is ChartDataItem => Boolean(data))
    .sort((a, b) => a.value - b.value);
};

interface GetLineDataParams extends Pick<GetValidItemsParams, 'accountItemKeys' | 'minPercent'> {
  reports: FinancialReport[];
  totals?: number[];
  totalName?: string;
}

export const getLineData = ({
  reports,
  totals,
  accountItemKeys,
  minPercent,
  totalName,
}: GetLineDataParams) => {
  const itemsInEveryReports = reports.map((report, index) => {
    return getValidItems({
      report,
      base: totals?.[0],
      total: totals?.[index],
      accountItemKeys,
      minPercent,
    });
  });

  const seriesNameList = Array.from(
    new Set(itemsInEveryReports.flatMap((items) => items.map((item) => item.seriesName))),
  );

  const series = seriesNameList
    .map((name) => {
      return {
        name,
        datas: itemsInEveryReports.map<ChartDataItem>((items, index) => {
          const findedItem = items.find((item) => item.seriesName === name);
          return {
            seriesName: name,
            year: reports[index].year,
            month: reports[index].month,
            percentToBase: findedItem?.percentToBase || 0,
            percent: findedItem?.percent || 0,
            value: findedItem?.value || 0,
          };
        }),
      };
    })
    .concat(
      totals
        ? [
            {
              name: totalName || 'Total',
              datas: totals.map((total, index) => ({
                seriesName: totalName || 'Total',
                year: reports[index].year,
                month: reports[index].month,
                percent: 100,
                percentToBase: (total / totals[0]) * 100,
                value: total,
              })),
            },
          ]
        : [],
    )
    .sort((a, b) => {
      return (
        (b.datas[b.datas.length - 1].percent || 0) - (a.datas[a.datas.length - 1].percent || 0)
      );
    });

  return {
    series,
  };
};
