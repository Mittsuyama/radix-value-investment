import { FinancialReport } from '@renderer/types';

export const printValuesWithinLimitInReports = (
  reports: FinancialReport[],
  limit: [number, number],
) => {
  console.log(
    Object.entries(reports[0].data).filter(([, value]) => {
      if (typeof value === 'number') {
        return value >= limit[0] && value <= limit[1];
      }
      return false;
    }),
  );
};
