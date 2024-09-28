import { useAtomValue, useSetAtom } from 'jotai';
import { useMount } from 'ahooks';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import { Separator } from '@radix-ui/themes';
import { TopMenu } from '@renderer/components/TopMenu';
import {
  colorAtom,
  customedStockInfoListAtom,
  dataDirectoryAtom,
  Direcotry,
  staredStockIdListAtom,
  stockBaseInfoListResourceAtom,
  StorageKey,
  themeAtom,
} from '@renderer/models';
import { Dashboard, Filter, Analyst, GoodLuck } from '@renderer/pages';
import '@radix-ui/themes/styles.css';
import { getStockBaseInfoListByFilterRequeset } from './api';
import { fetchFileText } from './api/request';

function App(): JSX.Element {
  const theme = useAtomValue(themeAtom);
  const color = useAtomValue(colorAtom);
  const dir = useAtomValue(dataDirectoryAtom);

  const setStaredList = useSetAtom(staredStockIdListAtom);
  const setCustomed = useSetAtom(customedStockInfoListAtom);
  const setResource = useSetAtom(stockBaseInfoListResourceAtom);

  useMount(async () => {
    const res = await getStockBaseInfoListByFilterRequeset({});
    res.sort((a, b) => b.totalMarketCap - a.totalMarketCap);
    setResource(res);
  });

  useMount(async () => {
    if (dir) {
      const res = await fetchFileText(
        `${dir}${Direcotry.GLOBAL}${StorageKey.CUSTOMED_STOCK_INFO_LIST}.json`,
      );
      try {
        const data = JSON.parse(res);
        setCustomed(data);
      } catch {
        // do nothing
      }
    }
  });

  useMount(async () => {
    const res = await fetchFileText(
      `${dir}${Direcotry.GLOBAL}${StorageKey.SARED_STOCK_ID_LIST}.json`,
    );
    try {
      const data = JSON.parse(res);
      setStaredList(data);
    } catch {
      // do nothing
    }
  });

  return (
    <Theme scaling="95%" accentColor={color} appearance={theme} radius="large">
      <div className="w-svw h-svh flex flex-col">
        <div className="flex-none">
          <TopMenu />
        </div>
        <Separator style={{ width: '100%' }} className="flex-none" />
        <div className="flex-1 overflow-auto">
          <Switch>
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/analyst" component={Analyst} />
            <Route exact path="/filter" component={Filter} />
            <Route exact path="/goodluck" component={GoodLuck} />
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
