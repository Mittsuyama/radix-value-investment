import { memo, useRef, useEffect } from 'react';
import { useMemoizedFn } from 'ahooks';
import { atom, useAtom, useAtomValue } from 'jotai';
import { Spinner } from '@radix-ui/themes';
import { StockWithReportsDetail } from '@renderer/types';
import { getBatchStocksWithReportsDetailRequest } from '@renderer/api';
import { staredStockIdListAtom, stockBaseInfoListResourceAtom } from '@renderer/models';
import { StockDetaiTable } from '@renderer/components/StockDetailTable';
import { autoSort } from '@renderer/utils';

const listAtom = atom<Array<StockWithReportsDetail> | null>(null);

export const Dashboard = memo(() => {
  const favList = useAtomValue(staredStockIdListAtom);
  const resource = useAtomValue(stockBaseInfoListResourceAtom);

  const [list, setList] = useAtom(listAtom);
  const fetchingRef = useRef(false);

  const refresh = useMemoizedFn(async () => {
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
            years: 4,
          },
          resource,
        );
        const sortedList = autoSort(res);
        setList(sortedList);
        fetchingRef.current = false;
      }
    }
  });

  useEffect(() => {
    refresh();
  }, [refresh, favList]);

  return (
    <div className="w-full h-full px-10 ">
      <div className="py-4">
        <div className="text-xl font-bold mb-4">Dashboard</div>
        {list ? (
          <StockDetaiTable customed records={list} />
        ) : (
          <div className="w-full flex py-6">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
});
Dashboard.displayName = 'Dashboard';
