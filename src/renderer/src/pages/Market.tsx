import { memo, useRef, useState } from 'react';
import { useMemoizedFn, useMount } from 'ahooks';
import { useAtom } from 'jotai';
import dayjs from 'dayjs';
import { Button, Progress, Spinner } from '@radix-ui/themes';
import {
  getBatchStocksWithReportsDetailRequest,
  getStockBaseInfoListByFilterRequeset,
  safelyReadFileTextListUnderDirectory,
  safelyWriteBatchFileTextUnderDirectory,
} from '@renderer/api';
import {
  Direcotry,
  stockBaseInfoListInMarketAtom,
  stockDetailListInMarketAtom,
  useSetFractileIndices,
} from '@renderer/models';
import { FractileIndex, StockDetailInMarket } from '@renderer/types';
import { computeScore, fractileConfigs } from '@renderer/utils';

export const Market = memo(() => {
  const [baseList, setBaseList] = useAtom(stockBaseInfoListInMarketAtom);
  const [fetching, setFetching] = useState(false);
  const fetchingRef = useRef(false);
  const setIndices = useSetFractileIndices();
  const [details, setDetails] = useAtom(stockDetailListInMarketAtom);

  const onCacheGet = useMemoizedFn(async () => {
    const res = await safelyReadFileTextListUnderDirectory(Direcotry.REPORTS);
    const list: StockDetailInMarket[] = [];
    res.forEach((text) => {
      try {
        const data = JSON.parse(text);
        list.push(data);
      } catch {
        // do nothing
      }
    });
    setDetails(list);
  });

  useMount(async () => {
    const res = await getStockBaseInfoListByFilterRequeset({
      minTotalMarketCAP: 10_000_000_000,
      isOverFiveYear: true,
    });
    setBaseList(res);
  });

  const onFetch = useMemoizedFn(async () => {
    if (!fetchingRef.current) {
      console.info('is not fetching');
      return;
    }
    if (!baseList || !details) {
      console.error(!baseList ? 'no baseList' : 'no ketails');
      return;
    }
    const batch = 10;
    const set = new Set(
      details
        .filter((item) => {
          const time = dayjs(item.updateTime).unix();
          // 超过一天再才重新请求
          if (dayjs().unix() - time < 86400) {
            return true;
          }
          return false;
        })
        .map((item) => item.id),
    );

    const ids = baseList
      .filter((item) => !set.has(item.id))
      .slice(0, batch)
      .map((item) => item.id);

    if (!ids.length) {
      // timeout 给个 loading 效果
      setTimeout(() => {
        setFetching(false);
      }, 500);
      return;
    }

    const resList = (
      await getBatchStocksWithReportsDetailRequest({ ids, years: 5 }, baseList)
    ).map<StockDetailInMarket>((item) => ({
      ...item,
      updateTime: dayjs().toString(),
    }));
    await safelyWriteBatchFileTextUnderDirectory(
      Direcotry.REPORTS,
      resList.map((item) => ({ name: `${item.id}.json`, text: JSON.stringify(item) })),
    );
    setDetails([...details.filter((item) => !ids.includes(item.id)), ...resList]);

    if (fetchingRef.current) {
      onFetch();
    }
  });

  const onStop = useMemoizedFn(() => {
    fetchingRef.current = false;
    setFetching(false);
  });

  const computeIndices = useMemoizedFn(() => {
    if (!details) {
      return undefined;
    }
    const indices = fractileConfigs.map<FractileIndex>((config) => {
      const values = details
        .map((item) => config.compute(item, item.reports[0].data))
        .filter((num) => !Number.isNaN(num));
      values.sort((a, b) => a - b);
      // 取 10% - 90% 分位数据
      const range = values.slice(
        Math.ceil(values.length / 10),
        Math.ceil((values.length / 10) * 9),
      );
      return {
        title: config.title,
        compute: config.compute,
        better: config.better,
        values: [range[0], range[range.length - 1]],
      };
    });
    const scores = details.map((detail) => computeScore(detail, indices));

    scores.sort((a, b) => a - b);
    const range = scores.slice(
      Math.ceil((scores.length / 10) * 2),
      Math.ceil((scores.length / 10) * 8),
    );

    setIndices({
      indices: indices.map((item) => item.values),
      scoreFractiles: [range[0], range[range.length - 1]],
    });
  });

  return (
    <div className="w-full h-full px-10">
      <div className="py-4">
        <div className="mb-4 flex flex-center justify-between gap-4">
          <div className="text-xl font-bold">Market</div>
        </div>
        <div>Base Info Count: {baseList?.length ?? '-'}</div>
        <div className="flex items-center gap-4 my-2">
          Detail Info Count: {details?.length ?? '-'}
          <Button variant="outline" onClick={onCacheGet}>
            Get Cache
          </Button>
        </div>
        {fetching && baseList ? (
          <div className="my-4 flex items-center gap-4">
            <Spinner />
            <Progress value={((details?.length || 0) / baseList.length) * 100} />
          </div>
        ) : null}
        <div className="my-4 flex gap-4">
          {fetching ? (
            <Button variant="outline" onClick={onStop} loading={!baseList}>
              Stop
            </Button>
          ) : (
            <Button
              onClick={() => {
                fetchingRef.current = true;
                setFetching(true);
                onFetch();
              }}
              variant="outline"
              loading={!baseList}
            >
              Fetch Data
            </Button>
          )}
          <Button onClick={computeIndices}>Compute Indices</Button>
        </div>
      </div>
    </div>
  );
});
Market.displayName = 'Market';
