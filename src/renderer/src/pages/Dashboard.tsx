import { memo, useRef, useEffect, ChangeEventHandler } from 'react';
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

const listAtom = atom<Array<StockWithReportsDetail> | null>(null);

export const Dashboard = memo(() => {
  const favList = useAtomValue(staredStockIdListAtom);
  const resource = useAtomValue(stockBaseInfoListResourceAtom);

  const [list, setList] = useAtom(listAtom);
  const fetchingRef = useRef(false);
  const loadFileInputRef = useRef<HTMLInputElement>(null);
  const downloadFileButtonRef = useRef<HTMLAnchorElement>(null);

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
    refresh();
  }, [refresh, favList]);

  const onFileUpload = useMemoizedFn<ChangeEventHandler<HTMLInputElement>>(async (e) => {
    if (e.target.files?.length) {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          try {
            const json = JSON.parse(e.target.result || '');
            Object.entries(json).forEach(([key, value]) => {
              localStorage.setItem(key, JSON.stringify(value));
            });
            location.reload();
          } catch {
            // do nothing
          }
        }
      };
    }
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
      <input
        ref={loadFileInputRef}
        type="file"
        onChange={onFileUpload}
        className="fixed top-0 left-0 invisible"
      />
      <div className="py-4">
        <div className="mb-4 flex flex-center justify-between gap-4">
          <div className="text-xl font-bold">Dashboard</div>
          <div className="flex gap-4">
            <a
              ref={downloadFileButtonRef}
              href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(getExportableData()))}`}
              download="datas.json"
              className="fixed top-0 left-0 invisible"
            >
              download
            </a>
            <Button onClick={() => loadFileInputRef.current?.click()} variant="surface">
              Import Datas
            </Button>
            <Button onClick={() => downloadFileButtonRef.current?.click()} variant="surface">
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
