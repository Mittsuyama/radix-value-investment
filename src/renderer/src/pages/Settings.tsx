import { memo } from 'react';
import { useAtom } from 'jotai';
import { Button, Text } from '@radix-ui/themes';
import { dataDirectoryAtom } from '@renderer/models';
import { waitForSelectDirectory } from '@renderer/api/request';

export const Settings = memo(() => {
  const [dir, setDir] = useAtom(dataDirectoryAtom);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <Text size="9" className="font-bold mb-5 font-serif">
        Select a Directroy to Save Data
      </Text>
      <div className="text-gray-10 mb-6">Current Selected: {dir || '-'}</div>
      <div className="flex items-center gap-4">
        <Button
          onClick={async () => {
            const [directory] = await waitForSelectDirectory();
            setDir(directory);
            location.reload();
          }}
          value="solid"
        >
          Select Directory
        </Button>
      </div>
    </div>
  );
});
Settings.displayName = 'Settings';
