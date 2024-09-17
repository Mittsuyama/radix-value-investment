import { useMemoizedFn } from 'ahooks';
import { useAtomValue } from 'jotai';
import { filterStocks } from '@renderer/api';
import { stockBaseInfoListResourceAtom } from '@renderer/models';
import { useHistory } from 'react-router-dom';

export const useRandomlyPickOneStock = () => {
  const resource = useAtomValue(stockBaseInfoListResourceAtom);
  const history = useHistory();

  return useMemoizedFn(() => {
    if (!resource) {
      return;
    }
    const option = filterStocks(resource, {
      ttmROE: [15, 1000],
      ttmPE: [0, 20],
      GPR: [25, 1000],
    }).sort(() => Math.random() - 0.5)[0];
    history.push(`/analyst?id=${option.id}`);
  });
};
