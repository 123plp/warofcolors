import { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';
import { cn } from '@/lib/utils';

interface SecurityLevelWidgetProps {
  widget: Widget;
}

const CLEARANCE_LEVELS = [
  { level: 0, name: 'Level 0', color: 'text-slate-400', bg: 'bg-slate-500/20', access: 'Unrestricted' },
  { level: 1, name: 'Level 1', color: 'text-green-400', bg: 'bg-green-500/20', access: 'Confidential' },
  { level: 2, name: 'Level 2', color: 'text-blue-400', bg: 'bg-blue-500/20', access: 'Restricted' },
  { level: 3, name: 'Level 3', color: 'text-yellow-400', bg: 'bg-yellow-500/20', access: 'Secret' },
  { level: 4, name: 'Level 4', color: 'text-orange-400', bg: 'bg-orange-500/20', access: 'Top Secret' },
  { level: 5, name: 'Level 5', color: 'text-red-400', bg: 'bg-red-500/20', access: 'Thaumiel' },
];

export const SecurityLevelWidget = ({ widget }: SecurityLevelWidgetProps) => {
  const [currentLevel, setCurrentLevel] = useState(3);
  const [isLocked, setIsLocked] = useState(false);
  const [showAccess, setShowAccess] = useState(true);

  const clearance = CLEARANCE_LEVELS[currentLevel];
  const isSmall = widget.size === 'small';

  return (
    <div className={cn(
      "w-full h-full p-3 flex flex-col",
      clearance.bg
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield className={cn("w-4 h-4", clearance.color)} />
          {!isSmall && (
            <span className="text-sm font-medium">Security Clearance</span>
          )}
        </div>
        <button
          onClick={() => setIsLocked(!isLocked)}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <Lock className={cn(
            "w-3 h-3",
            isLocked ? "text-red-400" : "text-muted-foreground"
          )} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={cn(
          "font-bold tracking-wider text-center",
          isSmall ? "text-xl" : "text-3xl",
          clearance.color
        )}>
          {clearance.name.toUpperCase()}
        </div>
        
        {!isSmall && (
          <>
            <div className={cn(
              "text-xs mt-1 flex items-center gap-1",
              clearance.color
            )}>
              <button
                onClick={() => setShowAccess(!showAccess)}
                className="p-0.5 hover:bg-white/10 rounded"
              >
                {showAccess ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
              </button>
              {showAccess ? clearance.access : '••••••••'}
            </div>

            {/* Level indicator */}
            <div className="flex gap-1 mt-3">
              {CLEARANCE_LEVELS.map((lvl, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-6 rounded-sm transition-all",
                    i <= currentLevel ? lvl.bg : "bg-muted/30",
                    i <= currentLevel && lvl.color.replace('text-', 'border-'),
                    "border"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {!isSmall && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>ID: USH-{String(Math.floor(Math.random() * 9999)).padStart(4, '0')}</span>
          <span>Site-19</span>
        </div>
      )}
    </div>
  );
};
