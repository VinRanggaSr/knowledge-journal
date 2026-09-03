import * as React from 'react';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-foreground gap-1',
  {
    variants: {
      color: {
        neutral: '',
        orange: '',
        violet: '',
        teal: '',
        blue: '',
        pink: '',
        green: '',
        yellow: '',
      },
    },
    defaultVariants: {
      color: 'neutral',
    },
  },
);

export type TagColor = NonNullable<VariantProps<typeof badgeVariants>['color']>;

const dotColorClasses: Record<TagColor, string> = {
  neutral: 'bg-muted-foreground',
  orange: 'bg-tag-orange-text',
  violet: 'bg-tag-violet-text',
  teal: 'bg-tag-teal-text',
  blue: 'bg-tag-blue-text',
  pink: 'bg-tag-pink-text',
  green: 'bg-tag-green-text',
  yellow: 'bg-tag-yellow-text',
};

interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, color, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ color, className }))} {...props}>
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotColorClasses[color ?? 'neutral'])} />
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
export type { BadgeProps };
