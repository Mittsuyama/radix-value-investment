import { getStockBaseInfoListByFilterRequeset } from '@renderer/api';
import { safelyReadFileTextListUnderDirectory } from '@renderer/api';
import {
  Direcotry,
  stockBaseInfoListInMarketAtom,
  stockDetailListInMarketAtom,
} from '@renderer/models';
import { useMount } from 'ahooks';
import { useAtom } from 'jotai';
import { memo } from 'react';

export const Market = memo(() => {
  const [baseList, setBaseList] = useAtom(stockBaseInfoListInMarketAtom);
  const [details, setDetails] = useAtom(stockDetailListInMarketAtom);

  useMount(async () => {
    const res = await getStockBaseInfoListByFilterRequeset({
      minTotalMarketCAP: 10_000_000_000,
      isOverFiveYear: true,
    });
    setBaseList(res);
  });

  useMount(async () => {
    const res = await safelyReadFileTextListUnderDirectory(Direcotry.REPORTS);
    setDetails(
      res.map((text) => {
        try {
          return JSON.parse(text);
        } catch {
          // do nothing
        }
      }),
    );
  });

  return (
    <div className="w-full h-full px-10">
      <div className="py-4">
        <div className="mb-4 flex flex-center justify-between gap-4">
          <div className="text-xl font-bold">Market</div>
        </div>
        <div>Base Info Count: {baseList?.length ?? '-'}</div>
        <div>Detail Info Count: {details?.length ?? '-'}</div>
      </div>
    </div>
  );
});
Market.displayName = 'Market';
