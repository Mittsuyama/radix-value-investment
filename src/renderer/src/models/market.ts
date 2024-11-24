import { StockBaseInfo, StockDetailInMarket } from '@renderer/types';
import { atom } from 'jotai';

export const stockBaseInfoListInMarketAtom = atom<StockBaseInfo[] | undefined>(undefined);
export const stockDetailListInMarketAtom = atom<StockDetailInMarket[] | undefined>(undefined);
