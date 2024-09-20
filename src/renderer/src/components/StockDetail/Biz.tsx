import { renderToString } from 'react-dom/server';
import { memo, useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { Card, Skeleton, Text } from '@radix-ui/themes';
import ReactEcharts from 'echarts-for-react';
import { BizItem } from '@renderer/types';
import { colorAtom, themeAtom } from '@renderer/models';
import { ColorMap } from '@renderer/constants';
import { useAsyncEffect } from 'ahooks';
import { getBusinessRequest } from '@renderer/api';

interface BizProps {
  stockId: string;
  loading?: boolean;
}

export const Biz = memo<BizProps>(({ stockId, loading }) => {
  const [items, setItems] = useState<BizItem[] | null>(null);

  useAsyncEffect(async () => {
    const res = await getBusinessRequest(stockId);
    setItems(res.bizListByProduct);
  }, [stockId]);

  const theme = useAtomValue(themeAtom);
  const color = useAtomValue(colorAtom);
  const colors = useMemo(() => ColorMap[color].slice().reverse(), [color]);

  const sortedItems = useMemo(
    () =>
      items
        ?.filter((item) => item.MBI_RATIO > 0.05)
        .sort((a, b) => {
          if (a.GROSS_RPOFIT_RATIO && b.GROSS_RPOFIT_RATIO) {
            return b.GROSS_RPOFIT_RATIO - a.GROSS_RPOFIT_RATIO;
          }
          return b.MBI_RATIO - a.MBI_RATIO;
        }),
    [items],
  );
  const rest = useMemo<Array<BizItem>>(() => {
    if (!items) {
      return [];
    }
    const sm = items.filter((item) => item.MBI_RATIO <= 0.05);
    if (!sm.length) {
      return [];
    }
    return [
      {
        ITEM_NAME: '剩余',
        MBI_RATIO: sm.reduce((pre, cur) => pre + cur.MBI_RATIO, 0),
        GROSS_RPOFIT_RATIO:
          sm.reduce((pre, cur) => (cur.GROSS_RPOFIT_RATIO || 0) + pre, 0) / sm.length,
        SECUCODE: '',
        SECURITY_CODE: '',
        MAINOP_TYPE: '1',
        MAIN_BUSINESS_INCOME: 0,
        RANK: 1,
        REPORT_DATE: '',
      },
    ];
  }, [items]);

  if (!sortedItems || loading) {
    return (
      <Card className="h-full flex flex-col">
        <div className="w-full h-full flex flex-col">
          <Text size="3" className="font-bold mb-2">
            Business Proportion
          </Text>
          <Skeleton>
            <div className="flex-1 w-full p-2" />
          </Skeleton>
        </div>
      </Card>
    );
  }

  const usableItems = [...sortedItems, ...rest];

  return (
    <Card className="h-full flex flex-col">
      <div className="w-full h-full flex flex-col">
        <Text size="3" className="font-bold mb-2">
          Business Proportion
        </Text>
        <div className="flex-1 w-full p-2">
          <ReactEcharts
            style={{ width: '100%', height: '100%' }}
            theme={theme}
            option={{
              backgroundColor: 'transparent',
              tooltip: {
                formatter: (params: { dataIndex: number }) => {
                  const { dataIndex } = params;
                  const item = usableItems[dataIndex];
                  return renderToString(
                    <div className="flex items-center gap-3">
                      <div
                        className=" w-[10px] h-[10px] rounded-lg"
                        style={{ background: colors[dataIndex] }}
                      />
                      <div className="font-bold">{item.ITEM_NAME}</div>
                      <div>
                        <span>{(item.MBI_RATIO * 100).toFixed(2)}%</span>
                        {item.GROSS_RPOFIT_RATIO ? (
                          <span> (GPR: {(item.GROSS_RPOFIT_RATIO * 100).toFixed(2)}%)</span>
                        ) : null}
                      </div>
                    </div>,
                  );
                },
                appendTo: () => document.body,
              },
              series: [
                {
                  type: 'pie',
                  data: usableItems.map((item, index) => ({
                    value: item.MBI_RATIO,
                    name: item.ITEM_NAME,
                    itemStyle: {
                      color: colors[index],
                    },
                  })),
                  label: {
                    position: 'inside',
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
Biz.displayName = 'Biz';
