import {
  gray,
  gold,
  bronze,
  brown,
  yellow,
  amber,
  orange,
  tomato,
  red,
  ruby,
  crimson,
  pink,
  plum,
  purple,
  violet,
  iris,
  indigo,
  blue,
  cyan,
  teal,
  jade,
  green,
  grass,
  lime,
  mint,
  sky,
} from '@radix-ui/colors';

const Palette = {
  gray,
  gold,
  bronze,
  brown,
  yellow,
  amber,
  orange,
  tomato,
  red,
  ruby,
  crimson,
  pink,
  plum,
  purple,
  violet,
  iris,
  indigo,
  blue,
  cyan,
  teal,
  jade,
  green,
  grass,
  lime,
  mint,
  sky,
};

export type ColorType = keyof typeof Palette;

export const ColorMap = Object.fromEntries(
  Object.entries(Palette).map(([key, value]) => [key, [...Object.values(value)]]),
) as Record<ColorType, string[]>;

const STEP = 1;
export const getColorIndex = (index: number, colorLength: number) => {
  const times = Math.floor((index * STEP) / colorLength);
  return Math.floor((index * STEP + times) % colorLength);
};

export const getChartColors = (color: ColorType) => {
  const colorList = Object.values(ColorMap);
  let index = colorList.findIndex((item) => item[0] === ColorMap[color][0]);
  if (index === -1) {
    index = 0;
  }
  return [
    ...colorList[index].slice().reverse(),
    // ...colorList[Math.floor((index + 1) % colorList.length)].slice().reverse().slice(2, 8),
    // ...colorList[Math.floor((index + 2) % colorList.length)].slice().reverse().slice(4, 9),
  ];
};
