import { useEffect, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMount } from 'ahooks';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import { Separator } from '@radix-ui/themes';
import { TopMenu } from '@renderer/components/TopMenu';
import {
  colorAtom,
  customedStockInfoListAtom,
  Direcotry,
  staredStockIdListAtom,
  stockBaseInfoListResourceAtom,
  stockWithReportsDetailListAtom,
  StorageKey,
  themeAtom,
} from '@renderer/models';
import { Dashboard, Filter, Analyst, GoodLuck, Market, Settings } from '@renderer/pages';
import '@radix-ui/themes/styles.css';
import {
  getBatchStocksWithReportsDetailRequest,
  getStockBaseInfoListByFilterRequeset,
  safelyReadFileText,
} from './api';
import { getStockScore } from './utils';

function App(): JSX.Element {
  const theme = useAtomValue(themeAtom);
  const color = useAtomValue(colorAtom);
  const favList = useAtomValue(staredStockIdListAtom);
  const resource = useAtomValue(stockBaseInfoListResourceAtom);

  const setStaredList = useSetAtom(staredStockIdListAtom);
  const setCustomed = useSetAtom(customedStockInfoListAtom);
  const setResource = useSetAtom(stockBaseInfoListResourceAtom);

  const [list, setList] = useAtom(stockWithReportsDetailListAtom);

  const fetchingRef = useRef(false);

  useMount(async () => {
    const res = await getStockBaseInfoListByFilterRequeset({});
    res.sort((a, b) => b.totalMarketCap - a.totalMarketCap);
    setResource(res);
  });

  useMount(async () => {
    const res = await safelyReadFileText(
      `${Direcotry.GLOBAL}${StorageKey.CUSTOMED_STOCK_INFO_LIST}.json`,
    );
    try {
      const data = JSON.parse(res);
      setCustomed(data);
    } catch {
      // do nothing
    }
  });

  useMount(async () => {
    const res = await safelyReadFileText(
      `${Direcotry.GLOBAL}${StorageKey.SARED_STOCK_ID_LIST}.json`,
    );
    const data = JSON.parse(res);
    setStaredList(data);
  });

  useEffect(() => {
    (async () => {
      if (!favList.length || fetchingRef.current) {
        return;
      }
      if (favList.some((fav) => !list?.some((item) => item.id === fav))) {
        fetchingRef.current = true;
        const res = await getBatchStocksWithReportsDetailRequest(
          {
            ids: favList,
            years: 3,
          },
          resource,
        );
        const sortedList = res.slice().sort((a, b) => getStockScore(b) - getStockScore(a));
        setList(sortedList);
        fetchingRef.current = false;
      }
    })();
  }, [favList, list, resource, setList]);

  return (
    <Theme scaling="95%" accentColor={color} appearance={theme} radius="large">
      <div className="w-svw h-svh flex flex-col app-wrapper">
        <div className="flex-none">
          <TopMenu />
        </div>
        <Separator style={{ width: '100%' }} className="flex-none" />
        <div className="flex-1 overflow-auto">
          <Switch>
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/analyst" component={Analyst} />
            <Route exact path="/filter" component={Filter} />
            <Route exact path="/market" component={Market} />
            <Route exact path="/goodluck" component={GoodLuck} />
            <Route exact path="/settings" component={Settings} />
            <Route path="">
              <Redirect to="/dashboard" />
            </Route>
          </Switch>
        </div>
      </div>
    </Theme>
  );
}

export default App;
