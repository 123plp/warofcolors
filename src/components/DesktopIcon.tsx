import { App } from "./Desktop";
import { ChevronRight } from "lucide-react";

interface DesktopIconProps {
  app: App;
}

export const DesktopIcon = ({ app }: DesktopIconProps) => {
  return (
    <div
      className="w-[85px] flex flex-col items-center gap-1.5 text-center select-none group cursor-pointer animate-fade-in"
      onDoubleClick={() => app.run()}
    >
      {/* Icon Container - Clean glass style */}
      <div className="w-12 h-12 rounded-xl bg-background/40 backdrop-blur-sm border border-primary/10 flex items-center justify-center text-primary/70 transition-all duration-200 group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:text-primary group-hover:scale-105">
        <div className="w-6 h-6 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6">
          {app.icon}
        </div>
      </div>
      
      {/* App Name - Clean minimal style */}
      <div className="text-[11px] text-muted-foreground/80 transition-colors group-hover:text-foreground max-w-[80px] truncate leading-tight">
        {app.name}
      </div>
    </div>
  );
};
