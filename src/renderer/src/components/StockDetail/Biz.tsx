import { renderToString } from 'react-dom/server';
import { memo, useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { Card, Text, Spinner, HoverCard, Table } from '@radix-ui/themes';
import ReactEcharts from 'echarts-for-react';
import { BizItem } from '@renderer/types';
import { colorAtom, themeAtom } from '@renderer/models';
import { getChartColors, getColorIndex } from '@renderer/constants';
import { useAsyncEffect } from 'ahooks';
import { getBusinessRequest } from '@renderer/api';
import { InfoCircledIcon } from '@radix-ui/react-icons';

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
  const colors = useMemo(() => getChartColors(color), [color]);

  const sortedItems = useMemo(
    () =>
      items
        ?.filter((item) => item.MBI_RATIO > 0.05)
        ?.filter((item) => !item.ITEM_NAME.startsWith('其中:'))
        .slice()
        .sort((a, b) => (b.MBI_RATIO || -1) - (a.MBI_RATIO || -1)),
    [items],
  );
  const moreItems = useMemo(
    () =>
      items
        ?.filter((item) => !sortedItems?.some((si) => si.ITEM_NAME === item.ITEM_NAME))
        .slice()
        .sort((a, b) => (b.MBI_RATIO || -1) - (a.MBI_RATIO || -1)),
    [sortedItems, items],
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
          <Text size="3" className="font-bold">
            Business Proportion
          </Text>
          <div className="w-full flex-1 flex justify-center items-center">
            <Spinner />
          </div>
        </div>
      </Card>
    );
  }

  const usableItems = [...sortedItems, ...rest];

  return (
    <Card className="h-full flex flex-col">
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-2 z-20">
          <Text size="3" className="font-bold">
            Business Proportion
          </Text>
          {moreItems?.length ? (
            <HoverCard.Root>
              <HoverCard.Trigger>
                <div className="flex items-center gap-1 text-sm text-gray-10 cursor-pointer">
                  More Info
                  <InfoCircledIcon />
                </div>
              </HoverCard.Trigger>
              <HoverCard.Content>
                <Table.Root variant="surface">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Proportion</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>GPR</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {moreItems.map((item) => (
                      <Table.Row key={item.ITEM_NAME} className="hover:bg-accent-2">
                        <Table.RowHeaderCell>{item.ITEM_NAME}</Table.RowHeaderCell>
                        <Table.Cell>{(item.MBI_RATIO * 100).toFixed(2)}%</Table.Cell>
                        <Table.Cell>
                          {item.GROSS_RPOFIT_RATIO ? (
                            <span> (GPR: {(item.GROSS_RPOFIT_RATIO * 100).toFixed(2)}%)</span>
                          ) : null}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </HoverCard.Content>
            </HoverCard.Root>
          ) : null}
        </div>
        <div className="flex-1 w-full p-2 m-[-20px] self-center z-10">
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
                        style={{ background: colors[getColorIndex(dataIndex, colors.length)] }}
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
                      color: colors[getColorIndex(index, colors.length)],
                    },
                    emphasis: {
                      itemStyle: {
                        color: colors[getColorIndex(index, colors.length)],
                      },
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
