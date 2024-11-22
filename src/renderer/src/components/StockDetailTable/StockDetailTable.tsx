import { memo, useMemo, useState } from 'react';
import cls from 'classnames';
import { useAsyncEffect } from 'ahooks';
import { useAtom, useAtomValue } from 'jotai';
import { Table, Link, Tooltip } from '@radix-ui/themes';
import {
  TriangleUpIcon,
  TriangleDownIcon,
  CaretSortIcon,
  DotFilledIcon,
} from '@radix-ui/react-icons';
import {
  CustomedStockInfo,
  StockWithReportsDetail,
  SortConfig,
  SortKey,
  KLineType,
} from '@renderer/types';
import { customedStockInfoListAtom, sortConfigAtom } from '@renderer/models';
import { computeKdj, getStockScore } from '@renderer/utils';
import { CustomedStockInfoEditButton } from '@renderer/components/CustomedStockInfoEditButton';
import { StaredIconButton } from '@renderer/components/StaredIconButton';
import { ColoredChangeRate, ColoredText } from '@renderer/components/ColoredChangeRate';
import { fetchKLineItemsRequest } from '@renderer/api';

const computeRecordValue = (
  record: StockWithReportsDetail,
  customedInfoMap: Map<string, CustomedStockInfo>,
  type: SortKey,
  jMap: Map<string, number>,
) => {
  const customedInfo = customedInfoMap.get(record.id);
  const jv = jMap.get(record.id);
  if (type === 'LTPRC') {
    return customedInfo?.latestBuyPrice
      ? ((record.currentPrice - customedInfo.latestBuyPrice) / record.currentPrice) * 100
      : NaN;
  }
  if (type === 'GLTD') {
    return customedInfo?.latestBuyDate
      ? (Date.now() - new Date(customedInfo.latestBuyDate).getTime()) / 86400_000
      : NaN;
  }
  if (type === 'score') {
    return getStockScore(record);
  }
  if (type === 'FCF_avg_3') {
    return record.fcfAvg3;
  }
  if (type === 'CAP') {
    return record.totalMarketCap;
  }
  if (type === 'kdj-j') {
    return jv || NaN;
  }
  return NaN;
};

const TableHeaderCellWithInfo = memo<{
  title: string;
  info: string;
  sortKey?: SortKey;
  onSort?: (config?: SortConfig) => void;
  sortConfig?: SortConfig;
  defaultDirection?: SortConfig['direction'];
}>(({ title, info, onSort, sortKey, sortConfig, defaultDirection }) => {
  const sortable = onSort && sortKey;
  return (
    <Tooltip
      content={
        info || sortKey ? (
          <span>
            {info ? <span className="mb-1">{info}</span> : null}
            {sortKey ? (
              <>
                <br />
                <span>Click to sort by this column</span>
              </>
            ) : null}
          </span>
        ) : null
      }
    >
      <div
        className={cls('flex items-center gap-1 m-[-11.4px] px-2', {
          'cursor-pointer hover:bg-gray-3': sortable,
        })}
        style={{ height: 41 }}
        onClick={() => {
          if (!sortKey) {
            return;
          }
          if (sortConfig && sortConfig?.key === sortKey) {
            if (sortConfig.direction === 'asc') {
              if (defaultDirection !== 'desc') {
                onSort?.({ key: sortKey, direction: 'desc' });
              } else {
                onSort?.(undefined);
              }
            } else {
              if (defaultDirection !== 'asc') {
                onSort?.({ key: sortKey, direction: 'asc' });
              } else {
                onSort?.(undefined);
              }
            }
          } else {
            onSort?.({ key: sortKey, direction: defaultDirection || 'asc' });
          }
        }}
      >
        <div className="font-bold">{title}</div>
        {sortKey && sortConfig?.key !== sortKey ? (
          <CaretSortIcon
            style={{
              marginTop: -1,
              opacity: sortable && sortKey && sortConfig?.key !== sortKey ? 0.25 : 'unset',
            }}
          />
        ) : null}
        {sortConfig?.key === sortKey && sortConfig?.direction === 'asc' ? (
          <TriangleUpIcon style={{ paddingBottom: 2 }} />
        ) : null}
        {sortConfig?.key === sortKey && sortConfig?.direction === 'desc' ? (
          <TriangleDownIcon style={{ paddingBottom: 2 }} />
        ) : null}
      </div>
    </Tooltip>
  );
});
TableHeaderCellWithInfo.displayName = 'TableHeaderCellWithInfo';

interface StockDetaiTableProps {
  records: StockWithReportsDetail[];
  customed?: boolean;
}

export const StockDetaiTable = memo<StockDetaiTableProps>(({ records, customed }) => {
  const customedInfoList = useAtomValue(customedStockInfoListAtom);

  const [sort, setSort] = useAtom(sortConfigAtom);

  const customedInfoMap = useMemo(
    () => new Map(customedInfoList.map((item) => [item.id, item])),
    [customedInfoList],
  );

  const [jMap, setJMap] = useState<Map<string, number>>(new Map());
  useAsyncEffect(
    async function () {
      try {
        const jMap = new Map<string, number>();
        await Promise.all(
          records.map(async ({ id }) => {
            const items = await fetchKLineItemsRequest(id, KLineType.DAY);
            const kdj = computeKdj(
              items.map((item) => item.close),
              items.map((item) => item.low),
              items.map((item) => item.high),
            );
            jMap.set(id, kdj.j.slice(-1)[0]);
          }),
        );
        setJMap(jMap);
      } catch (e) {
        console.error(e);
      }
    },
    [records],
  );

  const sortedRecords = useMemo(() => {
    if (sort) {
      return records.slice().sort((a, b) => {
        const aNumber = computeRecordValue(a, customedInfoMap, sort.key, jMap);
        const bNumber = computeRecordValue(b, customedInfoMap, sort.key, jMap);
        if (Number.isNaN(aNumber)) {
          return 1;
        }
        if (Number.isNaN(bNumber)) {
          return -1;
        }
        return sort.direction === 'asc' ? aNumber - bNumber : bNumber - aNumber;
      });
    }
    return records;
  }, [records, sort, customedInfoMap, jMap]);

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Industry</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <TableHeaderCellWithInfo title="ROE" info="TTM" />
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <TableHeaderCellWithInfo title="PE" info="TTM" />
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>PB</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>GPR</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <TableHeaderCellWithInfo
              title="FCF"
              info="FCF 3 Years Average"
              sortKey="FCF_avg_3"
              sortConfig={sort}
              onSort={setSort}
            />
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>FCF</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <TableHeaderCellWithInfo
              title="CAP"
              info="Total Market Capital value"
              sortKey="CAP"
              onSort={setSort}
              sortConfig={sort}
              defaultDirection="desc"
            />
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <TableHeaderCellWithInfo
              title="Score"
              info="Get weighted score"
              sortKey="score"
              onSort={setSort}
              sortConfig={sort}
              defaultDirection="desc"
            />
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <TableHeaderCellWithInfo title="TCR" info="Today Change Rate" />
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <TableHeaderCellWithInfo
              title="KDJ(J)"
              info="J Value of KDJ"
              sortKey="kdj-j"
              onSort={setSort}
              sortConfig={sort}
              defaultDirection="asc"
            />
          </Table.ColumnHeaderCell>
          {customed ? (
            <>
              <Table.ColumnHeaderCell>
                <TableHeaderCellWithInfo title="LTP" info="Latest Trade Price" />
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                <TableHeaderCellWithInfo
                  title="LTPCR"
                  info="Latest Trade Price Change Rate"
                  sortKey="LTPRC"
                  onSort={setSort}
                  sortConfig={sort}
                />
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                <TableHeaderCellWithInfo
                  title="GLTD"
                  info="Gap to Latest Trade Day"
                  sortKey="GLTD"
                  onSort={setSort}
                  sortConfig={sort}
                  defaultDirection="desc"
                />
              </Table.ColumnHeaderCell>
            </>
          ) : null}
          <Table.ColumnHeaderCell>Ops</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {sortedRecords.map((record, index) => {
          const customedInfo = customedInfoMap.get(record.id);
          const j = jMap.get(record.id);
          const score = getStockScore(record);
          return (
            <Table.Row key={record.id} className="hover:bg-accent-2">
              <Table.RowHeaderCell>{index + 1}</Table.RowHeaderCell>
              <Table.Cell>{record.id}</Table.Cell>
              <Table.Cell>
                <Link weight="bold" highContrast href={`#/analyst?id=${record.id}`}>
                  {record.name}
                </Link>
              </Table.Cell>
              <Table.Cell>{record.industry}</Table.Cell>
              <Table.Cell>{record.ttmROE.toFixed(2) + '%'}</Table.Cell>
              <Table.Cell>{record.ttmPE.toFixed(2)}</Table.Cell>
              <Table.Cell>{record.pb.toFixed(2)}</Table.Cell>
              <Table.Cell>{record.GPR.toFixed(2) + '%'}</Table.Cell>
              <Table.Cell>{record.fcfAvg3.toFixed(2) + '%'}</Table.Cell>
              <Table.Cell>{record.fcf.toFixed(2) + '%'}</Table.Cell>
              <Table.Cell>{(record.totalMarketCap / 100_000_000).toFixed(2)}亿</Table.Cell>
              <Table.Cell>
                <ColoredText
                  text={score.toString()}
                  status={score >= 10 ? 'up' : score <= 6 ? 'down' : 'unchange'}
                  icon={<DotFilledIcon width={20} height={20} />}
                />
              </Table.Cell>
              <Table.Cell>￥{record.currentPrice}</Table.Cell>
              <Table.Cell>
                <ColoredChangeRate rate={record.changeRate} />
              </Table.Cell>
              <Table.Cell>
                {typeof j === 'undefined' ? (
                  '-'
                ) : (
                  <ColoredText
                    text={j.toFixed(2)}
                    status={j < 20 ? 'down' : j > 80 ? 'up' : 'unchange'}
                    icon={null}
                  />
                )}
              </Table.Cell>
              {customed ? (
                <>
                  <Table.Cell>
                    {customedInfo?.latestBuyPrice ? `￥${customedInfo?.latestBuyPrice}` : '-'}
                  </Table.Cell>
                  <Table.Cell>
                    {customedInfo?.latestBuyPrice ? (
                      <ColoredChangeRate
                        rate={computeRecordValue(record, customedInfoMap, 'LTPRC', jMap)}
                      />
                    ) : (
                      '-'
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {customedInfo?.latestBuyDate
                      ? computeRecordValue(record, customedInfoMap, 'GLTD', jMap).toFixed(0) + 'd'
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
