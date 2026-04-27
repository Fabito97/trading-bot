'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface DocumentationLayoutProps {
  title: string;
  breadcrumb: string;
  children: React.ReactNode;
}

export default function DocumentationLayout({
  title,
  breadcrumb,
  children,
}: DocumentationLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/documentation"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Documentation
          </Link>
          <div className="text-xs text-muted-foreground mb-2">{breadcrumb}</div>
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}
