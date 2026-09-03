import * as React from 'react';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium gap-1',
  {
    variants: {
      color: {
        neutral: 'bg-background text-muted-foreground',
        orange: 'bg-background text-tag-orange-text',
        violet: 'bg-background text-tag-violet-text',
        teal: 'bg-background text-tag-teal-text',
        blue: 'bg-background text-tag-blue-text',
        pink: 'bg-background text-tag-pink-text',
        green: 'bg-background text-tag-green-text',
        yellow: 'bg-background text-tag-yellow-text',
      },
    },
    defaultVariants: {
      color: 'neutral',
    },
  },
);

export type TagColor = NonNullable<VariantProps<typeof badgeVariants>['color']>;

interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, color, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ color, className }))} {...props}>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
export type { BadgeProps };
