import { useState } from "react";
import { X, ChevronRight, ChevronLeft, Zap, BookOpen, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FirstTimeTourProps {
  onComplete: () => void;
}

export const FirstTimeTour = ({ onComplete }: FirstTimeTourProps) => {
  const [tourType, setTourType] = useState<"short" | "long" | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const shortSteps = [
    {
      title: "Welcome to Urbanshade OS",
      description: "Your facility management operating system.",
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🏢</div>
          <p className="text-lg">Deep-sea facility management at your fingertips.</p>
          <p className="text-sm text-muted-foreground">Let's cover the essentials quickly.</p>
        </div>
      )
    },
    {
      title: "Desktop Basics",
      description: "Click icons to open apps, use the Start Menu for everything else.",
      content: (
        <div className="space-y-3">
          <p className="text-sm">Getting around is simple:</p>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Desktop icons</strong> - Double-click to open apps</li>
            <li>• <strong>Start Menu</strong> - Bottom-left button for all apps</li>
            <li>• <strong>Taskbar</strong> - Switch between open windows</li>
          </ul>
        </div>
      )
    },
    {
      title: "Key Apps",
      description: "The main tools you'll use.",
      content: (
        <div className="space-y-3">
          <ul className="space-y-2 text-sm">
            <li>📁 <strong>File Explorer</strong> - Browse facility files</li>
            <li>🎛️ <strong>Terminal</strong> - Command-line access</li>
            <li>💬 <strong>Messages</strong> - Staff communications</li>
            <li>🗺️ <strong>Facility Map</strong> - Monitor facility zones</li>
          </ul>
        </div>
      )
    },
    {
      title: "You're Ready!",
      description: "That's all you need to get started.",
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-lg">Quick Tour Complete!</p>
          <p className="text-sm text-muted-foreground">
            For more detailed information, check out the documentation.
          </p>
        </div>
      ),
      showDocsLink: true
    }
  ];

  const longSteps = [
    {
      title: "Welcome to Urbanshade OS",
      description: "Your comprehensive facility management operating system.",
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🏢</div>
          <p className="text-lg">You're now running a deep-sea facility management system.</p>
          <p className="text-sm text-muted-foreground">This tour will cover the main features.</p>
        </div>
      )
    },
    {
      title: "Desktop & Navigation",
      description: "Getting around Urbanshade OS.",
      content: (
        <div className="space-y-3">
          <p className="text-sm">The basics:</p>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Desktop icons</strong> - Double-click to open applications</li>
            <li>• <strong>Start Menu</strong> - Click the bottom-left button for all apps</li>
            <li>• <strong>Taskbar</strong> - Shows open windows, click to switch between them</li>
            <li>• <strong>Drag windows</strong> - Move and resize windows freely</li>
          </ul>
        </div>
      )
    },
    {
      title: "Core Applications",
      description: "The essential tools for facility management.",
      content: (
        <div className="space-y-3">
          <ul className="space-y-2 text-sm">
            <li>📁 <strong>File Explorer</strong> - Browse and view facility files and documents</li>
            <li>🎛️ <strong>Terminal</strong> - Run commands (type <code className="px-1 bg-white/10 rounded">help</code> for a list)</li>
            <li>💬 <strong>Messages</strong> - View staff communications</li>
            <li>📊 <strong>System Monitor</strong> - Check system health and usage</li>
          </ul>
        </div>
      )
    },
    {
      title: "Facility Tools",
      description: "Tools specific to facility operations.",
      content: (
        <div className="space-y-3">
          <ul className="space-y-2 text-sm">
            <li>🗺️ <strong>Facility Map</strong> - Interactive map of all facility zones</li>
            <li>📹 <strong>Security Cameras</strong> - Monitor camera feeds throughout the facility</li>
            <li>🚨 <strong>Emergency Protocols</strong> - Access emergency procedures when needed</li>
            <li>👥 <strong>Personnel Directory</strong> - Staff information and clearance levels</li>
          </ul>
        </div>
      )
    },
    {
      title: "Terminal Basics",
      description: "The command-line interface for advanced control.",
      content: (
        <div className="space-y-3">
          <p className="text-sm">Open Terminal and try these commands:</p>
          <div className="glass-panel p-3 font-mono text-xs space-y-1">
            <div><span className="text-primary">help</span> - List all available commands</div>
            <div><span className="text-primary">status</span> - Check system status</div>
            <div><span className="text-primary">list</span> - List directory contents</div>
            <div><span className="text-primary">clear</span> - Clear the terminal screen</div>
          </div>
        </div>
      )
    },
    {
      title: "System Recovery",
      description: "What to do if something goes wrong.",
      content: (
        <div className="space-y-3">
          <ul className="space-y-2 text-sm">
            <li>🔧 <strong>Safe Mode</strong> - Press F8 during boot for minimal startup</li>
            <li>🛠️ <strong>Recovery Mode</strong> - System repair tools available from boot</li>
            <li>🔄 <strong>Reboot</strong> - Via Start Menu → System options</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            Most issues can be resolved with a simple reboot.
          </p>
        </div>
      )
    },
    {
      title: "You're Ready!",
      description: "You now know the essentials of Urbanshade OS.",
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-lg">Complete Tour Finished!</p>
          <p className="text-sm text-muted-foreground">
            For detailed documentation on all features, check out the docs.
          </p>
        </div>
      ),
      showDocsLink: true
    }
  ];

  const steps = tourType === "short" ? shortSteps : longSteps;
  const currentStepData = tourType && steps && steps[currentStep] ? steps[currentStep] : null;
  const isLastStep = currentStepData && currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem("urbanshade_tour_completed", "true");
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("urbanshade_tour_completed", "true");
    onComplete();
  };

  const handleSelectTour = (type: "short" | "long") => {
    setTourType(type);
    setCurrentStep(0);
  };

  const handleOpenDocs = () => {
    localStorage.setItem("urbanshade_tour_completed", "true");
    onComplete();
    navigate("/docs");
  };

  // Tour selection screen
  if (!tourType) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl glass-panel p-8 relative">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <div className="text-6xl mb-6">🏢</div>
            <h2 className="text-3xl font-bold text-primary mb-3">Welcome to Urbanshade OS</h2>
            <p className="text-muted-foreground">Choose your onboarding experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleSelectTour("short")}
              className="group glass-panel p-6 hover:bg-primary/10 transition-all border-2 border-transparent hover:border-primary"
            >
              <Zap className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Quick Tour</h3>
              <p className="text-sm text-muted-foreground mb-3">4 steps · ~1 minute</p>
              <p className="text-xs text-muted-foreground">
                Get up and running fast with just the essentials.
              </p>
            </button>

            <button
              onClick={() => handleSelectTour("long")}
              className="group glass-panel p-6 hover:bg-primary/10 transition-all border-2 border-transparent hover:border-primary"
            >
              <BookOpen className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Complete Tour</h3>
              <p className="text-sm text-muted-foreground mb-3">7 steps · ~3 minutes</p>
              <p className="text-xs text-muted-foreground">
                Walkthrough of main features. Recommended for new users.
              </p>
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Skip tour and explore on your own
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tour steps
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glass-panel p-8 relative">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-6">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-1 rounded-full transition-colors ${
                idx <= currentStep ? "bg-primary" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        {currentStepData && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-2">{currentStepData.title}</h2>
            <p className="text-sm text-muted-foreground mb-6">{currentStepData.description}</p>
            <div>{currentStepData.content}</div>
            
            {/* Docs link on final step */}
            {currentStepData.showDocsLink && (
              <div className="mt-6">
                <button
                  onClick={handleOpenDocs}
                  className="w-full glass-panel p-4 flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors group"
                >
                  <ExternalLink className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-medium">View Documentation</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="px-4 py-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 border border-border"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length} · {tourType === "short" ? "Quick" : "Complete"} Tour
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/80 text-primary-foreground font-bold transition-colors flex items-center gap-2"
          >
            {isLastStep ? "Finish Tour" : "Next"}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
