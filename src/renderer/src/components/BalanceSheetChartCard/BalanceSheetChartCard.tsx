import { memo, useMemo } from 'react';
import { ACCOUNT_ITEM, sheetType2Keys, sheetType2Title } from '@renderer/constants';
import { BalanceSheetType, FinancialReport } from '@renderer/types';
import { totalKeyRecord } from '@renderer/constants';
import { BaseLineChartCard } from '@renderer/components/BaselLineChartCard';
import { getNumberInReport } from '@renderer/utils';

interface BalanceSheetChartCardProps {
  type: BalanceSheetType;
  reports?: FinancialReport[];
}

export const BalanceSheetChartCard = memo<BalanceSheetChartCardProps>(({ type, reports }) => {
  const totals = useMemo(
    () => reports?.map((report) => Number(report.data[ACCOUNT_ITEM[totalKeyRecord[type]]]) || 0),
    [reports, type],
  );

  return (
    <BaseLineChartCard
      key={`${getNumberInReport(reports?.[0]?.data || {}, 'l-jlr-净利润')}-${getNumberInReport(reports?.[0]?.data || {}, 'z-hbzj-货币资金')}`}
      totalName={totalKeyRecord[type].split('-')[2]}
      totals={totals}
      reports={reports}
      title={sheetType2Title[type]}
      accountItemKeys={sheetType2Keys[type]}
      minPercent={5}
    />
  );
});
BalanceSheetChartCard.displayName = 'BalanceSheetChartCard';
