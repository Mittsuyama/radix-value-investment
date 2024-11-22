import { memo, ReactNode } from 'react';
import cls from 'classnames';
import { TriangleUpIcon, TriangleDownIcon, DashIcon } from '@radix-ui/react-icons';
import { useMemoizedFn } from 'ahooks';

const ICON_SIZE = 20;

export const ColoredText = memo<{
  text: string;
  status: 'up' | 'unchange' | 'down';
  className?: string;
  icon?: ReactNode;
}>(({ text, className, status, icon }) => {
  const iconRender = useMemoizedFn(() => {
    // 相等
    if (status === 'unchange') {
      return <DashIcon width={ICON_SIZE} height={ICON_SIZE} />;
    }
    // 大于
    if (status === 'up') {
      return <TriangleUpIcon width={ICON_SIZE} height={ICON_SIZE} />;
    }
    // 小于
    return <TriangleDownIcon width={ICON_SIZE} height={ICON_SIZE} />;
  });

  return (
    <div
      className={cls(className, 'font-mono flex items-center font-bold', {
        'text-red-9': status === 'up',
        'text-green-9': status === 'down',
      })}
    >
      {typeof icon === 'undefined' ? iconRender() : icon}
      {text}
    </div>
  );
});
ColoredText.displayName = 'ColoredText';

export const ColoredChangeRate = memo<{
  rate: number;
  className?: string;
}>(({ rate, className }) => (
  <ColoredText
    className={className}
    text={`${Math.abs(rate).toFixed(2)}%`}
    status={Math.abs(rate) < 0.001 ? 'unchange' : rate > 0 ? 'up' : 'down'}
  />
));
ColoredChangeRate.displayName = 'ColoredChangeRate';
