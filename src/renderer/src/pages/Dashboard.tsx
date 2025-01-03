import { memo } from 'react';
import { useMemoizedFn } from 'ahooks';
import { useAtomValue } from 'jotai';
import { Spinner, Button } from '@radix-ui/themes';
import { ArchiveIcon, ReloadIcon } from '@radix-ui/react-icons';
import { staredStockIdListAtom, stockWithReportsDetailListAtom } from '@renderer/models';
import { StockDetaiTable } from '@renderer/components/StockDetailTable';

export const Dashboard = memo(() => {
  const favList = useAtomValue(staredStockIdListAtom);

  const list = useAtomValue(stockWithReportsDetailListAtom);

  const contentRedender = useMemoizedFn(() => {
    if (!favList.length) {
      return (
        <div className="w-full flex flex-col justify-center items-center gap-4 py-10">
          <ArchiveIcon style={{ width: 42, height: 42 }} />
          <div>Data Empty</div>
        </div>
      );
    }

    if (!list) {
      return (
        <div className="w-full flex justify-center py-10">
          <Spinner />
        </div>
      );
    }

    return <StockDetaiTable records={list} />;
  });

  return (
    <div className="w-full h-full px-10">
      <div className="py-4">
        <div className="mb-4 flex flex-center justify-between gap-4">
          <div className="text-xl font-bold">Dashboard</div>
          <div className="flex gap-4">
            <Button onClick={() => location.reload()} variant="outline">
              <ReloadIcon />
              Reload
            </Button>
          </div>
        </div>
        {contentRedender()}
      </div>
    </div>
  );
});
Dashboard.displayName = 'Dashboard';
