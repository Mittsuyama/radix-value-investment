import { ipcMain, dialog } from 'electron';
import fs from 'fs';

export const createFileIpcHandle = (): void => {
  ipcMain.handle('fetchFileText', async (_, filepath: string) => {
    try {
      const data = fs.readFileSync(filepath, 'utf8');
      return data;
    } catch {
      return undefined;
    }
  });
  ipcMain.handle('fetchFileTextListUnderDirectory', async (_, dir: string) => {
    try {
      if (!fs.statSync(dir).isDirectory) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filenameList = fs.readdirSync(dir);
    return filenameList.map((filename) => fs.readFileSync(`${dir}/${filename}`), 'utf8');
  });
  ipcMain.handle('waitForWriteFile', async (_, filepath: string, text: string) => {
    const filepahtSplitResult = filepath.split('/');
    const path = filepahtSplitResult.slice(0, filepahtSplitResult.length - 1).join('/');
    try {
      const dir = fs.statSync(path);
      if (!dir.isDirectory) {
        fs.mkdirSync(path);
      }
    } catch {
      fs.mkdirSync(path);
    }
    const data = fs.writeFileSync(filepath, text, 'utf-8');
    return data;
  });
  ipcMain.handle('waitForSelectFile', async () => {
    const res = dialog.showOpenDialogSync({ properties: ['openFile'] });
    return res;
  });
  ipcMain.handle('waitForSelectDirectory', async () => {
    const res = dialog.showOpenDialogSync({ properties: ['openDirectory'] });
    return res;
  });
};
