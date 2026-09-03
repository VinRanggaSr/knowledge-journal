import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
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

interface ToolbarButtonProps {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
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

function ToolbarButton({ active, onClick, children, label }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-background',
        active && 'bg-background text-foreground',
      )}
    >
      {children}
    </button>
  );
}

function RichTextEditor({ value, onChange, placeholder, contentClassName }: RichTextEditorProps) {
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

  if (!editor) return null;

  function applyFontFamily(value: string) {
    const chain = editor!.chain().focus().selectAll();
    if (value) {
      chain.setFontFamily(value).run();
    } else {
      chain.unsetFontFamily().run();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-1">
        <ToolbarButton
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          label="Heading 1"
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Ordered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Font"
              className="flex h-8 items-center gap-1 rounded-md px-2 text-muted-foreground hover:bg-background"
            >
              <CaseSensitive className="h-4 w-4" />
              <span className="text-xs font-medium">Font</span>
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
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;
