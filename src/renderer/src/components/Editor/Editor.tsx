import { memo, useEffect, useMemo, useRef } from 'react';
import { markdown } from '@yoopta/exports';
import YooptaEditor, { createYooptaEditor, YooptaContentValue } from '@yoopta/editor';
import { StorageKey } from '@renderer/models';
import { tools, plugins, marks } from './editor-config';
import { useDebounceFn, useMemoizedFn } from 'ahooks';

interface EditorProps {
  stockId: string;
  name: string;
}

export const Editor = memo<EditorProps>(({ stockId, name }) => {
  const editor = useMemo(() => createYooptaEditor(), []);
  const storageKey = useMemo(() => `${StorageKey.STOCK_REVIEW}-${stockId}`, [stockId]);
  const timeoutRef = useRef(0);
  const selectionBoxRef = useRef<HTMLDivElement>(null);

  const save = useMemoizedFn((key?: string) => {
    if (!editor.isEmpty()) {
      localStorage.setItem(key || storageKey, JSON.stringify(editor.getEditorValue()));
    }
  });

  const { run: debouncedSave } = useDebounceFn(save, { wait: 5_000 });

  useEffect(() => {
    let value: YooptaContentValue | undefined;
    try {
      const json = localStorage.getItem(storageKey);
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

    const preStorageKey = storageKey;
    const timeout = timeoutRef.current;
    return () => {
      save(preStorageKey);
      timeout && window.clearTimeout(timeout);
      editor.off('change', debouncedSave);
    };
  }, [editor, storageKey, name, debouncedSave, save]);

  return (
    <div
      className="w-full h-full py-4 px-14 relative"
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
