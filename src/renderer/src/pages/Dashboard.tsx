import { memo } from 'react';
import { useMemoizedFn } from 'ahooks';
import { useAtomValue, useSetAtom } from 'jotai';
import { Spinner, Button } from '@radix-ui/themes';
import { ArchiveIcon } from '@radix-ui/react-icons';
import {
  dataDirectoryAtom,
  staredStockIdListAtom,
  stockWithReportsDetailListAtom,
} from '@renderer/models';
import { StockDetaiTable } from '@renderer/components/StockDetailTable';
import { waitForSelectDirectory } from '@renderer/api/request';

export const Dashboard = memo(() => {
  const favList = useAtomValue(staredStockIdListAtom);

  const setDir = useSetAtom(dataDirectoryAtom);
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

    return <StockDetaiTable customed records={list} />;
  });

  return (
    <div className="w-full h-full px-10">
      <div className="py-4">
        <div className="mb-4 flex flex-center justify-between gap-4">
          <div className="text-xl font-bold">Dashboard</div>
          <div className="flex gap-4">
            <Button
              onClick={async () => {
                const [directory] = await waitForSelectDirectory();
                setDir(directory);
                location.reload();
              }}
              value="solid"
            >
              Data Directory
            </Button>
          </div>
        </div>
        {contentRedender()}
      </div>
    </div>
  );
});
Dashboard.displayName = 'Dashboard';
