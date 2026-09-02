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
        orange: 'bg-tag-orange-bg text-tag-orange-text',
        violet: 'bg-tag-violet-bg text-tag-violet-text',
        teal: 'bg-tag-teal-bg text-tag-teal-text',
        blue: 'bg-tag-blue-bg text-tag-blue-text',
        pink: 'bg-tag-pink-bg text-tag-pink-text',
        green: 'bg-tag-green-bg text-tag-green-text',
        yellow: 'bg-tag-yellow-bg text-tag-yellow-text',
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

function Badge({ className, color, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ color, className }))} {...props} />;
}

export { Badge, badgeVariants };
export type { BadgeProps };
