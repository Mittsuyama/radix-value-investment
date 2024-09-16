import { FinancialReport, ReportMonth } from '@renderer/types/reports';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const genFinancialReport = (item: any): FinancialReport => {
  const date = item['REPORT_DATE'];
  const [year, monthStr] = date.toString().split('-');
  let month: ReportMonth = 12;
  if (monthStr === '06') {
    month = 6;
  } else if (monthStr === '09') {
    month = 9;
  } else if (monthStr === '03') {
    month = 3;
  }
  return {
    month,
    year: Number(year),
    data: item,
  };
};
