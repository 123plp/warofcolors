import { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, GripVertical } from 'lucide-react';
import { Widget, WIDGET_SIZES, WidgetSize } from '@/hooks/useWidgets';
import { cn } from '@/lib/utils';

interface WidgetContainerProps {
  widget: Widget;
  editMode: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onMove: (x: number, y: number) => void;
  onCycleSize: () => void;
  children: React.ReactNode;
}

export const WidgetContainer = ({
  widget,
  editMode,
  isSelected,
  onSelect,
  onRemove,
  onMove,
  onCycleSize,
  children,
}: WidgetContainerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const size = WIDGET_SIZES[widget.size];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!editMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Constrain to viewport with padding
      const maxX = window.innerWidth - size.width - 10;
      const maxY = window.innerHeight - size.height - 60; // Account for taskbar
      
      onMove(
        Math.max(10, Math.min(newX, maxX)),
        Math.max(10, Math.min(newY, maxY))
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, size, onMove]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute rounded-lg overflow-hidden transition-all duration-200",
        "bg-background/80 backdrop-blur-md border shadow-lg",
        editMode && "cursor-move",
        isSelected && editMode && "ring-2 ring-primary",
        isDragging && "opacity-80 scale-105"
      )}
      style={{
        left: widget.x,
        top: widget.y,
        width: size.width,
        height: size.height,
        zIndex: isSelected ? 50 : 40,
      }}
      onClick={() => editMode && onSelect()}
    >
      {/* Edit mode controls - entire header is draggable */}
      {editMode && (
        <div 
          className="absolute top-0 left-0 right-0 h-8 bg-primary/20 backdrop-blur flex items-center justify-between px-2 z-10 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-1">
            <GripVertical className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">{widget.type}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onCycleSize(); }}
              onMouseDown={(e) => e.stopPropagation()}
              className="p-1 hover:bg-primary/30 rounded transition-colors"
              title="Cycle size"
            >
              {widget.size === 'small' ? (
                <Maximize2 className="w-3 h-3" />
              ) : widget.size === 'large' ? (
                <Minimize2 className="w-3 h-3" />
              ) : (
                <Maximize2 className="w-3 h-3" />
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              onMouseDown={(e) => e.stopPropagation()}
              className="p-1 hover:bg-destructive/50 rounded transition-colors"
              title="Remove widget"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      
      {/* Widget content */}
      <div className={cn(
        "w-full h-full",
        editMode && "pt-8"
      )}>
        {children}
      </div>
    </div>
  );
};
