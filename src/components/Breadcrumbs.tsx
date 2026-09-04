import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
            {item.to && !isLast ? (
              <Link to={item.to} className="capitalize text-muted-foreground hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="capitalize font-medium text-foreground">{item.label}</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
