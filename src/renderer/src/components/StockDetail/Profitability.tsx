import { memo, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import ReactEcharts from 'echarts-for-react';
import { Card, Text } from '@radix-ui/themes';
import { FinancialReport } from '@renderer/types';
import { colorAtom, themeAtom } from '@renderer/models';
import { ColorMap } from '@renderer/constants';
import { computeSimpleCFC } from '@renderer/utils';

interface ProfitabilityProps {
  reports: FinancialReport[];
  /** 总市值 */
  cap: number;
}

export const Profitability = memo<ProfitabilityProps>((props) => {
  const { reports, cap } = props;
  const theme = useAtomValue(themeAtom);
  const color = useAtomValue(colorAtom);
  const colors = useMemo(() => ColorMap[color].slice().reverse(), [color]);

  const reversedReports = useMemo(() => reports.slice().reverse(), [reports]);
  const mll = reversedReports.map((item) => ({
    year: item.year,
    value: item.data['XSMLL'],
  }));
  const jlr = reversedReports.map((item) => ({
    year: item.year,
    value: item.data['XSJLL'],
  }));
  const roe = reversedReports.map((item) => ({
    year: item.year,
    value: item.data['ROEKCJQ'],
  }));
  const fcf = reversedReports.map((item) => ({
    year: item.year,
    value: (computeSimpleCFC([item], 1) / cap) * 100,
  }));
  const list = [
    {
      data: mll,
      name: 'Gross Profit Rate',
    },
    {
      data: jlr,
      name: 'Net Profit',
    },
    {
      data: roe,
      name: 'Return of Equity',
    },
    {
      data: fcf,
      name: 'Free Cash Flow',
    },
  ];

  return (
    <div className="h-full flex gap-4">
      <Card className="flex-1">
        <div className="w-full h-full flex flex-col">
          <Text size="3" className="font-bold mb-2">
            Profitability
          </Text>
          <div className="flex-1 w-full p-2">
            <ReactEcharts
              style={{ width: '100%', height: '100%' }}
              theme={theme}
              option={{
                backgroundColor: 'transparent',
                grid: {
                  left: 27,
                  right: 0,
                  bottom: 19,
                },
                xAxis: {
                  data: reversedReports.map((item) => item.year),
                },
                legend: {
                  data: list.map((item, index) => ({
                    name: item.name,
                    itemStyle: {
                      color: colors[index],
                    },
                  })),
                },
                tooltip: {
                  trigger: 'axis',
                  valueFormatter: (value: number) => (value ? `${value.toFixed(2)}%` : '-'),
                  appendTo: () => document.body,
                  borderColor: colors[0],
                },
                yAxis: {
                  max: 100,
                },
                series: list.map(({ name, data }, index) => ({
                  name,
                  type: 'bar',
                  data: data.map((item) => ({
                    value: item.value,
                    itemStyle: {
                      color: colors[index],
                    },
                  })),
                })),
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
});

Profitability.displayName = 'Profitability';
