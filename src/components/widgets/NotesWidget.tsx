import { useState, useEffect } from 'react';
import { Widget } from '@/hooks/useWidgets';
import { cn } from '@/lib/utils';

interface NotesWidgetProps {
  widget: Widget;
  onUpdateSettings: (settings: Record<string, unknown>) => void;
}

export const NotesWidget = ({ widget, onUpdateSettings }: NotesWidgetProps) => {
  const [content, setContent] = useState(() => 
    (widget.settings?.content as string) || ''
  );
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Save with debounce
    const timeout = setTimeout(() => {
      if (content !== widget.settings?.content) {
        onUpdateSettings({ content });
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [content, widget.settings?.content, onUpdateSettings]);

  const isSmall = widget.size === 'small';
  const color = (widget.settings?.color as string) || 'yellow';

  const bgColors: Record<string, string> = {
    yellow: 'bg-yellow-100/90 dark:bg-yellow-900/30',
    blue: 'bg-blue-100/90 dark:bg-blue-900/30',
    green: 'bg-green-100/90 dark:bg-green-900/30',
    pink: 'bg-pink-100/90 dark:bg-pink-900/30',
    purple: 'bg-purple-100/90 dark:bg-purple-900/30',
  };

  return (
    <div className={cn(
      "w-full h-full p-3 flex flex-col",
      bgColors[color] || bgColors.yellow
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          "font-medium text-foreground",
          isSmall ? "text-xs" : "text-sm"
        )}>
          📝 Quick Note
        </span>
        <div className="flex gap-1">
          {['yellow', 'blue', 'green', 'pink', 'purple'].map(c => (
            <button
              key={c}
              onClick={() => onUpdateSettings({ color: c })}
              className={cn(
                "w-3 h-3 rounded-full border",
                c === 'yellow' && 'bg-yellow-400',
                c === 'blue' && 'bg-blue-400',
                c === 'green' && 'bg-green-400',
                c === 'pink' && 'bg-pink-400',
                c === 'purple' && 'bg-purple-400',
                color === c && 'ring-2 ring-offset-1 ring-foreground/50'
              )}
            />
          ))}
        </div>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        placeholder="Type your notes here..."
        className={cn(
          "flex-1 w-full bg-transparent border-none resize-none focus:outline-none",
          "text-foreground placeholder:text-muted-foreground/60",
          isSmall ? "text-xs" : "text-sm"
        )}
      />
      
      {!isSmall && (
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {content.length} chars
        </div>
      )}
    </div>
  );
};
