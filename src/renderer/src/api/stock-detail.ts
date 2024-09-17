import {
  FinancialReport,
  ReportMonth,
  StockBaseInfo,
  StockWithReportsDetail,
} from '@renderer/types';
import { computeSimpleCFC } from '@renderer/utils';
import { getStockBaseInfoListByFilterRequeset, FilterConfigs } from './stock-base';
import { getTreeFinancialReportsRequest } from './reports';

export interface FilterConfigsWithLocalCompute {
  ttmPE?: [number, number];
  ttmROE?: [number, number];
  GPR?: [number, number];
  ids?: string[];
}

interface Params
  extends Pick<FilterConfigs, 'minTotalMarketCAP' | 'isOverFiveYear' | 'maxPB' | 'minPB'>,
    FilterConfigsWithLocalCompute {
  years: number;
  month?: ReportMonth;
}

export const filterStocks = (datas: StockBaseInfo[], params: FilterConfigsWithLocalCompute) => {
  return datas.filter((item) => {
    if (params.ids && !params.ids.some((id) => item.id.includes(id))) {
      return false;
    }
    if (params.ttmPE && (item.ttmPE < params.ttmPE[0] || item.ttmPE > params.ttmPE[1])) {
      return false;
    }
    if (params.ttmROE && (item.ttmROE < params.ttmROE[0] || item.ttmPE > params.ttmROE[1])) {
      return false;
    }
    if (params.GPR && (item.GPR < params.GPR[0] || item.ttmPE > params.GPR[1])) {
      return false;
    }
    return true;
  });
};

export const transformToStockWithReportsDetail = (
  stock: StockBaseInfo,
  reports: FinancialReport[],
  month: ReportMonth,
) => {
  const yearReports = reports.filter((item) => item.month === month);
  return {
    ...stock,
    cfcAvg3: (computeSimpleCFC(yearReports, 3) / stock.totalMarketCap) * 100,
    cfc: (computeSimpleCFC(yearReports, 1) / stock.totalMarketCap) * 100,
    reports,
  };
};

export const getBatchStocksWithReportsDetailRequest = async (
  params: Params,
  cache?: StockBaseInfo[],
) => {
  const { month = 12 } = params;
  const res = cache ? cache : await getStockBaseInfoListByFilterRequeset(params);

  const baseInfoList = filterStocks(res, params);

  console.log(`${baseInfoList.length} financial reports fetching...`);
  let count = 0;

  const reportsList = await Promise.all(
    baseInfoList.map(async (item) => {
      const res = await getTreeFinancialReportsRequest(item.id, params.years + 1, [month]);
      count++;
      if (count % 10 === 0) {
        console.log('reports fetching complete:', count);
      }
      return res;
    }),
  );

  const list = baseInfoList.map<StockWithReportsDetail>((item, index) => {
    const reports = reportsList[index].slice(0, params.years);
    return transformToStockWithReportsDetail(item, reports, month);
  });
  return list;
};
