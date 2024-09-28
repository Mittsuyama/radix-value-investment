import { memo, useEffect, useMemo, useState } from 'react';
import cls from 'classnames';
import { useMemoizedFn } from 'ahooks';
import { useAtomValue } from 'jotai';
import { useLocation } from 'react-router-dom';
import { Separator, Skeleton } from '@radix-ui/themes';
import {
  staredStockIdListAtom,
  stockBaseInfoListResourceAtom,
  stockReviewEditorOpenAtom,
  stockWithReportsDetailListAtom,
} from '@renderer/models';
import { StockBaseInfo } from '@renderer/types';
import { ColoredChangeRate } from '@renderer/components/ColoredChangeRate';
import { StockDetail } from '@renderer/components/StockDetail';
import { Editor } from '@renderer/components/Editor';

export const Analyst = memo(() => {
  const { search: searchStr } = useLocation();
  const staredList = useAtomValue(staredStockIdListAtom);
  const [currentInfo, setCurrentInfo] = useState<StockBaseInfo | null>(null);
  const stockDetailList = useAtomValue(stockWithReportsDetailListAtom);
  const resource = useAtomValue(stockBaseInfoListResourceAtom);
  const review = useAtomValue(stockReviewEditorOpenAtom);

  const search = useMemo(() => new URLSearchParams(searchStr), [searchStr]);
  const stockId = useMemo(() => search.get('id'), [search]);

  const [selectedStock, setSelectedStock] = useState<StockBaseInfo | null>(null);

  const staredInfoList = useMemo(() => {
    return stockDetailList
      ?.filter((item) => staredList.includes(item.id))
      ?.filter((item) => item.id !== stockId);
  }, [stockDetailList, stockId, staredList]);

  useEffect(() => {
    if (!resource) {
      return;
    }
    const cur = resource.find((item) => item.id === stockId);
    if (cur) {
      setSelectedStock(cur);
      setCurrentInfo(cur);
    }
  }, [stockId, resource]);

  const itemRender = useMemoizedFn((item: StockBaseInfo) => {
    return (
      <div
        key={item.id}
        onClick={() => setSelectedStock(item)}
        className={cls('py-2 px-4 cursor-pointer rounded', {
          'hover:bg-accent-2': selectedStock?.id !== item.id,
          'bg-accent-4': selectedStock?.id === item.id,
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
    <div className="px-4 py-2">
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
    <div className="font-bold px-4 mt-4 mb-2 text-accent-10">{title}</div>
  ));

  return (
    <div className="w-full h-full py-1 flex overflow-hidden">
      <div className="flex-none overflow-auto w-60 px-2">
        {stockId ? (
          <div className="w-full">
            {titleRender('Current')}
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
      <div style={{ height: 'calc(100% + 8px)', margin: '-4px 2px' }}>
        <Separator style={{ height: '100%' }} orientation="vertical" />
      </div>
      <div className="flex-1 flex">
        <div className={cls('overflow-hidden', { 'w-full': !review, 'flex-1': review })}>
          {selectedStock ? <StockDetail stockId={selectedStock.id} /> : null}
        </div>
        {review ? (
          <>
            <div style={{ height: 'calc(100% + 8px)', margin: '-4px 2px' }}>
              <Separator style={{ height: '100%' }} orientation="vertical" />
            </div>
            <div className="flex-1 overflow-hidden">
              {selectedStock ? (
                <Editor stockId={selectedStock.id} name={selectedStock.name} />
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
});
Analyst.displayName = 'Analyst';
