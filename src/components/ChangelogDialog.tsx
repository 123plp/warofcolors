import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";

export const ChangelogDialog = () => {
  const [open, setOpen] = useState(false);
  const currentVersion = "2.0.0";

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem("urbanshade_last_seen_version");
    if (lastSeenVersion !== currentVersion) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("urbanshade_last_seen_version", currentVersion);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            What's New in URBANSHADE OS v{currentVersion}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Major Features */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <Check className="w-5 h-5" />
              Major Features
            </h3>
            <ul className="space-y-2 text-sm ml-7">
              <li className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Enhanced Facility Planner:</strong> Visible room connections, zoom/pan controls, snap-to-grid options, and editable hallways</span>
              </li>
              <li className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Urbanshade Installer:</strong> Professional installation wizard with customizable options</span>
              </li>
              <li className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <span className="text-primary mt-0.5">•</span>
                <span><strong>About System:</strong> View contributors, GitHub repository, and system information</span>
              </li>
              <li className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Working Updates:</strong> System can now check for and install updates</span>
              </li>
            </ul>
          </div>

          {/* OOBE Improvements */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <Check className="w-5 h-5" />
              OOBE Improvements
            </h3>
            <ul className="space-y-2 text-sm ml-7">
              <li className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: "0.5s" }}>
                <span className="text-primary mt-0.5">•</span>
                <span>Extended to 18 steps with more customization options</span>
              </li>
              <li className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: "0.6s" }}>
                <span className="text-primary mt-0.5">•</span>
                <span>Configure OEM unlock, developer options, storage, and security during setup</span>
              </li>
            </ul>
          </div>

          {/* Account & Recovery */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <Check className="w-5 h-5" />
              Account & Recovery
            </h3>
            <ul className="space-y-2 text-sm ml-7">
              <li className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: "0.7s" }}>
                <span className="text-primary mt-0.5">•</span>
                <span>New accounts are now fully functional and usable</span>
              </li>
              <li className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: "0.8s" }}>
                <span className="text-primary mt-0.5">•</span>
                <span>Recovery mode options now perform actual system operations</span>
              </li>
            </ul>
          </div>

          {/* UI/UX Enhancements */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <Check className="w-5 h-5" />
              UI/UX Enhancements
            </h3>
            <ul className="space-y-2 text-sm ml-7">
              <li className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: "0.9s" }}>
                <span className="text-primary mt-0.5">•</span>
                <span>Enhanced animations throughout the system</span>
              </li>
              <li className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: "1s" }}>
                <span className="text-primary mt-0.5">•</span>
                <span>Improved visual feedback and transitions</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              Thank you for using URBANSHADE OS!
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleClose} className="animate-fade-in">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
