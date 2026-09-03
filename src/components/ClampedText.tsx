import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ClampedTextProps {
  text: string;
  className: string;
  gradientFrom?: 'surface' | 'background';
}

function ClampedText({ text, className, gradientFrom = 'surface' }: ClampedTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <p className="text-sm leading-6 text-muted-foreground">{text}</p>
      {isOverflowing && (
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t to-transparent',
            gradientFrom === 'background' ? 'from-background' : 'from-surface',
          )}
        />
      )}
    </div>
  );
}

export default ClampedText;
