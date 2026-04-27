'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export default function CodeBlock({
  code,
  language = 'python',
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className="relative rounded-lg border border-border bg-muted/30 overflow-hidden my-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">{language}</span>
        <button
          onClick={copyToClipboard}
          className="p-1 hover:bg-muted rounded transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm font-mono leading-relaxed">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              {showLineNumbers && (
                <span className="mr-4 text-muted-foreground select-none w-8 text-right">
                  {i + 1}
                </span>
              )}
              <code>{line}</code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
