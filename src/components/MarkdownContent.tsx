import { useEffect, useRef } from 'react';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // For now, we'll render markdown as HTML
    // In production, you'd use a library like react-markdown or marked
    if (contentRef.current) {
      // Basic markdown to HTML conversion
      let html = content
        // Headers
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-4">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
        // Bold
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>')
        // Lists
        .replace(/^\* (.+)/gim, '<li class="ml-4">• $1</li>')
        .replace(/^\d+\. (.+)/gim, '<li class="ml-4">$1</li>')
        // Code blocks
        .replace(/```([^`]+)```/g, '<pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')
        // Paragraphs
        .replace(/\n\n/g, '</p><p class="mb-4">')
        // Line breaks
        .replace(/\n/g, '<br />');

      // Wrap in paragraph tags
      html = `<p class="mb-4">${html}</p>`;

      contentRef.current.innerHTML = html;
    }
  }, [content]);

  return (
    <div
      ref={contentRef}
      className={`prose dark:prose-invert max-w-none ${className}`}
    />
  );
}