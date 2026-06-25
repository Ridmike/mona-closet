// components/shared/Breadcrumb.tsx
"use client";

import Link from "next/link";
import type { BreadcrumbItem } from "@/types";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-body text-brand-charcoal/50">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden="true">/</span>}
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className="hover:text-brand-mauve transition-colors">
              {item.label}
            </Link>
          ) : (
            <span
              className={i === items.length - 1 ? "text-brand-plum font-medium" : ""}
              aria-current={i === items.length - 1 ? "page" : undefined}
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
