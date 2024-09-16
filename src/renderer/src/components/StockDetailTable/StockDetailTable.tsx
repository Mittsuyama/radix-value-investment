import { memo, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { Table, Link, Tooltip } from '@radix-ui/themes';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { StockWithReportsDetail } from '@renderer/types';
import { customedStockInfoListAtom } from '@renderer/models';
import { autoSort, getStockScore } from '@renderer/utils';
import { CustomedStockInfoEditButton } from '@renderer/components/CustomedStockInfoEditButton';
import { StaredIconButton } from '@renderer/components/StaredIconButton';
import { ColoredChangeRate } from '@renderer/components/ColoredChangeRate';

const TableHeaderCellWithInfo = memo<{ title: string; info: string }>(({ title, info }) => (
  <div className="flex items-center gap-1">
    <div className="font-bold">{title}</div>
    <Tooltip content={info}>
      <InfoCircledIcon style={{ fontSize: 13 }} />
    </Tooltip>
  </div>
));
TableHeaderCellWithInfo.displayName = 'TableHeaderCellWithInfo';

interface StockDetaiTableProps {
  records: StockWithReportsDetail[];
  customed?: boolean;
}

export const StockDetaiTable = memo<StockDetaiTableProps>(({ records, customed }) => {
  const history = useHistory();

  const customedInfoList = useAtomValue(customedStockInfoListAtom);

  const customedInfoMap = useMemo(
    () => new Map(customedInfoList.map((item) => [item.id, item])),
    [customedInfoList],
  );

  const sortedRecords = useMemo(() => autoSort(records), [records]);

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <TableHeaderCellWithInfo title="ROE" info="TTM" />
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <TableHeaderCellWithInfo title="PE" info="TTM" />
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>PB</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>GPR</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <TableHeaderCellWithInfo title="FCF" info="FCF 3 Years Average" />
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>FCF</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>CAP</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Score</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <TableHeaderCellWithInfo title="TCR" info="Today Change Rate" />
          </Table.ColumnHeaderCell>
          {customed ? (
            <>
              <Table.ColumnHeaderCell>
                <TableHeaderCellWithInfo title="LBP" info="Latest Buy Price" />
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                <TableHeaderCellWithInfo title="LBPCR" info="Latest Buy Price Change Rate" />
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                <TableHeaderCellWithInfo title="GLBD" info="Gap to Latest Buy Day" />
              </Table.ColumnHeaderCell>
            </>
          ) : null}
          <Table.ColumnHeaderCell>Ops</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {sortedRecords.map((record, index) => {
          const customedInfo = customedInfoMap.get(record.id);
          return (
            <Table.Row key={record.id} className="hover:bg-accent-2">
              <Table.RowHeaderCell>{index}</Table.RowHeaderCell>
              <Table.Cell>{record.id}</Table.Cell>
              <Table.Cell>
                <Link
                  weight="bold"
                  highContrast
                  href="#"
                  onClick={() => history.push(`/analyst?id=${record.id}`)}
                >
                  {record.name}
                </Link>
              </Table.Cell>
              <Table.Cell>{record.ttmROE.toFixed(2) + '%'}</Table.Cell>
              <Table.Cell>{record.ttmPE.toFixed(2)}</Table.Cell>
              <Table.Cell>{record.pb.toFixed(2)}</Table.Cell>
              <Table.Cell>{record.GPR.toFixed(2) + '%'}</Table.Cell>
              <Table.Cell>{record.cfcAvg3.toFixed(2) + '%'}</Table.Cell>
              <Table.Cell>{record.cfc.toFixed(2) + '%'}</Table.Cell>
              <Table.Cell>{(record.totalMarketCap / 100_000_000).toFixed(2)}亿</Table.Cell>
              <Table.Cell>{getStockScore(record)}</Table.Cell>
              <Table.Cell>￥{record.currentPrice}</Table.Cell>
              <Table.Cell>
                <ColoredChangeRate rate={record.changeRate} />
              </Table.Cell>
              {customed ? (
                <>
                  <Table.Cell>
                    {customedInfo?.latestBuyPrice ? `￥${customedInfo?.latestBuyPrice}` : '-'}
                  </Table.Cell>
                  <Table.Cell>
                    {customedInfo?.latestBuyPrice ? (
                      <ColoredChangeRate
                        rate={
                          ((record.currentPrice - customedInfo.latestBuyPrice) /
                            record.currentPrice) *
                          100
                        }
                      />
                    ) : (
                      '-'
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {customedInfo?.latestBuyDate
                      ? (
                          (Date.now() - new Date(customedInfo.latestBuyDate).getTime()) /
                          86400_000
                        ).toFixed(0) + 'd'
                      : '-'}
                  </Table.Cell>
                </>
              ) : null}
              <Table.Cell>
                <div className="flex items-center gap-4">
                  <StaredIconButton id={record.id} variant="ghost" />
                  <CustomedStockInfoEditButton size="1" id={record.id} variant="ghost" />
                </div>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
});
StockDetaiTable.displayName = 'StockDetaiTable';
