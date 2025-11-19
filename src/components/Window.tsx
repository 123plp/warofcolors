import { useState, useRef, useEffect } from "react";
import { X, Minus, Maximize2, Loader2 } from "lucide-react";

interface WindowProps {
  title: string;
  children: React.ReactNode;
  zIndex: number;
  onClose: () => void;
  onFocus: () => void;
  onMinimize?: () => void;
}

export const Window = ({ title, children, zIndex, onClose, onFocus, onMinimize }: WindowProps) => {
  const [position, setPosition] = useState({ x: 100 + Math.random() * 200, y: 80 + Math.random() * 100 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [previousState, setPreviousState] = useState<{ position: { x: number; y: number }; size: { width: number; height: number } } | null>(null);
  const [loading, setLoading] = useState(true);
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800 + Math.random() * 400);

    return () => clearTimeout(timer);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    onFocus();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        setSize({
          width: Math.max(400, resizeStart.width + deltaX),
          height: Math.max(300, resizeStart.height + deltaY)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart]);

  const handleMaximize = () => {
    if (isMaximized) {
      // Restore
      if (previousState) {
        setPosition(previousState.position);
        setSize(previousState.size);
      }
      setIsMaximized(false);
    } else {
      // Maximize
      setPreviousState({ position, size });
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight - 48 }); // 48px for taskbar
      setIsMaximized(true);
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  return (
    <div
      ref={windowRef}
      className="absolute rounded-xl glass-panel shadow-2xl flex flex-col overflow-hidden animate-scale-in"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: Math.max(zIndex, 1000)
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div
        className="h-12 flex items-center px-3 border-b border-white/5 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex-1 font-bold text-sm">{title}</div>
        <div className="window-controls flex gap-2">
          <button
            onClick={onMinimize}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            title="Minimize"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button 
            onClick={handleMaximize}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            title="Maximize"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-destructive/20 text-destructive transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <div className="text-sm text-muted-foreground font-mono">Loading {title}...</div>
            </div>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Resize Handle */}
      {!isMaximized && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize group"
        >
          <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-white/20 group-hover:border-primary/50 transition-colors" />
        </div>
      )}
    </div>
  );
};
