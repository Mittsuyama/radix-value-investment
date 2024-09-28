import { memo, useMemo, useState } from 'react';
import cls from 'classnames';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useAsyncEffect } from 'ahooks';
import { Spinner, Badge, Button, DropdownMenu, Skeleton, HoverCard } from '@radix-ui/themes';
import { ChatBubbleIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { getBatchStocksWithReportsDetailRequest } from '@renderer/api';
import {
  customedStockInfoListAtom,
  reportMonthAtom,
  stockBaseInfoListResourceAtom,
  stockReviewEditorOpenAtom,
} from '@renderer/models';
import { BalanceSheetType, ReportMonth, StockWithReportsDetail } from '@renderer/types';
import { StaredIconButton } from '@renderer/components/StaredIconButton';
import { CustomedStockInfoEditButton } from '@renderer/components/CustomedStockInfoEditButton';
import { formatFinancialNumber } from '@renderer/utils';
import { BalanceSheetChartCard } from '@renderer/components/BalanceSheetChartCard';
import {
  CashFlowStatementCard,
  CashFlowStatementType,
} from '@renderer/components/CashFlowStatementCard';
import { Profitability } from './Profitability';
import { Cost } from './Cost';
import { Biz } from './Biz';
import { Base } from './Base';
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
  const [maskLoading, setMaskLoading] = useState(true);
  const [month, setMonth] = useAtom(reportMonthAtom);

  const review = useAtomValue(stockReviewEditorOpenAtom);
  const setOpen = useSetAtom(stockReviewEditorOpenAtom);
  const customedInfoList = useAtomValue(customedStockInfoListAtom);
  const resource = useAtomValue(stockBaseInfoListResourceAtom);
  const [info, setInfo] = useState<StockWithReportsDetail | null>(null);

  const customedInfo = useMemo(
    () => customedInfoList.find((item) => item.id === stockId),
    [customedInfoList, stockId],
  );

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

  return (
    <div className="relative w-full h-full overflow-y-auto overflow-x-hidden">
      <div className={cls('p-6 relative', { 'opacity-25': maskLoading })}>
        <div className="mb-2 flex justify-between items-center gap-4 flex-wrap">
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
                  Report Type: {ReportMonthList.find((item) => item.value === month)?.label}
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
              Other Data
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                info && window.open(`https://data.eastmoney.com/notices/stock/${info.code}.html`)
              }
            >
              Annoucement
            </Button>
            <Button onClick={() => setOpen((pre) => !pre)}>
              <ChatBubbleIcon />
              Review
            </Button>
          </div>
        </div>
        {info ? (
          <div className="flex items-center gap-4 mb-4 text-gray-10">
            <div>
              CAP: <span className="font-bold">{formatFinancialNumber(info.totalMarketCap)}</span>
            </div>
            <div>
              PE: <span className="font-bold">{info.ttmPE.toFixed(2)}</span>
            </div>
            <div>
              ROE: <span className="font-bold">{info.ttmROE.toFixed(2)}%</span>
            </div>
            {customedInfo?.review ? (
              <HoverCard.Root>
                <HoverCard.Trigger>
                  <div className="cursor-pointer flex items-center gap-1">
                    <InfoCircledIcon />
                    Review
                  </div>
                </HoverCard.Trigger>
                <HoverCard.Content>
                  <pre className="w-full whitespace-normal">{customedInfo.review}</pre>
                </HoverCard.Content>
              </HoverCard.Root>
            ) : null}
          </div>
        ) : (
          <Skeleton>
            <div className="mb-4 w-[40%]">ROE</div>
          </Skeleton>
        )}
        <div className={cls('w-full mb-4 flex gap-4', { 'h-80': !review, 'h-64': review })}>
          <div className="flex-[6]">
            <Profitability
              key={`${stockId || stockId}-${month}`}
              reports={info?.reports}
              cap={info?.totalMarketCap}
            />
          </div>
          <div className="flex-[4]">
            <Biz loading={!info} key={`${stockId}-${month}`} stockId={stockId} />
          </div>
          <div className="flex-[5]">
            <Cost key={`${stockId}-${month}`} reports={info?.reports} />
          </div>
        </div>
        {review ? (
          <>
            <div className="w-full h-64 mb-4 flex gap-4 overflow-hidden">
              {balanceSheets.slice(0, 2).map((type) => (
                <div key={`${stockId}-${type}-${month}`} className="flex-1 overflow-hidden">
                  <BalanceSheetChartCard type={type} reports={info?.reports} />
                </div>
              ))}
            </div>
            <div className="w-full h-64 mb-4 flex gap-4 overflow-hidden">
              {balanceSheets.slice(2, 4).map((type) => (
                <div key={`${stockId}-${type}-${month}`} className="flex-1 overflow-hidden">
                  <BalanceSheetChartCard type={type} reports={info?.reports} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-80 mb-4 flex gap-4 overflow-hidden">
            {balanceSheets.slice(0, 4).map((type) => (
              <div key={`${stockId}-${type}-${month}`} className="flex-1 overflow-hidden">
                <BalanceSheetChartCard type={type} reports={info?.reports} />
              </div>
            ))}
          </div>
        )}
        <div className="w-full h-80 mb-4 flex gap-4">
          {cashFlowSheets.map((type) => (
            <div key={`${stockId}-${type}-${month}`} className="flex-1 overflow-hidden">
              <CashFlowStatementCard type={type} reports={info?.reports} />
            </div>
          ))}
        </div>
        <div className="w-full h-80 mb-4 flex gap-4">
          <div className="flex-1">
            <BaseLineChartCard
              title="DSI & DSR"
              reports={info?.reports}
              accountItemKeys={['leading-chzzts-存货周转天数', 'leading-yszkzzts-应收账款周转天数']}
            />
          </div>
          <div className="flex-1">
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
