import { StockWithReportsDetail } from '@renderer/types';

interface ScoreRange {
  min: number;
  max: number;
  score: number;
}
type ScoreList = ScoreRange[];

const ROEScore: ScoreList = [
  { min: 10, max: 15, score: 1 },
  { min: 15, max: 17.5, score: 2 },
  { min: 17.5, max: 20, score: 3 },
  { min: 20, max: 30, score: 3.5 },
  { min: 30, max: 50, score: 4 },
  { min: 50, max: Number.MAX_SAFE_INTEGER, score: 4.5 },
];
const roeStdScore: ScoreList = [
  { min: 0, max: 40, score: 2 },
  { min: 40, max: 100, score: 1.5 },
  { min: 100, max: 170, score: 1 },
  { min: 170, max: 250, score: 0.5 },
  { min: 250, max: 350, score: 0 },
  { min: 350, max: 490, score: -0.5 },
  { min: 490, max: 630, score: -1 },
  { min: 630, max: 820, score: -1.5 },
  { min: 820, max: Number.MAX_SAFE_INTEGER, score: -2 },
];
const PEScore: ScoreList = [
  { min: 0, max: 10, score: 2.5 },
  { min: 10, max: 20, score: 2 },
  { min: 20, max: 30, score: 1 },
  { min: 30, max: 40, score: -1 },
  { min: 40, max: 50, score: -3 },
  { min: 50, max: 200, score: -10 },
];
const GPRScore: ScoreList = [
  { min: 10, max: 15, score: 0 },
  { min: 15, max: 20, score: 1 },
  { min: 20, max: 30, score: 2 },
  { min: 30, max: 50, score: 3 },
  { min: 50, max: Number.MAX_SAFE_INTEGER, score: 4 },
];
const gprStdScore: ScoreList = [
  { min: 0, max: 50, score: 2 },
  { min: 50, max: 120, score: 1.5 },
  { min: 120, max: 200, score: 1 },
  { min: 200, max: 290, score: 0.5 },
  { min: 290, max: 400, score: 0 },
  { min: 400, max: 540, score: -0.5 },
  { min: 540, max: 700, score: -1 },
  { min: 700, max: 900, score: -1.5 },
  { min: 900, max: Number.MAX_SAFE_INTEGER, score: -2 },
];
const fcfScore: ScoreList = [
  { min: 3, max: 5, score: 1 },
  { min: 5, max: 8, score: 1.5 },
  { min: 8, max: 12, score: 2 },
  { min: 12, max: 15, score: 2.5 },
  { min: 15, max: 100, score: 3 },
];
const fcfAvg3Score: ScoreList = [
  { min: 3, max: 5, score: -1 },
  { min: 5, max: 8, score: -0.5 },
  { min: 8, max: 12, score: 0 },
  { min: 12, max: 15, score: 0.5 },
  { min: 15, max: 100, score: 1 },
];

const getScore = (value: number, scoreList: ScoreList) => {
  const score = scoreList.find((item) => value >= item.min && value < item.max);
  return score?.score || 0;
};

export const getStockScore = (stock: StockWithReportsDetail) => {
  return [
    getScore(stock.lastYearRoe, ROEScore),
    getScore(stock.ttmPE, PEScore),
    getScore(stock.GPR, GPRScore),
    getScore(stock.fcf, fcfScore),
    getScore(stock.fcfAvg3, fcfAvg3Score),
    getScore(stock.roeStd, roeStdScore),
    getScore(stock.gprStd, gprStdScore),
  ].reduce((pre, cur) => pre + cur);
};

export const autoSort = (list: StockWithReportsDetail[]) => {
  const res = list.sort((a, b) => getStockScore(b) - getStockScore(a));
  return res;
};
