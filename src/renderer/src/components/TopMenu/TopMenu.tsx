import { memo, useMemo, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useMemoizedFn, useDebounceFn } from 'ahooks';
import cls from 'classnames';
import { useAtom } from 'jotai';
import {
  Separator,
  IconButton,
  Tooltip,
  Dialog,
  Button,
  TextField,
  Spinner,
  Badge,
  DropdownMenu,
} from '@radix-ui/themes';
import {
  MagicWandIcon,
  BarChartIcon,
  SunIcon,
  MoonIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import { colorAtom, themeAtom } from '@renderer/models';
import { searchStockRequest } from '@renderer/api/stock-search';
import { SearchStockItem } from '@renderer/types';
import { ColorMap, ColorType } from '@renderer/constants';
import { useRandomlyPickOneStock } from '@renderer/hooks';

interface TopMenuItemProps {
  title: string;
  href: string;
  checked?: boolean;
}

const TopMenuItem = memo<TopMenuItemProps>(({ title, href, checked }) => {
  const { search: searchStr } = useLocation();
  const history = useHistory();

  const search = useMemo(() => new URLSearchParams(searchStr), [searchStr]);
  const id = useMemo(() => search.get('id'), [search]);

  return (
    <div
      className={cls('px-3 py-1 text-sm rounded cursor-pointer', {
        'bg-accent-10 text-gray-1 ': checked,
        'hover:bg-accent-3 text-gray-12': !checked,
      })}
      onClick={() => history.push(id ? `${href}?id=${id}` : href)}
    >
      {title}
    </div>
  );
});
TopMenuItem.displayName = 'TopMenuItem';

const MENU_ITEM_LIST: Array<{ title: string; href: string }> = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Analyst', href: '/analyst' },
  // { title: 'Filter', href: '/filter' },
  { title: 'Market', href: '/market' },
  { title: 'Good Luck', href: '/goodluck' },
  { title: 'Settings', href: '/settings' },
];

export const TopMenu = memo(() => {
  const history = useHistory();
  const { pathname } = useLocation();
  const [theme, setTheme] = useAtom(themeAtom);
  const [color, setColor] = useAtom(colorAtom);
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchResultList, setSearchResultList] = useState<Array<SearchStockItem> | null>([]);
  const [selectedResultItem, setSelectedResultItem] = useState<SearchStockItem | null>(null);
  const onRandomlyPickOneStock = useRandomlyPickOneStock();

  const { run: onSearch } = useDebounceFn(
    useMemoizedFn(async (inputValue: string) => {
      try {
        const res = await searchStockRequest(inputValue);
        setSearchResultList(res);
      } catch {
        setSearchResultList([]);
      }
    }),
    { wait: 250 },
  );

  const onValueChange = useMemoizedFn(async (inputValue: string) => {
    setInputValue(inputValue);
    if (!inputValue) {
      return;
    }
    setSearchResultList(null);
    await onSearch(inputValue);
  });

  useEffect(() => {
    if (searchResultList) {
      setSelectedResultItem(searchResultList[0]);
    }
  }, [searchResultList]);

  const jumpToResult = useMemoizedFn((stock: SearchStockItem) => {
    if (['sh', 'sz', 'bj'].includes(stock.sType.toLowerCase())) {
      history.push(`/analyst?id=${stock.stockId}`);
      setSelectedResultItem(null);
      setVisible(false);
    } else {
      // TODO (xss): notification
    }
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        setVisible((pre) => !pre);
        return;
      }
      if (e.key === 'i' && (e.metaKey || e.ctrlKey)) {
        onRandomlyPickOneStock();
        return;
      }
      if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
        location.reload();
        e.preventDefault();
        e.stopPropagation();
      }
      if (searchResultList) {
        const index = searchResultList.findIndex(
          (item) => item.stockId === selectedResultItem?.stockId,
        );
        if (e.key === 'ArrowDown' && index < searchResultList.length - 1) {
          setSelectedResultItem(searchResultList[index + 1]);
        } else if (e.key === 'ArrowUp' && index > 0) {
          setSelectedResultItem(searchResultList[index - 1]);
        } else if (e.key === 'Enter' && selectedResultItem) {
          jumpToResult(selectedResultItem);
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [searchResultList, selectedResultItem, history, jumpToResult, onRandomlyPickOneStock]);

  return (
    <div className="w-full h-14 flex items-center gap-5 px-6">
      <div className="flex items-center gap-2 text-x font-bold text-accent-10">
        <BarChartIcon style={{ width: 18, height: 18 }} />
        RVI
      </div>
      <Separator orientation="vertical" />
      <div className="flex items-center gap-2">
        {MENU_ITEM_LIST.map((item) => (
          <TopMenuItem
            key={item.href}
            checked={pathname === item.href}
            title={item.title}
            href={item.href}
          />
        ))}
      </div>
      <div className="ml-[auto] flex items-center gap-6">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="ghost" style={{ alignItems: 'center', gap: 6 }}>
              <div className="w-4 h-4 rounded-md" style={{ background: ColorMap[color][10] }}></div>
              {color[0].toUpperCase()}
              {color.slice(1)}
              <DropdownMenu.TriggerIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            {Object.entries(ColorMap).map(([key, value]) => (
              <DropdownMenu.Item
                className="flex items-center"
                style={{ gap: 10 }}
                key={key}
                onClick={() => setColor(key as ColorType)}
              >
                <div className="w-4 h-4 rounded-md" style={{ background: value[10] }}></div>
                <div>
                  {key[0].toUpperCase()}
                  {key.slice(1)}
                </div>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <Tooltip content="randomly pick one stock (type ⌘I to pick one) ">
          <IconButton onClick={onRandomlyPickOneStock} variant="ghost">
            <MagicWandIcon />
          </IconButton>
        </Tooltip>
        <Dialog.Root open={visible} onOpenChange={setVisible}>
          <Dialog.Trigger>
            <Tooltip content="Stock Search (type ⌘K to Search)">
              <IconButton onClick={() => setVisible(true)} variant="ghost">
                <MagnifyingGlassIcon />
              </IconButton>
            </Tooltip>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title style={{ display: 'none' }} />
            <TextField.Root
              value={inputValue}
              onChange={(e) => onValueChange(e.target.value)}
              className="mb-2"
              placeholder="Search the stock..."
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height="16" width="16" />
              </TextField.Slot>
            </TextField.Root>
            <div className="h-96 overflow-auto">
              <div className="px-2 mb-2 mt-1 text-gray-10 text-sm">Search Result</div>
              {searchResultList ? (
                searchResultList.map((item) => (
                  <div
                    className={cls('flex items-center gap-2 px-2 py-3 rounded-md', {
                      'bg-accent-2 select-none': selectedResultItem?.stockId === item.stockId,
                    })}
                    onClick={() => jumpToResult(item)}
                    onMouseEnter={() => setSelectedResultItem(item)}
                    key={item.stockId}
                  >
                    <Badge>{item.sType}</Badge>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-sm text-gray-10">{item.code}</div>
                  </div>
                ))
              ) : (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Root>
        <Tooltip content="Toggle Theme">
          <IconButton
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            variant="ghost"
          >
            {theme === 'light' ? <SunIcon /> : <MoonIcon />}
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
});
TopMenu.displayName = 'TopMenu';
