import { memo } from 'react';
import { useMemoizedFn } from 'ahooks';
import { useAtom } from 'jotai';
import { Button, ButtonProps } from '@radix-ui/themes';
import { StarIcon, StarFilledIcon } from '@radix-ui/react-icons';
import { staredStockIdListAtom } from '@renderer/models';

interface StaredIconButtonProps extends Pick<ButtonProps, 'variant' | 'size'> {
  id: string;
}

export const StaredIconButton = memo<StaredIconButtonProps>(({ id, ...rest }) => {
  const [staredList, setStaredList] = useAtom(staredStockIdListAtom);

  const onStaredToggle = useMemoizedFn(() => {
    const newList = staredList?.includes(id)
      ? staredList.filter((item) => item !== id)
      : [...(staredList || []), id];
    setStaredList(newList);
  });

  return staredList?.includes(id) ? (
    <Button onClick={onStaredToggle} {...rest}>
      <StarFilledIcon />
      Stared
    </Button>
  ) : (
    <Button onClick={onStaredToggle} {...rest}>
      <StarIcon />
      Unstared
    </Button>
  );
});
StaredIconButton.displayName = 'StaredIconButton';
