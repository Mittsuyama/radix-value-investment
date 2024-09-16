import { BalanceSheetType } from '@renderer/types';
import {
  ACCOUNT_ITEM,
  CURRENT_ASSET,
  NON_CURRENT_ASSET,
  CURRENT_DEBT,
  NON_CURRENT_DEBT,
} from './account-items';

export const sheetType2Title: Record<BalanceSheetType, string> = {
  asset: 'Assets',
  debt: 'Liabilities',
  'current-asset': 'Current Assets',
  'non-currnet-asset': 'Non Current Assets',
  'current-debt': 'Current Liabilities',
  'non-current-debt': 'Non Current Liabilities',
};

export const totalKeyRecord: Record<BalanceSheetType, keyof typeof ACCOUNT_ITEM> = {
  asset: 'z-zczj-资产总计',
  debt: 'z-fzhj-负债合计',
  'current-asset': 'z-ldzchj-流动资产合计',
  'non-currnet-asset': 'z-fldzchj-非流动资产合计',
  'current-debt': 'z-ldfzhj-流动负债合计',
  'non-current-debt': 'z-fldfzhj-非流动负债合计',
};

type K = keyof typeof ACCOUNT_ITEM;

const currentAssetItemKeys = Object.keys(CURRENT_ASSET) as K[];
const nonCurrentAssetItemKeys: K[] = Object.keys(NON_CURRENT_ASSET) as K[];
const currentDebtItemKeys = Object.keys(CURRENT_DEBT) as K[];
const nonCurrentDebtItemKeys = Object.keys(NON_CURRENT_DEBT) as K[];
const assetItemKeys = [...currentAssetItemKeys, ...nonCurrentAssetItemKeys];
const debtItemKeys = [...currentDebtItemKeys, ...nonCurrentDebtItemKeys];

export const sheetType2Keys: Record<BalanceSheetType, Array<keyof typeof ACCOUNT_ITEM>> = {
  asset: assetItemKeys,
  debt: debtItemKeys,
  'current-asset': currentAssetItemKeys,
  'non-currnet-asset': nonCurrentAssetItemKeys,
  'current-debt': currentDebtItemKeys,
  'non-current-debt': nonCurrentDebtItemKeys,
};
