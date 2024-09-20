import { ipcMain } from 'electron';
import fs from 'fs';

export const createFileIpcHandle = (): void => {
  ipcMain.handle('fetchFileText', async (_, filepath: string) => {
    const data = fs.readFileSync(filepath, 'utf8');
    return data;
  });
};
