import { memo, useRef, useEffect } from 'react';
import { useMemoizedFn } from 'ahooks';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Spinner, Button } from '@radix-ui/themes';
import { ArchiveIcon } from '@radix-ui/react-icons';
import { StockWithReportsDetail } from '@renderer/types';
import { getBatchStocksWithReportsDetailRequest } from '@renderer/api';
import {
  dataDirectoryAtom,
  staredStockIdListAtom,
  stockBaseInfoListResourceAtom,
} from '@renderer/models';
import { StockDetaiTable } from '@renderer/components/StockDetailTable';
import { waitForSelectDirectory } from '@renderer/api/request';

const listAtom = atom<Array<StockWithReportsDetail> | null>(null);

export const Dashboard = memo(() => {
  const favList = useAtomValue(staredStockIdListAtom);
  const resource = useAtomValue(stockBaseInfoListResourceAtom);

  const setDir = useSetAtom(dataDirectoryAtom);
  const [list, setList] = useAtom(listAtom);
  const fetchingRef = useRef(false);

  const init = useMemoizedFn(async () => {
    if (!favList.length) {
      return;
    }
    // 增加项目再加载
    if (!list || favList.some((fav) => !list.some((item) => item.id === fav))) {
      if (!fetchingRef.current) {
        fetchingRef.current = true;
        const res = await getBatchStocksWithReportsDetailRequest(
          {
            ids: favList,
            years: 3,
          },
          resource,
        );
        const sortedList = res.slice().sort((a, b) => b.totalMarketCap - a.totalMarketCap);
        setList(sortedList);
        fetchingRef.current = false;
      }
    }
  });

  useEffect(() => {
    init();
  }, [init, favList]);

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
