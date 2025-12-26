import { FileText, Terminal, Settings, Globe, Database, Activity } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';
import { cn } from '@/lib/utils';

interface QuickLinksWidgetProps {
  widget: Widget;
  onOpenApp?: (appId: string) => void;
}

const DEFAULT_LINKS = [
  { id: 'explorer', name: 'Files', icon: FileText },
  { id: 'terminal', name: 'Terminal', icon: Terminal },
  { id: 'settings', name: 'Settings', icon: Settings },
  { id: 'browser', name: 'Browser', icon: Globe },
  { id: 'database', name: 'Database', icon: Database },
  { id: 'monitor', name: 'Monitor', icon: Activity },
];

export const QuickLinksWidget = ({ widget, onOpenApp }: QuickLinksWidgetProps) => {
  const isSmall = widget.size === 'small';
  const linksToShow = isSmall ? DEFAULT_LINKS.slice(0, 4) : DEFAULT_LINKS;

  return (
    <div className="w-full h-full p-2">
      <div className={cn(
        "grid gap-1",
        isSmall ? "grid-cols-2" : "grid-cols-3"
      )}>
        {linksToShow.map(link => {
          const Icon = link.icon;
          return (
            <button
              key={link.id}
              onClick={() => onOpenApp?.(link.id)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg",
                "hover:bg-primary/20 transition-all duration-200",
                "group"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20",
                "transition-all duration-200"
              )}>
                <Icon className={cn(
                  "text-primary transition-transform group-hover:scale-110",
                  isSmall ? "w-4 h-4" : "w-5 h-5"
                )} />
              </div>
              <span className={cn(
                "mt-1 text-muted-foreground group-hover:text-foreground transition-colors",
                "truncate max-w-full",
                isSmall ? "text-[10px]" : "text-xs"
              )}>
                {link.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
