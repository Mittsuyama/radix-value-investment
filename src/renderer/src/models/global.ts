import { atomWithStorage } from 'jotai/utils';
import {
  CustomedStockInfo,
  ReportMonth,
  SortConfig,
  StockBaseInfo,
  StockWithReportsDetail,
  ThemeType,
} from '@renderer/types';
import { ColorType } from '@renderer/constants';
import { atom } from 'jotai';

export enum StorageKey {
  CUSTOMED_STOCK_INFO_LIST = 'customed-stock-info-list',
  SARED_STOCK_ID_LIST = 'stared-stock-id-list',
  STOCK_REVIEW = 'stock-review',
  DATA_DIRECTORY = 'data-directory',
}

export enum Direcotry {
  REVIEW = '/review/',
  GLOBAL = '/global/',
  REPORTS = '/reports/',
}

export const colorAtom = atomWithStorage<ColorType>('color', 'indigo', undefined, {
  getOnInit: true,
});
export const themeAtom = atomWithStorage<ThemeType>('theme', 'light', undefined, {
  getOnInit: true,
});
export const dataDirectoryAtom = atomWithStorage<string | null>(
  StorageKey.DATA_DIRECTORY,
  null,
  undefined,
  {
    getOnInit: true,
  },
);
export const staredStockIdListAtom = atom<string[]>([]);
export const jMapAtom = atom<Map<string, number>>(new Map());
export const weekKJMapAtom = atom<Map<string, number>>(new Map());
export const customedStockInfoListAtom = atom<CustomedStockInfo[]>([]);
export const stockReviewEditorOpenAtom = atomWithStorage<boolean>(
  'stock-review-editor-open',
  false,
  undefined,
  { getOnInit: true },
);

export const stockBaseInfoListResourceAtom = atom<Array<StockBaseInfo> | undefined>(undefined);

export const reportMonthAtom = atomWithStorage<ReportMonth>('report-month', 12, undefined, {
  getOnInit: true,
});
export const sortConfigAtom = atomWithStorage<SortConfig | undefined>(
  'sort-config',
  {
    direction: 'desc',
    key: 'CAP',
  },
  undefined,
  {
    getOnInit: true,
  },
);

export const stockWithReportsDetailListAtom = atom<Array<StockWithReportsDetail> | null>(null);
