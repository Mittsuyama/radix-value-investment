import { memo, useEffect, useMemo, useRef } from 'react';
import YooptaEditor, { createYooptaEditor, YooptaContentValue } from '@yoopta/editor';
import { StorageKey } from '@renderer/models';
import { tools, plugins, marks } from './editor-config';
import { useMemoizedFn } from 'ahooks';

interface EditorProps {
  stockId: string;
}

export const Editor = memo<EditorProps>(({ stockId }) => {
  const editor = useMemo(() => createYooptaEditor(), []);
  const storageKey = useMemo(() => `${StorageKey.STOCK_REVIEW}-${stockId}`, [stockId]);
  const timeoutRef = useRef(0);

  const save = useMemoizedFn(() => {
    localStorage.setItem(storageKey, JSON.stringify(editor.getEditorValue()));
  });

  const autoSave = useMemoizedFn(() => {
    timeoutRef.current = window.setTimeout(() => {
      save();
      autoSave();
    }, 10_000);
  });

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
      editor.setEditorValue({});
    }

    autoSave();

    const timeout = timeoutRef.current;
    return () => {
      timeout && window.clearTimeout(timeout);
    };
  }, [editor, storageKey, autoSave]);

  return (
    <div
      className="w-full h-full p-4 relative"
      onKeyDown={(e) => {
        if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
          save();
        }
      }}
    >
      <div className="px-10">
        <YooptaEditor width="100%" editor={editor} plugins={plugins} tools={tools} marks={marks} />
      </div>
    </div>
  );
});
Editor.displayName = 'Editor';
