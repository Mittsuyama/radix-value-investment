import { memo, useMemo } from 'react';
import cls from 'classnames';
import { useAsyncEffect, useMemoizedFn } from 'ahooks';
import { useAtom, useAtomValue } from 'jotai';
import { Table, Link, Tooltip } from '@radix-ui/themes';
import {
  TriangleUpIcon,
  TriangleDownIcon,
  CaretSortIcon,
  DotFilledIcon,
} from '@radix-ui/react-icons';
import { StockWithReportsDetail, SortConfig, SortKey, KLineType } from '@renderer/types';
import {
  customedStockInfoListAtom,
  sortConfigAtom,
  useFractileIndices,
  jMapAtom,
  weekKJMapAtom,
  turnoverMapAtom,
  turnoverFractileMapAtom,
} from '@renderer/models';
import { computeKdj, computeScore } from '@renderer/utils';
// import { CustomedStockInfoEditButton } from '@renderer/components/CustomedStockInfoEditButton';
import { StaredIconButton } from '@renderer/components/StaredIconButton';
import { ColoredChangeRate, ColoredText } from '@renderer/components/ColoredChangeRate';
import { fetchKLineItemsRequest } from '@renderer/api';

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

interface TableRecord extends StockWithReportsDetail {
  score: number;
}

export const StockDetaiTable = memo<StockDetaiTableProps>(({ records, customed }) => {
  const customedInfoList = useAtomValue(customedStockInfoListAtom);

  const [sort, setSort] = useAtom(sortConfigAtom);
  const [jMap, setJMap] = useAtom(jMapAtom);
  const [weekJMap, setWeekJMap] = useAtom(weekKJMapAtom);
  const [turnoverMap, setTurnoverMap] = useAtom(turnoverMapAtom);
  const [turnoverFractileMap, setTurnoverFractileMap] = useAtom(turnoverFractileMapAtom);
  const { indices, scoreFractiles } = useFractileIndices();

  const customedInfoMap = useMemo(
    () => new Map(customedInfoList.map((item) => [item.id, item])),
    [customedInfoList],
  );

  useAsyncEffect(
    async function () {
      try {
        const jMap = new Map<string, number>();
        const weekJMap = new Map<string, number>();
        const turnoverMap = new Map<string, number>();
        await Promise.all(
          records.map(async ({ id }) => {
            // kdj 计算（日/周）
            const [items, weekItems] = await Promise.all([
              fetchKLineItemsRequest(id, KLineType.DAY),
              fetchKLineItemsRequest(id, KLineType.WEEK),
            ]);
            const kdj = computeKdj(
              items.map((item) => item.close),
              items.map((item) => item.low),
              items.map((item) => item.high),
            );
            jMap.set(id, kdj.j.slice(-1)[0]);
            const weekKdj = computeKdj(
              weekItems.map((item) => item.close),
              weekItems.map((item) => item.low),
              weekItems.map((item) => item.high),
            );
            weekJMap.set(id, weekKdj.j.slice(-1)[0]);
            // 换手率
            const turnover = items[items.length - 1].turnoverRate;
            turnoverMap.set(id, turnover);
            // 五年换手率列表
            const turnoverList = items
              .slice(5 * 250)
              .map((item) => item.turnoverRate)
              .sort();
            const index = turnoverList.findIndex((item) => item >= turnover);
            turnoverFractileMap.set(id, index / turnoverList.length);
          }),
        );
        setTimeout(() => {
          setJMap(jMap);
          setWeekJMap(weekJMap);
          setTurnoverMap(turnoverMap);
          setTurnoverFractileMap(turnoverFractileMap);
        }, 0);
      } catch (e) {
        console.error(e);
      }
    },
    [records],
  );

  const tableRecords = useMemo(() => {
    return records.map<TableRecord>((item) => ({
      ...item,
      score: indices ? computeScore(item, indices) : NaN,
    }));
  }, [records, indices]);

  const computeRecordValue = useMemoizedFn((record: TableRecord, type: SortKey) => {
    const customedInfo = customedInfoMap.get(record.id);
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
      return record.score;
    }
    if (type === 'FCF_avg_3') {
      return record.fcfAvg3;
    }
    if (type === 'CAP') {
      return record.totalMarketCap;
    }
    if (type === 'kdj-j') {
      return jMap.get(record.id) || NaN;
    }
    if (type === 'kdj-j-week') {
      return weekJMap.get(record.id) || NaN;
    }
    return NaN;
  });

  const sortedRecords = useMemo(() => {
    if (sort) {
      return tableRecords.slice().sort((a, b) => {
        const aNumber = computeRecordValue(a, sort.key);
        const bNumber = computeRecordValue(b, sort.key);
        if (Number.isNaN(aNumber)) {
          return 1;
        }
        if (Number.isNaN(bNumber)) {
          return -1;
        }
        return sort.direction === 'asc' ? aNumber - bNumber : bNumber - aNumber;
      });
    }
    return tableRecords;
  }, [tableRecords, sort, computeRecordValue]);

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <TableHeaderCellWithInfo title="ROE" info="Last Finnal Year" />
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>STD (ROE)</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <TableHeaderCellWithInfo title="PE" info="TTM" />
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>PB</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>GPR</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>STD (GPR)</Table.ColumnHeaderCell>
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
              title="J (Day)"
              info="J Value of KDJ (Day)"
              sortKey="kdj-j"
              onSort={setSort}
              sortConfig={sort}
              defaultDirection="asc"
            />
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <TableHeaderCellWithInfo
              title="J (Week)"
              info="J Value of KDJ (Week)"
              sortKey="kdj-j-week"
              onSort={setSort}
              sortConfig={sort}
              defaultDirection="asc"
            />
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Turnover</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>T (Fractile)</Table.ColumnHeaderCell>
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
          const weekJ = weekJMap.get(record.id);
          const turnover = turnoverMap.get(record.id);
          const turnoverFractile = turnoverFractileMap.get(record.id);
          const score = record.score;
          return (
            <Table.Row key={record.id} className="hover:bg-accent-2">
              <Table.RowHeaderCell>{index + 1}</Table.RowHeaderCell>
              <Table.Cell>
                <Link weight="bold" highContrast href={`#/analyst?id=${record.id}`}>
                  {record.name}
                </Link>
              </Table.Cell>
              <Table.Cell>{record.lastYearRoe.toFixed(2) + '%'}</Table.Cell>
              <Table.Cell>{record.roeStd.toFixed(2)}</Table.Cell>
              <Table.Cell>{record.ttmPE.toFixed(2)}</Table.Cell>
              <Table.Cell>{record.pb.toFixed(2)}</Table.Cell>
              <Table.Cell>{record.GPR.toFixed(2) + '%'}</Table.Cell>
              <Table.Cell>{record.gprStd.toFixed(2)}</Table.Cell>
              <Table.Cell>{record.fcfAvg3.toFixed(2) + '%'}</Table.Cell>
              <Table.Cell>{record.fcf.toFixed(2) + '%'}</Table.Cell>
              <Table.Cell>￥{(record.totalMarketCap / 100_000_000).toFixed(2)}亿</Table.Cell>
              <Table.Cell>
                <ColoredText
                  text={Number.isNaN(score) ? '-' : score.toFixed(2).toString()}
                  status={
                    Number.isNaN(score) || !scoreFractiles
                      ? 'unchange'
                      : score >= scoreFractiles[1]
                        ? 'up'
                        : score <= scoreFractiles[0]
                          ? 'down'
                          : 'unchange'
                  }
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
                    status={j < 0 ? 'down' : j > 90 ? 'up' : 'unchange'}
                    icon={null}
                  />
                )}
              </Table.Cell>
              <Table.Cell>
                {typeof weekJ === 'undefined' ? (
                  '-'
                ) : (
                  <ColoredText
                    text={weekJ.toFixed(2)}
                    status={weekJ < 0 ? 'down' : weekJ > 90 ? 'up' : 'unchange'}
                    icon={null}
                  />
                )}
              </Table.Cell>
              <Table.Cell>{turnover ? turnover.toFixed(2) + '%' : '-'}</Table.Cell>
              <Table.Cell>
                {typeof turnoverFractile === 'undefined' ? (
                  '-'
                ) : (
                  <ColoredText
                    text={(turnoverFractile * 100).toFixed(2) + '%'}
                    status={
                      turnoverFractile < 0.3 ? 'down' : turnoverFractile > 0.7 ? 'up' : 'unchange'
                    }
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
                      <ColoredChangeRate rate={computeRecordValue(record, 'LTPRC')} />
                    ) : (
                      '-'
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {customedInfo?.latestBuyDate
                      ? computeRecordValue(record, 'GLTD').toFixed(0) + 'd'
                      : '-'}
                  </Table.Cell>
                </>
              ) : null}
              <Table.Cell>
                <div className="flex items-center gap-4">
                  <StaredIconButton id={record.id} variant="ghost" />
                  {/* <CustomedStockInfoEditButton size="1" id={record.id} variant="ghost" /> */}
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
