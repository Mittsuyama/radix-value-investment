import { memo, useMemo } from 'react';
import { FinancialReport } from '@renderer/types';
import { ACCOUNT_ITEM } from '@renderer/constants';
import { BaseLineChartCard } from '../BaselLineChartCard';

const getNumberFromReport = (report: FinancialReport, key: keyof typeof ACCOUNT_ITEM) => {
  return Number(report.data[ACCOUNT_ITEM[key]]) || 0;
};

interface CostProps {
  reports?: FinancialReport[];
}

export const Cost = memo<CostProps>(({ reports }) => {
  const totals = useMemo(
    () =>
      reports?.map(
        (report) =>
          getNumberFromReport(report, 'l-yysr-营业收入') -
          getNumberFromReport(report, 'l-yycb-营业成本'),
      ),
    [reports],
  );

  return (
    <BaseLineChartCard
      totals={totals}
      totalName="Operating Profit"
      reports={reports}
      title="Operating Profit & Cost Proportion"
      accountItemKeys={['l-xsfy-销售费用', 'l-glfy-管理费用', 'l-yffy-研发费用', 'l-lxfy-利息费用']}
    />
  );
});
Cost.displayName = 'Cost';
