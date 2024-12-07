import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { FractileIndex, StockBaseInfo, StockDetailInMarket } from '@renderer/types';
import { fractileConfigs } from '@renderer/utils';

export const stockBaseInfoListInMarketAtom = atom<StockBaseInfo[] | undefined>(undefined);
export const stockDetailListInMarketAtom = atom<StockDetailInMarket[] | undefined>(undefined);

const fractileIndicesAtom = atomWithStorage<{
  indices?: Array<[number, number]>;
  scoreFractiles?: [number, number];
}>('market-fractile-indices', {}, undefined, { getOnInit: true });

export const useSetFractileIndices = () => useSetAtom(fractileIndicesAtom);
export const useFractileIndices = () => {
  const { indices, scoreFractiles } = useAtomValue(fractileIndicesAtom);
  return {
    indices: indices
      ? fractileConfigs
          .slice(0, Math.min(fractileConfigs.length, indices.length))
          .map<FractileIndex>((config, index) => ({
            ...config,
            values: indices[index],
          }))
      : undefined,
    scoreFractiles,
  };
};
