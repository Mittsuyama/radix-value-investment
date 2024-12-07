import { ipcMain } from 'electron';
import axios from 'axios';

export const createAxiosIpcHandle = (): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ipcMain.handle('axios', async (_, method: string, url: string, params: any) => {
    try {
      if (method === 'get') {
        const res = await axios.get(`${url}?${new URLSearchParams(params).toString()}`);
        const { data } = res;
        // console.log('\n\n------------------------------------------------------------------\n\n');
        // console.log(res.config);
        return {
          isSuccess: true,
          data,
        };
      }
      if (method === 'put') {
        const { data } = await axios.put(url, params);
        return {
          isSuccess: true,
          data,
        };
      }
      return {
        isSuccess: false,
        status: 400,
        message: 'method must be get/put',
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error('request failed: ', `${url}?${new URLSearchParams(params).toString()}`);
      return {
        isSuccess: false,
        status: e.status || 500,
        message: e.message || e.errorMessage || 'unknown error',
      };
    }
  });
};
