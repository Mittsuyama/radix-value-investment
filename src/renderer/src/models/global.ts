import { atomWithStorage } from 'jotai/utils';
import {
  CustomedStockInfo,
  ReportMonth,
  SortConfig,
  StockBaseInfo,
  ThemeType,
} from '@renderer/types';
import { ColorType } from '@renderer/constants';

enum StorageKey {
  CUSTOMED_STOCK_INFO_LIST = 'customed-stock-info-list',
  SARED_STOCK_ID_LIST = 'stared-stock-id-list',
}

export const colorAtom = atomWithStorage<ColorType>('color', 'indigo', undefined, {
  getOnInit: true,
});
export const themeAtom = atomWithStorage<ThemeType>('theme', 'light', undefined, {
  getOnInit: true,
});
export const staredStockIdListAtom = atomWithStorage<string[]>(
  StorageKey.SARED_STOCK_ID_LIST,
  [],
  undefined,
  { getOnInit: true },
);
export const customedStockInfoListAtom = atomWithStorage<CustomedStockInfo[]>(
  StorageKey.CUSTOMED_STOCK_INFO_LIST,
  [],
  undefined,
  { getOnInit: true },
);
export const stockBaseInfoListResourceAtom = atomWithStorage<Array<StockBaseInfo> | undefined>(
  'stock-base-info-list-resource',
  undefined,
  undefined,
  { getOnInit: true },
);
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

const safeJsonParse = <T>(str: string | null, defaultValue: T): T => {
  if (!str) {
    return defaultValue;
  }
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
};

export const getExportableData = () => ({
  [StorageKey.SARED_STOCK_ID_LIST]: safeJsonParse<string[]>(
    localStorage.getItem(StorageKey.SARED_STOCK_ID_LIST),
    [],
  ),
  [StorageKey.CUSTOMED_STOCK_INFO_LIST]: safeJsonParse<CustomedStockInfo[]>(
    localStorage.getItem(StorageKey.CUSTOMED_STOCK_INFO_LIST),
    [],
  ),
});
