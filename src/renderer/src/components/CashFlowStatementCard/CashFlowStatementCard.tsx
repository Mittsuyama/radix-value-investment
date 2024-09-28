import { memo, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { Card, Text, Skeleton } from '@radix-ui/themes';
import { ACCOUNT_ITEM, ColorMap, getColorIndex } from '@renderer/constants';
import ReactEcharts from 'echarts-for-react';
import { FinancialReport } from '@renderer/types';
import { formatFinancialNumber, getLineData } from '@renderer/utils';
import { colorAtom, themeAtom } from '@renderer/models';
import { useMemoizedFn } from 'ahooks';
import { renderToString } from 'react-dom/server';

export type CashFlowStatementType = 'operate' | 'invest' | 'finance';

interface CashFlowStatementCardProps {
  type: CashFlowStatementType;
  reports?: FinancialReport[];
}

type T = keyof typeof ACCOUNT_ITEM;
interface ItemConfig {
  positiveTotal: T;
  positive: Array<T>;
  negativeTotal: T;
  negative: Array<T>;
  rest: T;
}
const typeToCashFlowItems: Record<CashFlowStatementType, ItemConfig> = {
  operate: {
    positiveTotal: 'x-jyhdxjlrxj-经营活动现金流入小计',
    positive: [
      'x-xssptgldsddxj-销售商品、提供劳务收到的现金',
      'x-sddssfh-收到的税收返还',
      'x-sdqtyjyhdygdxj-收到其他与经营活动有关的现金',
    ],
    negativeTotal: 'x-jyhdxjlcxj-经营活动现金流出小计',
    negative: [
      'x-gmspjslwzfdxj-购买商品、接受劳务支付的现金',
      'x-zfgzgjwzgzfdxj-支付给职工以及为职工支付的现金',
      'x-zfdgzsf-支付的各项税费',
      'x-zfqtyjyhdygdxj-支付其他与经营活动有关的现金',
    ],
    rest: 'x-jyhdcsdxjllje-经营活动产生的现金流量净额',
  },
  invest: {
    positiveTotal: 'x-tzhdxjlrxj-投资活动现金流入小计',
    positive: [
      'x-qdtzsysddxj-取得投资收益收到的现金',
      'x-czgdzcwxzchqtcqzcshdxjje-处置固定资产、无形资产和其他长期资产收回的现金净额',
      'x-sddqtytzhdygdxj-收到的其他与投资活动有关的现金',
      'x-shtzsddxj-收回投资收到的现金',
    ],
    negativeTotal: 'x-tzhdxjlcxj-投资活动现金流出小计',
    negative: [
      'x-gjgdzcwxzchqtcqzczfdxj-购建固定资产、无形资产和其他长期资产支付的现金',
      'x-zfqtytzhdygdxj-支付其他与投资活动有关的现金',
      'x-tzzfdxj-投资支付的现金',
    ],
    rest: 'x-tzhdcsdxjllje-投资活动产生的现金流量净额',
  },
  finance: {
    positiveTotal: 'x-czhdxjlrxj-筹资活动现金流入小计',
    positive: [
      'x-xstzsddxj-吸收投资收到的现金',
      'x-sddqtyczhdygdxj-收到的其他与筹资活动有关的现金',
    ],
    negativeTotal: 'x-czhdxjlcxj-筹资活动现金流出小计',
    negative: [
      'x-fpgllrhcflxzfdxj-分配股利、利润或偿付利息支付的现金',
      'x-zfdqtyczhdygdxj-支付的其他与筹资活动有关的现金',
    ],
    rest: 'x-czhdcsdxjllje-筹资活动产生的现金流量净额',
  },
};

interface FormatterItemOriginData {
  color: string;
  originValue: number;
  value: number;
  seriesName: string;
}

interface FormatterItem {
  seriesName: string;
  data: {
    origin?: FormatterItemOriginData;
  };
}

export const CashFlowStatementCard = memo<CashFlowStatementCardProps>(({ type, reports }) => {
  const theme = useAtomValue(themeAtom);
  const color = useAtomValue(colorAtom);
  const colors = useMemo(() => ColorMap[color].slice().reverse(), [color]);
  const reverseReports = useMemo(() => reports?.slice().reverse(), [reports]);

  const positiveLineData = useMemo(() => {
    if (!reverseReports) {
      return undefined;
    }
    const { series } = getLineData({
      reports: reverseReports,
      accountItemKeys: typeToCashFlowItems[type].positive,
    });
    return series;
  }, [reverseReports, type]);

  const negativeLineData = useMemo(() => {
    if (!reverseReports) {
      return undefined;
    }
    const { series } = getLineData({
      reports: reverseReports,
      accountItemKeys: typeToCashFlowItems[type].negative,
    });
    return series;
  }, [reverseReports, type]);

  const restLineData = useMemo(() => {
    if (!reverseReports) {
      return undefined;
    }
    const { series } = getLineData({
      reports: reverseReports,
      accountItemKeys: [typeToCashFlowItems[type].rest],
    });
    return series[0];
  }, [reverseReports, type]);

  const formatter = useMemoizedFn((valueList: FormatterItem[]) => {
    return renderToString(
      <table>
        {valueList
          .slice()
          .map((value) => value.data.origin)
          .filter((origin): origin is FormatterItemOriginData => !!origin?.value)
          .sort((a, b) => (b.value || -1) - (a.value || -1))
          .map(({ seriesName, originValue, color }) => {
            return (
              <tr key={seriesName}>
                <td>
                  <div className="w-[10px] h-[10px] rounded-lg" style={{ background: color }} />
                </td>
                <td>{seriesName}</td>
                <td className="font-bold text-gray-12">{formatFinancialNumber(originValue)}</td>
              </tr>
            );
          })}
      </table>,
    );
  });

  if (!reverseReports || !negativeLineData || !positiveLineData || !restLineData) {
    return (
      <Card className="h-full flex flex-col">
        <div className="w-full h-full flex flex-col px-2">
          <Text size="3" className="font-bold mb-2">
            Cash Flow Of {`${type[0].toUpperCase()}${type.slice(1)}`}
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
          Cash Flow Of {`${type[0].toUpperCase()}${type.slice(1)}`}
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
              series: [
                ...positiveLineData.map(({ name, datas }, index) => ({
                  name,
                  type: 'line',
                  data: datas.map((data) => ({
                    value: data.value || undefined,
                    origin: {
                      ...data,
                      value: data.value || undefined,
                      originValue: data.value,
                      color: colors[getColorIndex(index + 1, colors.length)],
                    },
                  })),
                  itemStyle: {
                    color: colors[getColorIndex(index + 1, colors.length)],
                  },
                  lineStyle: {
                    color: colors[getColorIndex(index + 1, colors.length)],
                  },
                  emphasis: {
                    disabled: true,
                  },
                })),
                ...negativeLineData.map(({ name, datas }, index) => ({
                  name,
                  type: 'line',
                  data: datas.map((data) => ({
                    value: data.value ? data.value * -1 : undefined,
                    origin: {
                      ...data,
                      value: data.value ? data.value * -1 : undefined,
                      originValue: data.value,
                      color: colors[getColorIndex(index + 1, colors.length)],
                    },
                  })),
                  itemStyle: {
                    color: colors[getColorIndex(index + 1, colors.length)],
                  },
                  lineStyle: {
                    color: colors[getColorIndex(index + 1, colors.length)],
                  },
                  emphasis: {
                    disabled: true,
                  },
                })),
                {
                  name: restLineData.name,
                  type: 'line',
                  data: restLineData.datas.map((data) => ({
                    value: data.value || undefined,
                    origin: {
                      ...data,
                      value: data.value || undefined,
                      originValue: data.value,
                      color: colors[0],
                    },
                  })),
                  itemStyle: {
                    color: colors[0],
                  },
                  lineStyle: {
                    color: colors[0],
                  },
                  emphasis: {
                    disabled: true,
                  },
                },
              ],
            }}
          />
        </div>
      </div>
    </Card>
  );
});
CashFlowStatementCard.displayName = 'CashFlowStatementCard';
