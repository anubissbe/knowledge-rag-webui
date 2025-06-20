import { type FC } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export const MarkdownRenderer: FC<MarkdownRendererProps> = ({
  content,
  className,
}) => {
  return (
    <div 
      className={cn("prose prose-neutral dark:prose-invert max-w-none", className)}
    >
      <MDEditor.Markdown
        source={content}
        style={{ 
          backgroundColor: 'transparent',
          color: 'inherit',
        }}
      />
    </div>
  )
}