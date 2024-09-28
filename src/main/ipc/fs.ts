import { ipcMain, dialog } from 'electron';
import fs from 'fs';

export const createFileIpcHandle = (): void => {
  ipcMain.handle('fetchFileText', async (_, filepath: string) => {
    const data = fs.readFileSync(filepath, 'utf8');
    return data;
  });
  ipcMain.handle('waitForWriteFile', async (_, filepath: string, text: string) => {
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
