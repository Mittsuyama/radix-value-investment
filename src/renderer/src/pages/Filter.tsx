import { memo, useRef, useEffect } from 'react';
import { useMemoizedFn } from 'ahooks';
import { atom, useAtom, useAtomValue } from 'jotai';
import { Spinner } from '@radix-ui/themes';
import { StockWithReportsDetail } from '@renderer/types';
import { getBatchStocksWithReportsDetailRequest } from '@renderer/api';
import { StockDetaiTable } from '@renderer/components/StockDetailTable';
import { autoSort, getStockScore, avg } from '@renderer/utils';
import { stockBaseInfoListResourceAtom } from '@renderer/models';

interface StocksGroupByInudstryType {
  industry: string;
  list: StockWithReportsDetail[];
}

const listAtom = atom<Array<StocksGroupByInudstryType> | null>(null);

export const Filter = memo(() => {
  const [groupList, setGroupList] = useAtom(listAtom);
  const resource = useAtomValue(stockBaseInfoListResourceAtom);
  const fetchingRef = useRef(false);

  const refresh = useMemoizedFn(async () => {
    if (groupList) {
      return;
    }
    if (!fetchingRef.current) {
      fetchingRef.current = true;
      const res = await getBatchStocksWithReportsDetailRequest(
        {
          years: 3,
          isOverFiveYear: true,
          minTotalMarketCAP: 5_000_000_000,
          ttmROE: [15, 1000],
          ttmPE: [0, 20],
          GPR: [25, 1000],
        },
        resource,
      );
      const sortedList = autoSort(res);
      const groupListRes: Array<StocksGroupByInudstryType> = [];
      sortedList.forEach((item) => {
        let group = groupListRes.find((group) => group.industry === item.industry);
        if (!group) {
          group = { industry: item.industry, list: [] };
          groupListRes.push(group);
        }
        group.list.push(item);
      });
      // 按照每组个数从高到低排序
      groupListRes.sort(
        (a, b) =>
          avg(b.list.map((item) => getStockScore(item))) -
          avg(a.list.map((item) => getStockScore(item))),
      );
      setGroupList(groupListRes);
      fetchingRef.current = false;
    }
  });

  useEffect(() => {
    refresh();
  }, [refresh]);

  const contentRender = useMemoizedFn(() => {
    if (!groupList) {
      return (
        <div className="w-full flex justify-center py-6">
          <Spinner />
        </div>
      );
    }
    return groupList.map((group) => {
      return (
        <div className="py-6" key={group.industry}>
          <div className="mb-4 font-bold">{group.industry}</div>
          <div>
            <StockDetaiTable records={group.list} />
          </div>
        </div>
      );
    });
  });

  return <div className="w-full h-full px-10 ">{contentRender()}</div>;
});
Filter.displayName = 'Filter';
