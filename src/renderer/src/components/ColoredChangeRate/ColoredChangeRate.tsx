import { memo } from 'react';
import cls from 'classnames';
import { TriangleUpIcon, TriangleDownIcon, DashIcon } from '@radix-ui/react-icons';
import { useMemoizedFn } from 'ahooks';

const ICON_SIZE = 20;

export const ColoredChangeRate = memo<{ rate: number; className?: string }>(
  ({ rate, className }) => {
    const iconRender = useMemoizedFn(() => {
      if (rate === 0) {
        return <DashIcon width={ICON_SIZE} height={ICON_SIZE} />;
      }
      if (rate > 0) {
        return <TriangleUpIcon width={ICON_SIZE} height={ICON_SIZE} />;
      }
      return <TriangleDownIcon width={ICON_SIZE} height={ICON_SIZE} />;
    });

    return (
      <div
        className={cls(className, 'font-mono flex items-center font-bold', {
          'text-red-9': rate > 0,
          'text-green-9': rate < 0,
        })}
      >
        {iconRender()}
        {Math.abs(rate).toFixed(2)}%
      </div>
    );
  },
);
ColoredChangeRate.displayName = 'ColoredChangeRate';
