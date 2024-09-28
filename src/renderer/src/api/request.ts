import { ServiceError } from '@renderer/types';

export const fetchFileText = async (filepath: string) => {
  return await window.electron.ipcRenderer.invoke('fetchFileText', filepath);
};

export const waitForWriteFile = async (filepath: string, text: string) => {
  return await window.electron.ipcRenderer.invoke('waitForWriteFile', filepath, text);
};

export const waitForSelectFile = async () => {
  return await window.electron.ipcRenderer.invoke('waitForSelectFile');
};

export const waitForSelectDirectory = async () => {
  return await window.electron.ipcRenderer.invoke('waitForSelectDirectory');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const get = async (url: string, params?: any) => {
  const res = await window.electron.ipcRenderer.invoke('axios', 'get', url, params);
  if (!res.isSuccess) {
    throw new ServiceError(res.status, res.message);
  }
  return res.data;
};

export enum StoreKey {
  FAVORITE_STOCK_ID_LIST = 'favorite-stock-id-list',
}

export const getStore = async (key: string) => {
  return await window.electron.ipcRenderer.invoke('store', 'get', key);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setStore = async (key: string, data: any) => {
  return await window.electron.ipcRenderer.invoke('store', 'set', key, data);
};

export const clearStore = async () => {
  return await window.electron.ipcRenderer.invoke('store', 'clear');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeSureiIsArray = (data: any): Array<any> => {
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeSureiStringIsJSON = (data: string): any => {
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
};
