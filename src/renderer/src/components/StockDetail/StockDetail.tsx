import { memo, useMemo, useState } from 'react';
import cls from 'classnames';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useAsyncEffect } from 'ahooks';
import { Spinner, Badge, Button, DropdownMenu, Skeleton, HoverCard, Table } from '@radix-ui/themes';
import { ChatBubbleIcon, Link2Icon, DotFilledIcon } from '@radix-ui/react-icons';
import { getBatchStocksWithReportsDetailRequest } from '@renderer/api';
import {
  reportMonthAtom,
  stockBaseInfoListResourceAtom,
  stockReviewEditorOpenAtom,
  useFractileIndices,
} from '@renderer/models';
import { BalanceSheetType, ReportMonth, StockWithReportsDetail } from '@renderer/types';
import { StaredIconButton } from '@renderer/components/StaredIconButton';
import { CustomedStockInfoEditButton } from '@renderer/components/CustomedStockInfoEditButton';
import { computeScore, computeSingleScore, formatFinancialNumber } from '@renderer/utils';
import { BalanceSheetChartCard } from '@renderer/components/BalanceSheetChartCard';
import { ColoredText } from '@renderer/components/ColoredChangeRate';
import {
  CashFlowStatementCard,
  CashFlowStatementType,
} from '@renderer/components/CashFlowStatementCard';
import { Profitability } from './Profitability';
import { Cost } from './Cost';
import { Biz } from './Biz';
import { Base } from './Base';
import { Notice } from './Notice';
import { BaseLineChartCard } from '../BaselLineChartCard';

const ReportMonthList: Array<{ value: ReportMonth; label: string }> = [
  { value: 3, label: 'First Quarter (Month: 3)' },
  { value: 6, label: 'Half Year (Month: 6)' },
  { value: 9, label: 'Third Quarter (Month: 9)' },
  { value: 12, label: 'Annual (Month: 12)' },
];

const cashFlowSheets: CashFlowStatementType[] = ['operate', 'invest', 'finance'];

const balanceSheets: BalanceSheetType[] = [
  'current-asset',
  'non-currnet-asset',
  'current-debt',
  'non-current-debt',
];

interface StockDetailProps {
  stockId: string;
}

export const StockDetail = memo<StockDetailProps>(({ stockId }) => {
  const [month, setMonth] = useAtom(reportMonthAtom);
  const review = useAtomValue(stockReviewEditorOpenAtom);
  const resource = useAtomValue(stockBaseInfoListResourceAtom);
  const setOpen = useSetAtom(stockReviewEditorOpenAtom);
  const { indices, scoreFractiles } = useFractileIndices();

  const [maskLoading, setMaskLoading] = useState(true);
  const [info, setInfo] = useState<StockWithReportsDetail | null>(null);

  useAsyncEffect(async () => {
    try {
      setMaskLoading(true);
      const infoRes = await getBatchStocksWithReportsDetailRequest(
        {
          ids: [stockId],
          years: 5,
          month,
        },
        resource,
      );
      setInfo(infoRes[0]);
    } finally {
      setMaskLoading(false);
    }
  }, [stockId, month]);

  const score = useMemo(
    () => (indices && info ? computeScore(info, indices) : NaN),
    [indices, info],
  );

  return (
    <div className="relative w-full h-full overflow-y-auto overflow-x-hidden">
      <div className={cls('p-6 relative', { 'opacity-25': maskLoading })}>
        <div className="mb-2 flex justify-between items-center gap-x-4 gap-y-2 flex-wrap">
          <div className="flex items-center gap-4">
            {info ? (
              <>
                <div className="text-xl font-bold">{info.name}</div>
                <Badge>{info.industry}</Badge>
              </>
            ) : (
              <>
                <Skeleton>
                  <div className="text-xl font-bold">Name</div>
                </Skeleton>
                <Skeleton>
                  <Badge>industry</Badge>
                </Skeleton>
              </>
            )}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="ghost" style={{ alignItems: 'center', gap: 6 }}>
                  Type: {ReportMonthList.find((item) => item.value === month)?.label}
                  <DropdownMenu.TriggerIcon />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                {ReportMonthList.map((item) => (
                  <DropdownMenu.Item key={item.value} onClick={() => setMonth(item.value)}>
                    {item.label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
          <div className="flex items-center gap-4">
            <StaredIconButton variant="soft" id={stockId} />
            <CustomedStockInfoEditButton key={stockId} variant="outline" id={stockId} />
            <Button
              variant="outline"
              onClick={() =>
                info &&
                window.open(
                  `https://emweb.securities.eastmoney.com/pc_hsf10/pages/index.html?type=web&code=${info.stockExchangeName}${info.code}#/cwfx`,
                )
              }
            >
              <Link2Icon />
              Eastmoney
            </Button>
            <Button onClick={() => setOpen((pre) => !pre)}>
              <ChatBubbleIcon />
              Review
            </Button>
          </div>
        </div>
        {info ? (
          <div className="flex items-center gap-4 mb-4 text-gray-10">
            <HoverCard.Root>
              <HoverCard.Trigger>
                <div>
                  <ColoredText
                    text={Number.isNaN(score) ? '-' : score.toFixed(2).toString()}
                    className="font-sans font-normal cursor-pointer"
                    status={
                      Number.isNaN(score) || !scoreFractiles
                        ? 'unchange'
                        : score >= scoreFractiles[1]
                          ? 'up'
                          : score <= scoreFractiles[0]
                            ? 'down'
                            : 'unchange'
                    }
                    icon={<DotFilledIcon width={20} height={20} />}
                  />
                </div>
              </HoverCard.Trigger>
              <HoverCard.Content>
                {info && indices ? (
                  <Table.Root variant="surface">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Score</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Market</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {indices.map((item) => {
                        const value = item.compute(info, info.reports[0].data);
                        return (
                          <Table.Row key={item.title} className="hover:bg-accent-2">
                            <Table.RowHeaderCell>{item.title}</Table.RowHeaderCell>
                            <Table.Cell>{value.toFixed(2)}</Table.Cell>
                            <Table.Cell>{computeSingleScore(info, item).toFixed(2)}</Table.Cell>
                            <Table.Cell>
                              {`[${item.values[0].toFixed(2)}, ${item.values[1].toFixed(2)}]`}
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table.Root>
                ) : null}
              </HoverCard.Content>
            </HoverCard.Root>
            <div>
              PE: <span className="font-bold">{info.ttmPE.toFixed(2)}</span>
            </div>
            <div>
              ROE: <span className="font-bold">{info.ttmROE.toFixed(2)}%</span>
            </div>
            <div>
              PB: <span className="font-bold">{info.pb.toFixed(2)}</span>
            </div>
            <div>
              CAP: <span className="font-bold">{formatFinancialNumber(info.totalMarketCap)}</span>
            </div>
            <div>
              CODE: <span className="font-bold">{info.id}</span>
            </div>
          </div>
        ) : (
          <Skeleton>
            <div className="mb-4 w-[40%]">ROE</div>
          </Skeleton>
        )}
        {review ? (
          <>
            <div className="'w-full mb-4 flex gap-4 h-64">
              <div className="flex-[6] overflow-hidden">
                <Profitability reports={info?.reports} cap={info?.totalMarketCap} />
              </div>
            </div>
            <div className="'w-full mb-4 flex gap-4 h-64">
              <div className="flex-[4] overflow-hidden">
                <Biz loading={!info} stockId={stockId} />
              </div>
              <div className="flex-[5] overflow-hidden">
                <Cost reports={info?.reports} />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full mb-4 flex gap-4 h-80">
            <div className="flex-[6] overflow-hidden">
              <Profitability reports={info?.reports} cap={info?.totalMarketCap} />
            </div>
            <div className="flex-[4] overflow-hidden">
              <Biz loading={!info} stockId={stockId} />
            </div>
            <div className="flex-[5] overflow-hidden">
              <Cost reports={info?.reports} />
            </div>
          </div>
        )}
        {review ? (
          <>
            <div className="w-full h-64 mb-4 flex gap-4">
              {balanceSheets.slice(0, 2).map((type) => (
                <div key={type} className="flex-1 overflow-hidden">
                  <BalanceSheetChartCard type={type} reports={info?.reports} />
                </div>
              ))}
            </div>
            <div className="w-full h-64 mb-4 flex gap-4">
              {balanceSheets.slice(2, 4).map((type) => (
                <div key={type} className="flex-1 overflow-hidden">
                  <BalanceSheetChartCard type={type} reports={info?.reports} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-80 mb-4 flex gap-4">
            {balanceSheets.slice(0, 4).map((type) => (
              <div key={type} className="flex-1 overflow-hidden">
                <BalanceSheetChartCard type={type} reports={info?.reports} />
              </div>
            ))}
          </div>
        )}
        {review ? (
          <>
            <div className="w-full h-80 mb-4 flex gap-4">
              {cashFlowSheets.slice(0, 1).map((type) => (
                <div key={type} className="flex-1 overflow-hidden">
                  <CashFlowStatementCard type={type} reports={info?.reports} />
                </div>
              ))}
            </div>
            <div className="w-full h-80 mb-4 flex gap-4">
              {cashFlowSheets.slice(1, 3).map((type) => (
                <div key={type} className="flex-1 overflow-hidden">
                  <CashFlowStatementCard type={type} reports={info?.reports} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-80 mb-4 flex gap-4">
            {cashFlowSheets.map((type) => (
              <div key={type} className="flex-1 overflow-hidden">
                <CashFlowStatementCard type={type} reports={info?.reports} />
              </div>
            ))}
          </div>
        )}
        <div className="w-full h-80 mb-4 flex gap-4">
          <div className="flex-1 overflow-hidden">
            <BaseLineChartCard
              title="DSI & DSR"
              reports={info?.reports}
              accountItemKeys={['leading-chzzts-存货周转天数', 'leading-yszkzzts-应收账款周转天数']}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <Notice code={stockId.split('.')[0]} />
          </div>
        </div>
        <div className="w-full h-80 mb-4 flex gap-4">
          <div className="flex-1 overflow-auto">
            <Base stockId={stockId} />
          </div>
        </div>
      </div>
      {maskLoading ? (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
          <Spinner />
        </div>
      ) : null}
    </div>
  );
});
StockDetail.displayName = 'StockDetail';
