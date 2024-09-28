import { memo, useEffect, useMemo, useState } from 'react';
import cls from 'classnames';
import { useAsyncEffect, useMemoizedFn } from 'ahooks';
import { useAtomValue } from 'jotai';
import { useLocation } from 'react-router-dom';
import { Separator, Skeleton } from '@radix-ui/themes';
import {
  staredStockIdListAtom,
  stockBaseInfoListResourceAtom,
  stockReviewEditorOpenAtom,
} from '@renderer/models';
import { StockBaseInfo } from '@renderer/types';
import { ColoredChangeRate } from '@renderer/components/ColoredChangeRate';
import { StockDetail } from '@renderer/components/StockDetail';
import { Editor } from '@renderer/components/Editor';

export const Analyst = memo(() => {
  const { search: searchStr } = useLocation();
  const staredList = useAtomValue(staredStockIdListAtom);
  const [currentInfo, setCurrentInfo] = useState<StockBaseInfo | null>(null);
  const [staredInfoList, setStaredInfoList] = useState<StockBaseInfo[] | null>(null);
  const resource = useAtomValue(stockBaseInfoListResourceAtom);
  const review = useAtomValue(stockReviewEditorOpenAtom);

  const search = useMemo(() => new URLSearchParams(searchStr), [searchStr]);
  const stockId = useMemo(() => search.get('id'), [search]);

  const [selectedStockId, setSelectedStockId] = useState(stockId);

  useAsyncEffect(async () => {
    if (!resource) {
      return;
    }
    const res = resource
      .filter((item) => staredList.includes(item.id))
      .filter((item) => item.id !== stockId);
    setStaredInfoList(res);
  }, [staredList, stockId, resource]);

  useEffect(() => {
    if (!resource) {
      return;
    }
    setSelectedStockId(stockId);
    const cur = resource.find((item) => item.id === stockId);
    if (cur) {
      setCurrentInfo(cur);
    }
  }, [stockId, resource]);

  const itemRender = useMemoizedFn((item: StockBaseInfo) => {
    return (
      <div
        key={item.id}
        onClick={() => setSelectedStockId(item.id)}
        className={cls('py-2 px-8 cursor-pointer', {
          'hover:bg-accent-2': selectedStockId !== item.id,
          'bg-accent-4': selectedStockId === item.id,
        })}
      >
        <div className="flex justify-between items-center">
          <div className="font-bold">{item.name}</div>
          <ColoredChangeRate className="text-sm" rate={item.changeRate} />
        </div>
        <div className="flex justify-between text-gray-10 text-sm">
          <div className="flex gap-1">
            <div>ROE:</div>
            <div>{item.ttmROE.toFixed(2) + '%'}</div>
          </div>
          <div className="flex gap-1">
            <div>PE:</div>
            <div>{item.ttmPE.toFixed(2)}</div>
          </div>
        </div>
      </div>
    );
  });

  const spinRender = useMemoizedFn(() => (
    <div className="px-8 py-2">
      <div className="flex justify-between items-center mb-1">
        <Skeleton>
          <div className="font-bold">Stock Name</div>
        </Skeleton>
      </div>
      <div className="flex justify-between text-gray-10 text-sm">
        <Skeleton>
          <div className="w-full">
            <div>ROE</div>
          </div>
        </Skeleton>
      </div>
    </div>
  ));

  const titleRender = useMemoizedFn((title: string) => (
    <div className="font-bold px-8 mt-4 mb-2 text-accent-10">{title}</div>
  ));

  return (
    <div className="w-full h-full flex overflow-hidden">
      <div className="flex-none overflow-auto w-60">
        {stockId ? (
          <div className="w-full">
            {titleRender('Base')}
            {currentInfo ? itemRender(currentInfo) : spinRender()}
          </div>
        ) : null}
        <div className="w-full">
          {titleRender('Stared')}
          {staredInfoList ? (
            staredInfoList.map((item) => itemRender(item))
          ) : (
            <>
              {spinRender()}
              {spinRender()}
              {spinRender()}
            </>
          )}
        </div>
      </div>
      <Separator style={{ height: '100%' }} orientation="vertical" />
      <div className="flex-1 flex overflow-hidden">
        <div className={cls('overflow-hidden', { 'w-full': !review, 'w-2/3': review })}>
          {selectedStockId ? <StockDetail stockId={selectedStockId} /> : null}
        </div>
        {review && selectedStockId ? (
          <div className="w-1/3">
            <Editor stockId={selectedStockId} />
          </div>
        ) : null}
      </div>
    </div>
  );
});
Analyst.displayName = 'Analyst';
