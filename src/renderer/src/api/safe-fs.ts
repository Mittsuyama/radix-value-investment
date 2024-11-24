import { StorageKey } from '@renderer/models';
import { fetchFileText, waitForWriteFile, fetchFileTextListUnderDirectory } from './request';

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
  return await fetchFileText(`${prefix}${pathname}`);
};

export const safelyWriteFileText = async (pathname: string, text: string) => {
  const prefix = assertDirSelected();
  return await waitForWriteFile(`${prefix}${pathname}`, text);
};

export const safelyReadFileTextListUnderDirectory = async (dir: string) => {
  const prefix = assertDirSelected();
  return await fetchFileTextListUnderDirectory(`${prefix}${dir}`);
};
