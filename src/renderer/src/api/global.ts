import { getStore, setStore, StoreKey, makeSureiIsArray } from './request';

export const getFavoriteStockIdListRequest = async () => {
  const list = await getStore(StoreKey.FAVORITE_STOCK_ID_LIST);
  return makeSureiIsArray(list);
};

export const updateFavoriteStockIdListRequest = async (ids: string[]) => {
  await setStore(StoreKey.FAVORITE_STOCK_ID_LIST, ids);
};
