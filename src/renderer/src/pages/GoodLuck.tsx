import { memo, useState } from 'react';
import cls from 'classnames';
import { useMemoizedFn } from 'ahooks';
import { useAtomValue } from 'jotai';
import { Text, Button, Spinner } from '@radix-ui/themes';
import { StockWithReportsDetail } from '@renderer/types';
import {
  filterStocks,
  getTreeFinancialReportsRequest,
  transformToStockWithReportsDetail,
} from '@renderer/api';
import { StockDetaiTable } from '@renderer/components/StockDetailTable';
import { stockBaseInfoListResourceAtom } from '@renderer/models';
import { useRandomlyPickOneStock } from '@renderer/hooks';

const YEAR = 3;

export const GoodLuck = memo(() => {
  const resource = useAtomValue(stockBaseInfoListResourceAtom);
  const [records, setRecords] = useState<StockWithReportsDetail[] | null>(null);
  const [loading, setLoading] = useState(false);

  const onRandomlyPickOneStock = useRandomlyPickOneStock();

  const onPickTen = useMemoizedFn(async () => {
    if (!resource) {
      return;
    }
    try {
      setLoading(true);
      const options = filterStocks(resource, {
        ttmROE: [15, 1000],
        ttmPE: [0, 20],
        GPR: [25, 1000],
      })
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);
      const reportsList = await Promise.all(
        options.map(async (item) => await getTreeFinancialReportsRequest(item.id, YEAR + 1, [12])),
      );
      setRecords(
        options.map((item, index) => {
          const reports = reportsList[index].slice(0, YEAR);
          return transformToStockWithReportsDetail(item, reports, 12);
        }),
      );
    } finally {
      setLoading(false);
    }
  });

  const contentRender = useMemoizedFn(() => {
    if (!records) {
      return (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <Text size="9" className="font-bold mb-6">
            Good Luck
          </Text>
          <div className="flex items-center gap-4">
            <Button loading={loading} onClick={onPickTen}>
              Pick 20 Stocks
            </Button>
            <Button onClick={onRandomlyPickOneStock} variant="surface">
              Pick 1 Stock
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full p-6">
        <div>
          <StockDetaiTable records={records} />
        </div>
        <div className="flex justify-center items-center gap-4 py-6">
          <Button loading={loading} onClick={onPickTen}>
            Try Another 20 Stocks
          </Button>
          <Button onClick={onRandomlyPickOneStock} variant="surface">
            Pick 1 Stock
          </Button>
        </div>
      </div>
    );
  });

  return (
    <div className="relative w-full h-full p-6">
      <div className={cls('relative w-full h-full', { 'opacity-25': loading })}>
        {contentRender()}
      </div>
      {loading ? (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
          <Spinner />
        </div>
      ) : null}
    </div>
  );
});
GoodLuck.displayName = 'GoodLuck';
