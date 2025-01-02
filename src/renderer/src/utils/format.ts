import { ACCOUNT_ITEM } from '@renderer/constants';
import {
  FinancialReport,
  FractileConfig,
  FractileIndex,
  StockWithReportsDetail,
} from '@renderer/types';

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

export const fractileConfigs: FractileConfig[] = [
  { title: 'ROE', compute: (detail) => detail.roe, better: 'high' },
  { title: 'STD (ROE)', compute: (detail) => detail.roe, better: 'low', weight: 0.3 },
  { title: 'GPR', compute: (detail) => detail.GPR, better: 'high' },
  { title: 'STD (GPR)', compute: (detail) => detail.GPR, better: 'low', weight: 0.3 },
  {
    title: 'Net Profit GROW (1)',
    compute: (detail) => {
      const a = getNumberInReport(detail.reports[0].data, 'l-jlr-净利润');
      const b = getNumberInReport(detail.reports[1].data, 'l-jlr-净利润');
      return (a - b) / b;
    },
    better: 'high',
    weight: 0.7,
  },
  {
    title: 'Net Profit GROW (2)',
    compute: (detail) => {
      const a = getNumberInReport(detail.reports[1].data, 'l-jlr-净利润');
      const b = getNumberInReport(detail.reports[2].data, 'l-jlr-净利润');
      return (a - b) / b;
    },
    better: 'high',
    weight: 0.3,
  },
  {
    title: 'Operation Porfit GROW',
    compute: (detail) => {
      const a = getNumberInReport(detail.reports[0].data, 'l-yysr-营业收入');
      const b = getNumberInReport(detail.reports[1].data, 'l-yysr-营业收入');
      return (a - b) / b;
    },
    better: 'high',
    weight: 0.3,
  },
  {
    title: 'PE',
    compute: (detail) => detail.ttmPE,
    better: 'low',
    special: (value) => (value < 0 ? 0 : undefined),
  },
  {
    title: 'PB',
    compute: (detail) => detail.pb,
    better: 'low',
    weight: 0.3,
  },
  { title: 'FCF', compute: (detail) => detail.fcf, better: 'high', weight: 0.3 },
  { title: 'FCF (avg3)', compute: (detail) => detail.fcfAvg3, better: 'high', weight: 0.7 },
  {
    title: '应收账款/流动资产',
    compute: (_, data) =>
      getNumberInReport(data, 'z-yszk-应收账款') / getNumberInReport(data, 'z-ldzchj-流动资产合计'),
    better: 'low',
  },
  {
    title: '存货/流动资产',
    compute: (_, data) =>
      getNumberInReport(data, 'z-ch-存货') / getNumberInReport(data, 'z-ldzchj-流动资产合计'),
    better: 'low',
  },
];

export const computeSingleScore = (detail: StockWithReportsDetail, index: FractileIndex) => {
  try {
    const value = index.compute(detail, detail.reports[0].data);

    if (Number.isNaN(value)) {
      return 5;
    }

    const special = index.special?.(value);

    if (typeof special === 'number') {
      return special;
    }

    if (value < index.values[0]) {
      if (index.better === 'high') {
        return 0;
      }
      return 10;
    }
    if (value > index.values[1]) {
      if (index.better === 'high') {
        return 10;
      }
      return 0;
    }

    if (index.better === 'high') {
      return ((value - index.values[0]) / (index.values[1] - index.values[0])) * 10;
    } else {
      return ((index.values[1] - value) / (index.values[1] - index.values[0])) * 10;
    }
  } catch (e) {
    console.error(`computeSingleScore ${detail.name}`, e);
    console.log(`${detail.name} data:`, detail);
    throw e;
  }
};

export const computeScore = (detail: StockWithReportsDetail, indices: FractileIndex[]) =>
  indices
    .map((index) => computeSingleScore(detail, index) * (index.weight ?? 1))
    .reduce((a, b) => a + b) / indices.reduce((pre, cur) => pre + (cur.weight ?? 1), 0);
