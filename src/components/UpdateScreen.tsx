import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface UpdateScreenProps {
  onComplete: () => void;
}

export const UpdateScreen = ({ onComplete }: UpdateScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("downloading");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return 100;
        }
        return prev + 1;
      });
    }, 80);

    // Update stage based on progress
    const stageInterval = setInterval(() => {
      if (progress < 30) setStage("downloading");
      else if (progress < 60) setStage("preparing");
      else if (progress < 90) setStage("installing");
      else setStage("finishing");
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(stageInterval);
    };
  }, [onComplete, progress]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-primary text-primary-foreground overflow-hidden animate-fade-in">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
      
      {/* Spinning Loading Animation */}
      <div className="relative z-10 mb-12">
        <div className="w-24 h-24 relative animate-spin" style={{ animationDuration: '2s' }}>
          <div className="absolute inset-0 rounded-full border-8 border-primary-foreground/20"></div>
          <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-primary-foreground"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-6 max-w-md px-8">
        <h1 className="text-4xl font-bold mb-2 animate-fade-in">Windows Update</h1>
        
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <p className="text-lg">
            {stage === "downloading" && "Trabajando en las actualizaciones"}
            {stage === "preparing" && "Preparando actualizaciones"}
            {stage === "installing" && "Instalando actualizaciones"}
            {stage === "finishing" && "Finalizando actualización"}
          </p>
          
          <p className="text-sm opacity-90">
            No desconectes tu PC. Esta acción puede tardar unos minutos.
          </p>
          
          <p className="text-sm opacity-80">
            Al final de la actualización, tu PC se liberará automáticamente.
          </p>
        </div>

        {/* Progress */}
        <div className="pt-8 space-y-3 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="text-2xl font-bold">{progress}%</div>
          
          {/* Progress Bar */}
          <div className="w-full h-1 bg-primary-foreground/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-foreground transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-8 text-center text-sm opacity-70 animate-fade-in" style={{ animationDelay: "0.6s" }}>
        <p>URBANSHADE OS v2.0.0</p>
      </div>
    </div>
  );
};
