export type ThemeType = 'light' | 'dark';

export class ServiceError extends Error {
  status: number;
  message: string;
  constructor(status: number, message: string) {
    super();
    this.status = status;
    this.message = message;
  }
}

export interface CustomedStockInfo {
  id: string;
  latestBuyDate?: string;
  latestBuyPrice?: number;
  review?: string;
}

export type SortKey = 'LTPRC' | 'GLTD' | 'score' | 'FCF_avg_3' | 'CAP';

export interface SortConfig {
  direction: 'asc' | 'desc';
  key: SortKey;
}
