import { useMemoizedFn } from 'ahooks';
import { useAtomValue } from 'jotai';
import { stockBaseInfoListResourceAtom } from '@renderer/models';
import { useHistory } from 'react-router-dom';

export const useRandomlyPickOneStock = () => {
  const resource = useAtomValue(stockBaseInfoListResourceAtom);
  const history = useHistory();

  return useMemoizedFn(() => {
    if (!resource) {
      return;
    }
    const option = resource
      .filter((item) => item.totalMarketCap > 10_000_000_000)
      .sort(() => Math.random() - 0.5)[0];
    history.push(`/analyst?id=${option.id}`);
  });
};
