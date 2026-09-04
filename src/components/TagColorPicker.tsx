import { cn } from '@/lib/utils';
import type { TagColor } from '@/types';

const COLORS: TagColor[] = ['orange', 'violet', 'teal', 'blue', 'pink', 'green', 'yellow'];

const SWATCH_CLASS: Record<TagColor, string> = {
  orange: 'bg-tag-orange-text',
  violet: 'bg-tag-violet-text',
  teal: 'bg-tag-teal-text',
  blue: 'bg-tag-blue-text',
  pink: 'bg-tag-pink-text',
  green: 'bg-tag-green-text',
  yellow: 'bg-tag-yellow-text',
};

interface TagColorPickerProps {
  value: TagColor;
  onChange: (color: TagColor) => void;
}

function TagColorPicker({ value, onChange }: TagColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2 px-1">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={color}
          onClick={() => onChange(color)}
          className={cn(
            'h-8 w-8 rounded-full ring-offset-2 transition-transform',
            SWATCH_CLASS[color],
            value === color ? 'ring-2 ring-foreground scale-105' : 'ring-0',
          )}
        />
      ))}
    </div>
  );
}

export default TagColorPicker;
