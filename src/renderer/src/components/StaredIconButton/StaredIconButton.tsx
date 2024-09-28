import { memo } from 'react';
import { useMemoizedFn } from 'ahooks';
import { useAtom, useAtomValue } from 'jotai';
import { Button, ButtonProps } from '@radix-ui/themes';
import { StarIcon, StarFilledIcon } from '@radix-ui/react-icons';
import { dataDirectoryAtom, Direcotry, staredStockIdListAtom, StorageKey } from '@renderer/models';
import { waitForWriteFile } from '@renderer/api/request';

interface StaredIconButtonProps extends Pick<ButtonProps, 'variant' | 'size'> {
  id: string;
}

export const StaredIconButton = memo<StaredIconButtonProps>(({ id, ...rest }) => {
  const dir = useAtomValue(dataDirectoryAtom);
  const [staredList, setStaredList] = useAtom(staredStockIdListAtom);

  const onStaredToggle = useMemoizedFn(async () => {
    const newList = staredList?.includes(id)
      ? staredList.filter((item) => item !== id)
      : [...(staredList || []), id];
    setStaredList(newList);
    if (dir) {
      await waitForWriteFile(
        `${dir}${Direcotry.GLOBAL}${StorageKey.SARED_STOCK_ID_LIST}.json`,
        JSON.stringify(newList),
      );
    }
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
