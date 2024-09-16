import { useAtomValue, useSetAtom } from 'jotai';
import { useMount } from 'ahooks';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import { Separator } from '@radix-ui/themes';
import { TopMenu } from '@renderer/components/TopMenu';
import { colorAtom, stockBaseInfoListResourceAtom, themeAtom } from '@renderer/models';
import { Dashboard, Filter, Analyst } from '@renderer/pages';
import '@radix-ui/themes/styles.css';
import { getStockBaseInfoListByFilterRequeset } from './api';

function App(): JSX.Element {
  const theme = useAtomValue(themeAtom);
  const color = useAtomValue(colorAtom);
  const setResource = useSetAtom(stockBaseInfoListResourceAtom);

  useMount(async () => {
    const res = await getStockBaseInfoListByFilterRequeset({});
    res.sort((a, b) => b.ttmROE - a.ttmROE);
    setResource(res);
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
            <Route exact path="/">
              <Redirect to="/dashboard" />
            </Route>
          </Switch>
        </div>
      </div>
    </Theme>
  );
}

export default App;
