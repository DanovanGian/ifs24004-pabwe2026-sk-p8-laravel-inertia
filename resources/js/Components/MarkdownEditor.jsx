import { useEffect, useRef } from 'react';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';

export default function MarkdownEditor({ value, onChange, height = '420px' }) {
    const mountRef = useRef(null);
    const editorRef = useRef(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        if (!mountRef.current) return undefined;
        const editor = new Editor({
            el: mountRef.current,
            height,
            initialEditType: 'markdown',
            previewStyle: 'vertical',
            initialValue: value ?? '',
            usageStatistics: false,
            events: {
                change: () => onChangeRef.current(editor.getMarkdown()),
            },
        });
        editorRef.current = editor;
        return () => {
            editor.destroy();
            editorRef.current = null;
        };
    }, []);

    useEffect(() => {
        const editor = editorRef.current;
        if (editor && editor.getMarkdown() !== (value ?? '')) editor.setMarkdown(value ?? '');
    }, [value]);

    return <div ref={mountRef} className="overflow-hidden rounded-xl border border-ink/15 bg-white" />;
}
