import { fetchFileTextListUnderDirectory } from './request';

export const fetchReportsInMarket = async (dir: string) => {
  return await fetchFileTextListUnderDirectory(dir);
};
