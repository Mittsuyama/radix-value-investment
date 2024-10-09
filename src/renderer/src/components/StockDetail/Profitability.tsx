import { memo, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import ReactEcharts from 'echarts-for-react';
import { Card, Skeleton, Text } from '@radix-ui/themes';
import { FinancialReport } from '@renderer/types';
import { colorAtom, themeAtom } from '@renderer/models';
import { getChartColors, getColorIndex } from '@renderer/constants';
import { computeSimpleCFC, getNumberInReport } from '@renderer/utils';

interface ProfitabilityProps {
  reports?: FinancialReport[];
  /** 总市值 */
  cap?: number;
}

export const Profitability = memo<ProfitabilityProps>((props) => {
  const { reports, cap } = props;
  const theme = useAtomValue(themeAtom);
  const color = useAtomValue(colorAtom);
  const colors = useMemo(() => getChartColors(color), [color]);

  const reversedReports = useMemo(() => reports?.slice().reverse(), [reports]);

  if (!reversedReports || !cap) {
    return (
      <div className="h-full flex gap-4">
        <Card className="flex-1">
          <div className="w-full h-full flex flex-col px-2">
            <Text size="3" className="font-bold mb-2">
              Profitability
            </Text>
            <Skeleton>
              <div className="flex-1 w-full p-2" />
            </Skeleton>
          </div>
        </Card>
      </div>
    );
  }

  const mll = reversedReports?.map((item) => ({
    year: item.year,
    value: getNumberInReport(item.data, 'leading-xsmll-销售毛利率'),
  }));
  const jlr = reversedReports?.map((item) => ({
    year: item.year,
    value: getNumberInReport(item.data, 'leading-xsjll-销售净利率'),
  }));
  const yylrl = reversedReports?.map((item) => ({
    year: item.year,
    value:
      ((getNumberInReport(item.data, 'l-yysr-营业收入') -
        getNumberInReport(item.data, 'l-yycb-营业成本') -
        getNumberInReport(item.data, 'l-xsfy-销售费用') -
        getNumberInReport(item.data, 'l-glfy-管理费用') -
        getNumberInReport(item.data, 'l-yffy-研发费用') -
        Math.max(0, getNumberInReport(item.data, 'l-lxfy-利息费用'))) /
        getNumberInReport(item.data, 'l-yysr-营业收入')) *
      100,
  }));
  const roe = reversedReports?.map((item) => ({
    year: item.year,
    value: getNumberInReport(item.data, 'leading-kfjqroe-扣非加权ROE'),
  }));
  const fcf = reversedReports?.map((item) => ({
    year: item.year,
    value: (computeSimpleCFC([item], 1) / cap) * 100,
  }));
  const list = [
    {
      data: mll,
      name: 'Gross Profit Rate',
    },
    {
      data: yylrl,
      name: 'Operate Profit',
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
        <div className="w-full h-full flex flex-col px-2">
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
                  top: 15,
                  left: 27,
                  right: 0,
                  bottom: 19,
                },
                xAxis: {
                  data: reversedReports.map((item) => item.year),
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
                      color: colors[getColorIndex(index, colors.length)],
                    },
                  })),
                  emphasis: {
                    disabled: true,
                  },
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
