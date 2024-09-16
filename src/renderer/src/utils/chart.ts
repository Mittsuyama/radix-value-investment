import { ACCOUNT_ITEM } from '@renderer/constants';
import { FinancialReport } from '@renderer/types';

interface ChartDataItem {
  seriesName: string;
  percent: number;
  value: number;
  year: number;
  month: number;
}

interface GetValidItemsParams {
  report: FinancialReport;
  accountItemKeys: Array<keyof typeof ACCOUNT_ITEM>;
  total?: number;
  minPercent?: number;
}

const getValidItems = ({ report, total, accountItemKeys, minPercent }: GetValidItemsParams) => {
  const datas = accountItemKeys
    .map<ChartDataItem | undefined>((key) => {
      const value = Number(report.data[ACCOUNT_ITEM[key]]) || 0;
      const percent = ((Number(report.data[ACCOUNT_ITEM[key]]) || 0) / (total || 1)) * 100;
      if (typeof minPercent === 'undefined' || percent > minPercent) {
        const [, , chinese] = key.split('-');
        return {
          seriesName: chinese,
          value,
          percent,
          year: report.year,
          month: report.month,
        };
      }
      return undefined;
    })
    .filter(Boolean);

  const totalValue = datas.reduce((pre, cur) => pre + (cur?.value || 0), 0);
  const restItem = total
    ? [
        {
          year: report.year,
          month: report.month,
          seriesName: '剩余',
          value: total - totalValue,
          percent: totalValue / total,
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
  const itemsInEveryReports = reports.map((report) => {
    return getValidItems({
      report,
      total: totals?.[0],
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
        datas: itemsInEveryReports.map((items, index) => {
          const findedItem = items.find((item) => item.seriesName === name);
          return {
            year: reports[index].year,
            month: reports[index].month,
            percent: findedItem?.percent,
            value: findedItem?.value,
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
                year: reports[index].year,
                month: reports[index].month,
                percent: (total / totals[0]) * 100,
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
