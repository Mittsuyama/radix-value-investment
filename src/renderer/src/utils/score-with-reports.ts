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
];
const PEScore: ScoreList = [
  { min: 0, max: 10, score: 3 },
  { min: 10, max: 15, score: 2.5 },
  { min: 15, max: 20, score: 2 },
  { min: 20, max: 30, score: 1.5 },
  { min: 50, max: 200, score: -1 },
];
const GPRScore: ScoreList = [
  { min: 10, max: 15, score: 1 },
  { min: 15, max: 20, score: 1.5 },
  { min: 20, max: 30, score: 2 },
  { min: 30, max: 50, score: 3 },
  { min: 50, max: 110, score: 4 },
];
const cfcScore: ScoreList = [
  { min: 3, max: 5, score: 1 },
  { min: 5, max: 8, score: 1.5 },
  { min: 8, max: 12, score: 2 },
  { min: 12, max: 15, score: 2.5 },
  { min: 15, max: 100, score: 3 },
];

const getScore = (value: number, scoreList: ScoreList) => {
  const score = scoreList.find((item) => value >= item.min && value < item.max);
  return score?.score || 0;
};

export const getStockScore = (stock: StockWithReportsDetail) => {
  return [
    getScore(stock.ttmROE, ROEScore),
    getScore(stock.ttmPE, PEScore),
    getScore(stock.GPR, GPRScore),
    getScore(stock.cfcAvg3, cfcScore),
  ].reduce((pre, cur) => pre + cur, 0);
};

export const autoSort = (list: StockWithReportsDetail[]) => {
  const res = list.sort((a, b) => getStockScore(b) - getStockScore(a));
  return res;
};
