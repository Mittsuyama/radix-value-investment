import { StorageKey } from '@renderer/models';
import {
  fetchFileText,
  waitForWriteFile,
  fetchFileTextListUnderDirectory,
  waitForWriteBatchFileTextUnderDirectory,
} from './request';

const getSettingHref = () => location.href.replace(location.hash, '#/settings');
const assertDirSelected = () => {
  try {
    const dirJson = window.localStorage.getItem(StorageKey.DATA_DIRECTORY);
    if (!dirJson) {
      location.href = getSettingHref();
      throw new Error('Please select directory firstly.');
    }
    return JSON.parse(dirJson);
  } catch {
    location.href = getSettingHref();
    throw new Error('Data directory illegal');
  }
};

export const safelyReadFileText = async (pathname: string) => {
  const prefix = assertDirSelected();
  return await fetchFileText([prefix, pathname]);
};

export const safelyWriteFileText = async (path: string, filename: string, text: string) => {
  const prefix = assertDirSelected();
  return await waitForWriteFile([prefix, path], filename, text);
};

export const safelyReadFileTextListUnderDirectory = async (dir: string) => {
  const prefix = assertDirSelected();
  return await fetchFileTextListUnderDirectory([prefix, dir]);
};

export const safelyWriteBatchFileTextUnderDirectory = async (
  dir: string,
  files: Array<{ name: string; text: string }>,
) => {
  const prefix = assertDirSelected();
  return await waitForWriteBatchFileTextUnderDirectory(`${prefix}${dir}`, files);
};
