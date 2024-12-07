import { ipcMain, dialog } from 'electron';
import fs from 'fs';
import path from 'path';

const assureDirExit = (dir: string) => {
  try {
    if (!fs.statSync(dir).isDirectory) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const createFileIpcHandle = (): void => {
  ipcMain.handle('fetchFileText', async (_, paths: string[]) => {
    const filepath = path.join(...paths);
    try {
      const data = fs.readFileSync(filepath, 'utf8');
      return data;
    } catch {
      return undefined;
    }
  });
  ipcMain.handle('fetchFileTextListUnderDirectory', async (_, paths: string[]) => {
    const dir = path.join(...paths);
    assureDirExit(dir);
    const filenameList = fs.readdirSync(dir);
    return await Promise.all(
      filenameList.map(
        (name) =>
          new Promise<string>((res) => {
            fs.readFile(path.join(dir, name), 'utf-8', (_, data) => res(data));
          }),
      ),
    );
  });
  ipcMain.handle(
    'waitForWriteBatchFileTextUnderDirectory',
    async (_, dir: string, files: Array<{ name: string; text: string }>) => {
      assureDirExit(dir);
      await Promise.all(
        files.map(
          ({ name, text }) =>
            new Promise((res) => {
              fs.writeFile(path.join(dir, name), text, 'utf-8', res);
            }),
        ),
      );
    },
  );
  ipcMain.handle('waitForWriteFile', async (_, paths: string[], filename: string, text: string) => {
    const pathname = path.join(...paths);
    assureDirExit(pathname);
    const data = fs.writeFileSync(path.join(pathname, filename), text, 'utf-8');
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
