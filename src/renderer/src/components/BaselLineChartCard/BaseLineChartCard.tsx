import { renderToString } from 'react-dom/server';
import { useMemoizedFn } from 'ahooks';
import { memo, ReactNode, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import ReactEcharts from 'echarts-for-react';
import { Card, Text, Skeleton } from '@radix-ui/themes';
import { ACCOUNT_ITEM, getChartColors, getColorIndex } from '@renderer/constants';
import { FinancialReport } from '@renderer/types';
import { colorAtom, themeAtom } from '@renderer/models';
import { ChartDataItem, formatFinancialNumber, getLineData } from '@renderer/utils';

interface BaseLineChartCardProps {
  title: ReactNode;
  reports?: FinancialReport[];
  accountItemKeys: Array<keyof typeof ACCOUNT_ITEM>;

  totals?: number[];
  minPercent?: number;
  totalName?: string;
}

interface FormatterItemOriginData extends ChartDataItem {
  color: string;
}

interface FormatterItem {
  seriesName: string;
  data: {
    origin?: FormatterItemOriginData;
  };
}

export const BaseLineChartCard = memo<BaseLineChartCardProps>(
  ({ title, totals, totalName, accountItemKeys, minPercent, reports }) => {
    const theme = useAtomValue(themeAtom);
    const color = useAtomValue(colorAtom);
    const colors = useMemo(() => getChartColors(color), [color]);
    const reverseReports = useMemo(() => reports?.slice().reverse(), [reports]);
    const reverseTotals = useMemo(() => totals?.slice().reverse(), [totals]);

    const { series } = useMemo(
      () =>
        reverseReports
          ? getLineData({
              reports: reverseReports,
              accountItemKeys,
              totals: reverseTotals,
              totalName,
              minPercent,
            })
          : { series: undefined },
      [reverseReports, accountItemKeys, minPercent, totalName, reverseTotals],
    );

    const formatter = useMemoizedFn((valueList: FormatterItem[]) => {
      return renderToString(
        <table>
          {valueList
            .slice()
            .map((value) => value.data.origin)
            .filter((origin): origin is FormatterItemOriginData => !!origin?.value)
            .sort((a, b) => (b.value || -1) - (a.value || -1))
            .map(({ seriesName, percent, value, percentToBase, color }) => {
              return (
                <tr key={seriesName}>
                  <td>
                    <div className="w-[10px] h-[10px] rounded-lg" style={{ background: color }} />
                  </td>
                  <td>{seriesName}</td>
                  {totals ? (
                    <>
                      <td className="font-bold text-gray-12">{percent.toFixed(2) + '%'}</td>
                      <td>{formatFinancialNumber(value)}</td>
                      <td>{percentToBase.toFixed(2) + '%'}</td>
                    </>
                  ) : (
                    <td className="font-bold text-gray-12">{formatFinancialNumber(value)}</td>
                  )}
                </tr>
              );
            })}
        </table>,
      );
    });

    if (!reverseReports || !series) {
      return (
        <Card className="h-full flex flex-col">
          <div className="w-full h-full flex flex-col px-2">
            <Text size="3" className="font-bold mb-2">
              {title}
            </Text>
            <Skeleton>
              <div className="flex-1 w-full p-2"></div>
            </Skeleton>
          </div>
        </Card>
      );
    }

    return (
      <Card className="h-full flex flex-col">
        <div className="w-full h-full flex flex-col px-2">
          <Text size="3" className="font-bold mb-2">
            {title}
          </Text>
          <div className="flex-1 w-full p-2">
            <ReactEcharts
              style={{ width: '100%', height: '100%' }}
              theme={theme}
              option={{
                backgroundColor: 'transparent',
                grid: {
                  left: 30,
                  right: 0,
                  top: 20,
                  bottom: 19,
                },
                xAxis: {
                  data: reverseReports.map((item) => item.year),
                },
                legend: {
                  show: false,
                },
                tooltip: {
                  order: 'valueDesc',
                  trigger: 'axis',
                  formatter,
                  appendTo: () => document.body,
                  borderColor: colors[0],
                },
                yAxis: {},
                series: series.map(({ name, datas }, index) => ({
                  name,
                  type: 'line',
                  data: datas.map((data) => ({
                    value: data.percentToBase || undefined,
                    origin: {
                      ...data,
                      color: colors[getColorIndex(index, colors.length)],
                    },
                  })),
                  itemStyle: {
                    color: colors[getColorIndex(index, colors.length)],
                  },
                  lineStyle: {
                    color: colors[getColorIndex(index, colors.length)],
                  },
                  emphasis: {
                    disabled: true,
                  },
                })),
              }}
            />
          </div>
        </div>
      </Card>
    );
  },
);
BaseLineChartCard.displayName = 'BaseLineChartCard';
