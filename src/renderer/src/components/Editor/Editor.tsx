import { memo, useEffect, useMemo, useRef } from 'react';
import { markdown } from '@yoopta/exports';
import YooptaEditor, { createYooptaEditor, YooptaContentValue } from '@yoopta/editor';
import { dataDirectoryAtom, Direcotry } from '@renderer/models';
import { tools, plugins, marks } from './editor-config';
import { useDebounceFn, useMemoizedFn } from 'ahooks';
import { fetchFileText, waitForWriteFile } from '@renderer/api/request';
import { useAtomValue } from 'jotai';

interface EditorProps {
  stockId: string;
  name: string;
}

export const Editor = memo<EditorProps>(({ stockId, name }) => {
  const dataDirectory = useAtomValue(dataDirectoryAtom);
  const editor = useMemo(() => createYooptaEditor(), []);
  const filename = useMemo(
    () => (dataDirectory ? `${dataDirectory}${Direcotry.REVIEW}${stockId}.json` : undefined),
    [dataDirectory, stockId],
  );
  const timeoutRef = useRef(0);
  const selectionBoxRef = useRef<HTMLDivElement>(null);

  const save = useMemoizedFn(async (file: string | undefined = filename) => {
    if (!editor.isEmpty() && file) {
      await waitForWriteFile(file, JSON.stringify(editor.getEditorValue()));
    }
  });

  const { run: debouncedSave } = useDebounceFn(() => save(), { wait: 5_000 });

  useEffect(() => {
    setTimeout(async () => {
      if (!filename) {
        return;
      }
      let value: YooptaContentValue | undefined;
      try {
        const json = await fetchFileText(filename);
        if (json) {
          value = JSON.parse(json);
        }
      } catch {
        // do nothing
      }
      if (value) {
        editor.setEditorValue(value);
      } else {
        editor.setEditorValue(markdown.deserialize(editor, `# ${name}\n\n---\n\n`));
      }

      editor.on('change', debouncedSave);
    }, 0);

    const preFilename = filename;
    const timeout = timeoutRef.current;
    return () => {
      save(preFilename);
      timeout && window.clearTimeout(timeout);
      editor.off('change', debouncedSave);
    };
  }, [editor, filename, name, debouncedSave, save]);

  return (
    <div
      className="w-full h-full py-4 px-14 relative editor-wrapper overflow-y-auto"
      ref={selectionBoxRef}
      onKeyDown={(e) => {
        if (e.metaKey || e.ctrlKey) {
          if (e.key === 's') {
            save();
          }
        }
      }}
    >
      <YooptaEditor
        width="100%"
        editor={editor}
        plugins={plugins}
        tools={tools}
        marks={marks}
        selectionBoxRoot={selectionBoxRef}
      />
    </div>
  );
});
Editor.displayName = 'Editor';
