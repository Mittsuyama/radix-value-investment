import { memo, useState } from 'react';
import cls from 'classnames';
import { useAtom, useAtomValue } from 'jotai';
import { useAsyncEffect } from 'ahooks';
import { Spinner, Badge, Button, DropdownMenu } from '@radix-ui/themes';
import { getBatchStocksWithReportsDetailRequest, getBusinessRequest } from '@renderer/api';
import { reportMonthAtom, stockBaseInfoListResourceAtom } from '@renderer/models';
import { BalanceSheetType, BizItem, ReportMonth, StockWithReportsDetail } from '@renderer/types';
import { StaredIconButton } from '@renderer/components/StaredIconButton';
import { CustomedStockInfoEditButton } from '@renderer/components/CustomedStockInfoEditButton';
import { BalanceSheetChartCard } from '../BalanceSheetChartCard/BalanceSheetChartCard';
import { Profitability } from './Profitability';
import { Cost } from './Cost';
import { Biz } from './Biz';

const ReportMonthList: Array<{ value: ReportMonth; label: string }> = [
  { value: 3, label: 'First Quarter (Month: 3)' },
  { value: 6, label: 'Half Year (Month: 6)' },
  { value: 9, label: 'Third Quarter (Month: 9)' },
  { value: 12, label: 'Annual (Month: 12)' },
];

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
  const [info, setInfo] = useState<StockWithReportsDetail | null>(null);
  const [business, setBusiness] = useState<Array<BizItem> | null>(null);
  const [maskLoading, setMaskLoading] = useState(true);
  const resource = useAtomValue(stockBaseInfoListResourceAtom);
  const [month, setMonth] = useAtom(reportMonthAtom);

  useAsyncEffect(async () => {
    try {
      setMaskLoading(true);
      const [infoRes, bizRes] = await Promise.all([
        getBatchStocksWithReportsDetailRequest(
          {
            ids: [stockId],
            years: 5,
            month,
          },
          resource,
        ),
        getBusinessRequest(stockId),
      ]);
      setInfo(infoRes[0]);
      setBusiness(bizRes.bizListByProduct);
    } finally {
      setMaskLoading(false);
    }
  }, [stockId, month]);

  if (!info || !business) {
    return (
      <div className="p-6">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-auto">
      <div className={cls('p-6 relative', { 'opacity-25': maskLoading })}>
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold">{info.name}</div>
            <Badge>{info.industry}</Badge>
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
            <StaredIconButton id={stockId} />
            <CustomedStockInfoEditButton variant="outline" id={stockId} />
            <Button
              variant="outline"
              onClick={() =>
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
                window.open(`https://data.eastmoney.com/notices/stock/${info.code}.html`)
              }
            >
              Annoucement
            </Button>
          </div>
        </div>
        <div className="w-full h-80 mb-4 flex gap-4">
          <div className="flex-[6]">
            <Profitability key={info.id} reports={info.reports} cap={info.totalMarketCap} />
          </div>
          <div className="flex-[4]">
            <Biz key={info.id} items={business} />
          </div>
          <div className="flex-[5]">
            <Cost key={info.id} reports={info.reports} />
          </div>
        </div>
        <div className="w-full h-80 mb-4 flex gap-4">
          {balanceSheets.map((type) => (
            <div key={`${info.id}-${type}`} className="flex-1">
              <BalanceSheetChartCard type={type} reports={info.reports} />
            </div>
          ))}
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
