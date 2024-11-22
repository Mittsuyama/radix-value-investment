export const deviation = (arr: number[]) => {
  const avg = arr.reduce((a, b) => a + b) / arr.length;
  return arr.map((item) => (item - avg) * (item - avg)).reduce((a, b) => a + b) / arr.length;
};

export const standardDeviation = (arr: number[]) => Math.sqrt(deviation(arr));
