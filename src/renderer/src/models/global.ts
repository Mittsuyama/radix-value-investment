import { atomWithStorage } from 'jotai/utils';
import { CustomedStockInfo, ReportMonth, StockBaseInfo, ThemeType } from '@renderer/types';
import { ColorType } from '@renderer/constants';

export const colorAtom = atomWithStorage<ColorType>('color', 'blue', undefined, {
  getOnInit: true,
});
export const themeAtom = atomWithStorage<ThemeType>('theme', 'light', undefined, {
  getOnInit: true,
});
export const staredStockIdListAtom = atomWithStorage<string[]>(
  'stared-stock-id-list',
  [],
  undefined,
  { getOnInit: true },
);
export const customedStockInfoListAtom = atomWithStorage<CustomedStockInfo[]>(
  'customed-stock-info-list',
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
