import { useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CaseSensitive,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  contentClassName?: string;
}

interface UseRichTextEditorOptions {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  contentClassName?: string;
}

const FONT_OPTIONS = [
  {
    group: 'Sans Serif',
    fonts: [
      { label: 'Inter (Default)', value: '' },
      { label: 'Roboto', value: 'Roboto, sans-serif' },
      { label: 'Poppins', value: 'Poppins, sans-serif' },
      { label: 'Lato', value: 'Lato, sans-serif' },
    ],
  },
  {
    group: 'Serif',
    fonts: [
      { label: 'Merriweather', value: 'Merriweather, serif' },
      { label: 'Lora', value: 'Lora, serif' },
      { label: 'Playfair Display', value: '"Playfair Display", serif' },
    ],
  },
];

export function useRichTextEditor({
  value,
  onChange,
  placeholder,
  contentClassName,
}: UseRichTextEditorOptions): Editor | null {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      Placeholder.configure({ placeholder: placeholder || 'Tulis di sini...' }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none min-h-[160px] rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20',
          contentClassName,
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  return editor;
}

interface RichTextToolbarProps {
  editor: Editor;
  layout?: 'row' | 'panel';
  className?: string;
}

export function RichTextToolbar({ editor, layout = 'row', className }: RichTextToolbarProps) {
  function applyFontFamily(value: string) {
    const chain = editor.chain().focus().selectAll();
    if (value) {
      chain.setFontFamily(value).run();
    } else {
      chain.unsetFontFamily().run();
    }
  }

  const formatButtons = [
    {
      label: 'Bold',
      icon: Bold,
      active: editor.isActive('bold'),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: 'Italic',
      icon: Italic,
      active: editor.isActive('italic'),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: 'Underline',
      icon: UnderlineIcon,
      active: editor.isActive('underline'),
      onClick: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      label: 'Heading 1',
      icon: Heading1,
      active: editor.isActive('heading', { level: 1 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: 'Heading 2',
      icon: Heading2,
      active: editor.isActive('heading', { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: 'Heading 3',
      icon: Heading3,
      active: editor.isActive('heading', { level: 3 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: 'Bullet list',
      icon: List,
      active: editor.isActive('bulletList'),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: 'Ordered list',
      icon: ListOrdered,
      active: editor.isActive('orderedList'),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  const fontPicker = (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Font"
          className={cn(
            'flex items-center gap-1 rounded-md text-muted-foreground hover:bg-background',
            layout === 'row' ? 'h-8 px-2' : 'w-full justify-between rounded-xl border border-border px-3 py-2',
          )}
        >
          <span className="flex items-center gap-1">
            <CaseSensitive className="h-4 w-4" />
            <span className="text-xs font-medium">
              {layout === 'row' ? 'Font' : 'Customize font'}
            </span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="start">
        <div className="flex flex-col gap-3">
          {FONT_OPTIONS.map((group) => (
            <div key={group.group} className="flex flex-col gap-1">
              <p className="px-2 text-xs font-medium text-muted-foreground">{group.group}</p>
              {group.fonts.map((font) => (
                <button
                  key={font.label}
                  type="button"
                  onClick={() => applyFontFamily(font.value)}
                  className="rounded-lg px-2 py-1.5 text-left text-sm hover:bg-background"
                  style={{ fontFamily: font.value || undefined }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );

  if (layout === 'panel') {
    return (
      <div className={cn('flex flex-col gap-3 rounded-[30px] border border-border bg-background p-4', className)}>
        <p className="text-xs font-medium text-muted-foreground">Text Editor</p>
        {fontPicker}
        <div className="w-full border-t border-dashed border-border" />
        <div className="grid grid-cols-3 gap-3">
          {formatButtons.map(({ label, icon: Icon, active, onClick }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={onClick}
              className="flex flex-col items-center gap-1.5 text-muted-foreground"
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-sm',
                  active && 'text-foreground ring-2 ring-foreground/20',
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[10px] leading-none">{label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-1',
        className,
      )}
    >
      {formatButtons.slice(0, 3).map(({ label, icon: Icon, active, onClick }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          onClick={onClick}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-background',
            active && 'bg-background text-foreground',
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
      <div className="mx-1 h-5 w-px bg-border" />
      {formatButtons.slice(3, 6).map(({ label, icon: Icon, active, onClick }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          onClick={onClick}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-background',
            active && 'bg-background text-foreground',
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
      <div className="mx-1 h-5 w-px bg-border" />
      {formatButtons.slice(6, 8).map(({ label, icon: Icon, active, onClick }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          onClick={onClick}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-background',
            active && 'bg-background text-foreground',
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
      <div className="mx-1 h-5 w-px bg-border" />
      {fontPicker}
    </div>
  );
}

function RichTextEditor({ value, onChange, placeholder, contentClassName }: RichTextEditorProps) {
  const editor = useRichTextEditor({ value, onChange, placeholder, contentClassName });

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2">
      <RichTextToolbar editor={editor} layout="row" />
      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;
