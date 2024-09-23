import { memo, useState } from 'react';
import { Card, Text, Spinner, DataList } from '@radix-ui/themes';
import { get } from '@renderer/api/request';
import { useAsyncEffect } from 'ahooks';

interface BaseInfo {
  /** 东财行业 */
  industryDetail: string;

  /** 公司简介 */
  profile: string;

  /** 许可项目 */
  scope: string;

  /** 会计师事务所 */
  accountFirm: string;
}

export const getBaseInfoRequest = async (stockId: string): Promise<BaseInfo> => {
  const res = await get('https://datacenter.eastmoney.com/securities/api/data/v1/get', {
    reportName: 'RPT_F10_BASIC_ORGINFO',
    columns: 'ALL',
    filter: `(SECUCODE="${stockId}")`,
    pageNumber: 1,
    pageSize: 1,
    source: 'HSF10',
    client: 'PC',
  });
  const data = res?.result?.data?.[0];
  return {
    industryDetail: data.EM2016,
    profile: data.ORG_PROFILE,
    scope: data.BUSINESS_SCOPE,
    accountFirm: data.ACCOUNTFIRM_NAME,
  };
};

interface BaseProps {
  stockId: string;
}

export const Base = memo<BaseProps>(({ stockId }) => {
  const [info, setInfo] = useState<BaseInfo | null>(null);

  useAsyncEffect(async () => {
    const baseInfo = await getBaseInfoRequest(stockId);
    setInfo(baseInfo);
  }, [stockId]);

  if (!info) {
    return (
      <Card className="h-full flex flex-col">
        <div className="w-full h-full flex flex-col px-2">
          <Text size="3" className="font-bold mb-2">
            Corp Profile
          </Text>
          <div className="w-full flex-1 flex justify-center items-center">
            <Spinner />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="w-full h-full flex flex-col px-2">
        <Text size="3" className="font-bold mb-2">
          Corp Profile
        </Text>
        <div className="w-full flex-1 overflow-auto pt-2">
          <DataList.Root>
            <DataList.Item>
              <DataList.Label>Account Firm</DataList.Label>
              <DataList.Value>{info.accountFirm}</DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>Eastmoney Industry</DataList.Label>
              <DataList.Value>{info.industryDetail}</DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>Profile</DataList.Label>
              <DataList.Value>{info.profile}</DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>Business Scope</DataList.Label>
              <DataList.Value>{info.scope}</DataList.Value>
            </DataList.Item>
          </DataList.Root>
        </div>
      </div>
    </Card>
  );
});
Base.displayName = 'Base';
