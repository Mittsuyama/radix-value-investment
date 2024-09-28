import { memo, useRef, useEffect, useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { atom, useAtom, useAtomValue } from 'jotai';
import { Spinner, Button } from '@radix-ui/themes';
import { ArchiveIcon } from '@radix-ui/react-icons';
import { StockWithReportsDetail } from '@renderer/types';
import { getBatchStocksWithReportsDetailRequest } from '@renderer/api';
import {
  getExportableData,
  staredStockIdListAtom,
  stockBaseInfoListResourceAtom,
} from '@renderer/models';
import { StockDetaiTable } from '@renderer/components/StockDetailTable';
import {
  fetchFileText,
  waitForSelectDirectory,
  waitForSelectFile,
  waitForWriteFile,
} from '@renderer/api/request';

const listAtom = atom<Array<StockWithReportsDetail> | null>(null);

export const Dashboard = memo(() => {
  const favList = useAtomValue(staredStockIdListAtom);
  const resource = useAtomValue(stockBaseInfoListResourceAtom);

  const [list, setList] = useAtom(listAtom);
  const [reloading, setReloading] = useState(false);
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

  const onRefresh = useMemoizedFn(async () => {
    setReloading(true);
    try {
      if (!fetchingRef.current) {
        fetchingRef.current = true;
        const res = await getBatchStocksWithReportsDetailRequest({
          ids: favList,
          years: 3,
        });
        const sortedList = res.slice().sort((a, b) => b.totalMarketCap - a.totalMarketCap);
        setList(sortedList);
        fetchingRef.current = false;
      }
    } finally {
      setReloading(false);
    }
  });

  useEffect(() => {
    init();
  }, [init, favList]);

  const onUpload = useMemoizedFn(async () => {
    const [file] = await waitForSelectFile();
    const text = await fetchFileText(file);
    try {
      const json = JSON.parse(text || '');
      Object.entries(json).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
      location.reload();
    } catch {
      // do nothing
    }
  });

  const onDownload = useMemoizedFn(async () => {
    const [directory] = await waitForSelectDirectory();
    await waitForWriteFile(`${directory}/data.json`, JSON.stringify(getExportableData()));
  });

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
            <Button loading={reloading} onClick={onRefresh} variant="solid">
              Reload
            </Button>
            <Button onClick={onUpload} variant="surface">
              Import Datas
            </Button>
            <Button onClick={onDownload} variant="surface">
              Export Datas
            </Button>
          </div>
        </div>
        {contentRedender()}
      </div>
    </div>
  );
});
Dashboard.displayName = 'Dashboard';
