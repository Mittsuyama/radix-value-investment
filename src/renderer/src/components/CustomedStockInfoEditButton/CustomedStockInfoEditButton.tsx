import { memo, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { ButtonProps, Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import { Pencil1Icon } from '@radix-ui/react-icons';
import {
  customedStockInfoListAtom,
  dataDirectoryAtom,
  Direcotry,
  StorageKey,
} from '@renderer/models';
import { useMemoizedFn } from 'ahooks';
import { waitForWriteFile } from '@renderer/api/request';

interface CustomedStockInfoEditButtonProps extends Pick<ButtonProps, 'variant' | 'size'> {
  id: string;
}

export const CustomedStockInfoEditButton = memo<CustomedStockInfoEditButtonProps>(
  ({ id, ...rest }) => {
    const dir = useAtomValue(dataDirectoryAtom);
    const [customedInfoList, setCustomedInfoList] = useAtom(customedStockInfoListAtom);
    const [defaultInfo] = useState(customedInfoList.find((item) => item.id === id));
    const [values, setValues] = useState<{
      price?: string;
      date?: string;
    }>({
      price: defaultInfo?.latestBuyPrice?.toString(),
      date: defaultInfo?.latestBuyDate,
    });

    const onSave = useMemoizedFn(async () => {
      if (values) {
        const newData = [
          ...customedInfoList.filter((item) => item.id !== id),
          {
            id,
            latestBuyDate: values.date,
            latestBuyPrice: values.price ? Number(values.price) : undefined,
          },
        ];
        setCustomedInfoList(newData);
        if (dir) {
          await waitForWriteFile(
            `${dir}${Direcotry.GLOBAL}${StorageKey.CUSTOMED_STOCK_INFO_LIST}.json`,
            JSON.stringify(newData),
          );
        }
      }
    });

    return (
      <Dialog.Root>
        <Dialog.Trigger>
          <Button {...rest}>
            <Pencil1Icon />
            Edit
          </Button>
        </Dialog.Trigger>

        <Dialog.Content maxWidth="450px">
          <Dialog.Title>Edit Customed Stock Info</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Make changes to your customed stock info.
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Latest Trade Price
              </Text>
              <TextField.Root
                value={values.price}
                onChange={(e) =>
                  setValues((pre) => ({
                    ...pre,
                    id,
                    price: e.target.value,
                  }))
                }
                placeholder="Enter your latest buy price"
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Latest Trade Date
              </Text>
              <TextField.Root
                value={values.date}
                onChange={(e) =>
                  setValues((pre) => ({
                    ...pre,
                    date: e.target.value,
                  }))
                }
                placeholder="Enter your latest buy date"
              />
            </label>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close onClick={onSave}>
              <Button>Save</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    );
  },
);
CustomedStockInfoEditButton.displayName = 'CustomedStockInfoEditButton';
