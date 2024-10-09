import { ACCOUNT_ITEM } from '@renderer/constants';
import { FinancialReport } from '@renderer/types';

export interface FormatFinancialNumberOptions {
  unit?: '%' | 'none';
  replaceNaNWithZero?: boolean;
}

export const formatFinancialNumber = (
  data: unknown,
  options: FormatFinancialNumberOptions = {},
): string => {
  let num = NaN;
  if (typeof data === 'string') {
    num = Number(data);
  } else if (typeof data === 'number') {
    num = data;
  } else {
    num = NaN;
  }
  if (Number.isNaN(num)) {
    if (options.replaceNaNWithZero) {
      return '0';
    }
    return 'NaN';
  }
  if (Math.abs(num) > 1_0000_0000) {
    return `${(num / 1_0000_0000).toFixed(2)} 亿`;
  }
  if (Math.abs(num) > 1_0000) {
    return `${(num / 1_0000).toFixed(2)} 万`;
  }
  return `${num.toFixed(2)}${options.unit === 'none' ? '' : options.unit || ''}`;
};

export const getNumberInReport = (
  report: FinancialReport['data'],
  key: keyof typeof ACCOUNT_ITEM,
) => {
  return Number(report[ACCOUNT_ITEM[key]]) || 0;
};
