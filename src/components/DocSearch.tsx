import { useState, useMemo } from "react";
import { Search, X, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface SearchResult {
  title: string;
  description: string;
  section: string;
  link: string;
  keywords: string[];
}

// Searchable documentation content
const DOC_CONTENT: SearchResult[] = [
  // Getting Started
  { title: "First Boot", description: "How to start the system for the first time", section: "Getting Started", link: "/docs/getting-started", keywords: ["boot", "start", "begin", "first", "new"] },
  { title: "Login", description: "Logging into your account", section: "Getting Started", link: "/docs/getting-started", keywords: ["login", "password", "account", "user", "sign in"] },
  { title: "Desktop Overview", description: "Understanding the desktop interface", section: "Getting Started", link: "/docs/getting-started", keywords: ["desktop", "icons", "taskbar", "start menu"] },
  
  // Applications
  { title: "File Explorer", description: "Browse and manage files", section: "Applications", link: "/docs/applications", keywords: ["files", "folders", "explorer", "browse", "navigate"] },
  { title: "Notepad", description: "Text editor for notes and documents", section: "Applications", link: "/docs/applications", keywords: ["notepad", "text", "editor", "write", "notes"] },
  { title: "Terminal", description: "Command line interface", section: "Applications", link: "/docs/terminal", keywords: ["terminal", "command", "shell", "cli", "console"] },
  { title: "Calculator", description: "Mathematical calculations", section: "Applications", link: "/docs/applications", keywords: ["calculator", "math", "numbers", "calculate"] },
  { title: "Settings", description: "System settings and preferences", section: "Applications", link: "/docs/applications", keywords: ["settings", "preferences", "options", "configure"] },
  
  // Terminal
  { title: "Terminal Commands", description: "List of available terminal commands", section: "Terminal Guide", link: "/docs/terminal", keywords: ["commands", "terminal", "help", "ls", "cd", "sudo"] },
  { title: "sudo Commands", description: "Administrative commands", section: "Terminal Guide", link: "/docs/terminal", keywords: ["sudo", "admin", "root", "superuser"] },
  { title: "UUR Commands", description: "UUR package manager commands", section: "Terminal Guide", link: "/docs/terminal", keywords: ["uur", "package", "install", "imp"] },
  
  // Facility
  { title: "Security Cameras", description: "Monitor facility cameras", section: "Facility", link: "/docs/facility", keywords: ["camera", "security", "monitor", "surveillance"] },
  { title: "Containment Monitor", description: "Track containment units", section: "Facility", link: "/docs/facility", keywords: ["containment", "units", "monitor", "status"] },
  { title: "Power Grid", description: "Manage facility power", section: "Facility", link: "/docs/facility", keywords: ["power", "grid", "electricity", "energy"] },
  
  // Advanced
  { title: "BIOS Settings", description: "Configure BIOS settings", section: "Advanced", link: "/docs/advanced", keywords: ["bios", "boot", "settings", "del", "startup"] },
  { title: "Recovery Mode", description: "System recovery options", section: "Advanced", link: "/docs/advanced", keywords: ["recovery", "restore", "backup", "f2"] },
  { title: "Factory Reset", description: "Reset system to defaults", section: "Advanced", link: "/docs/advanced", keywords: ["reset", "factory", "clear", "wipe"] },
  
  // Shortcuts
  { title: "Keyboard Shortcuts", description: "All keyboard shortcuts", section: "Shortcuts", link: "/docs/shortcuts", keywords: ["keyboard", "shortcut", "hotkey", "alt", "ctrl"] },
  { title: "Alt+Tab", description: "Switch between windows", section: "Shortcuts", link: "/docs/shortcuts", keywords: ["alt", "tab", "switch", "window"] },
  { title: "Win+D", description: "Show desktop", section: "Shortcuts", link: "/docs/shortcuts", keywords: ["win", "desktop", "minimize"] },
  
  // Troubleshooting
  { title: "Forgot Password", description: "Password recovery options", section: "Troubleshooting", link: "/docs/troubleshooting", keywords: ["forgot", "password", "reset", "recovery"] },
  { title: "System Errors", description: "Common error fixes", section: "Troubleshooting", link: "/docs/troubleshooting", keywords: ["error", "crash", "bug", "fix"] },
  { title: "Bugcheck", description: "Understanding bugcheck screens", section: "Troubleshooting", link: "/docs/troubleshooting", keywords: ["bugcheck", "crash", "blue screen", "stop"] },
  
  // DEF-DEV
  { title: "DEF-DEV Console", description: "Developer debugging console", section: "DEF-DEV", link: "/docs/def-dev", keywords: ["def-dev", "developer", "debug", "console", "logging"] },
  { title: "Bugcheck System", description: "Understanding bugchecks", section: "DEF-DEV", link: "/docs/def-dev/bugchecks", keywords: ["bugcheck", "error", "crash", "stop code"] },
  { title: "Action Logging", description: "System action monitoring", section: "DEF-DEV", link: "/docs/def-dev/actions", keywords: ["action", "log", "monitor", "track"] },
  
  // UUR
  { title: "UUR Repository", description: "UrbanShade User Repository", section: "UUR", link: "/docs/uur", keywords: ["uur", "repository", "packages", "apps", "install"] },
  { title: "Package Installation", description: "Installing UUR packages", section: "UUR", link: "/docs/uur", keywords: ["install", "package", "uur", "app"] },
  { title: "Custom Lists", description: "Importing custom package lists", section: "UUR", link: "/docs/uur", keywords: ["custom", "list", "import", "github"] },
];

interface DocSearchProps {
  onClose?: () => void;
  embedded?: boolean;
}

export const DocSearch = ({ onClose, embedded = false }: DocSearchProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(embedded);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 0);
    
    return DOC_CONTENT.filter(item => {
      const searchableText = `${item.title} ${item.description} ${item.section} ${item.keywords.join(' ')}`.toLowerCase();
      return searchTerms.every(term => searchableText.includes(term));
    }).slice(0, 8);
  }, [query]);

  if (embedded) {
    return (
      <div className="w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
        
        {results.length > 0 && (
          <div className="mt-2 bg-card border border-border rounded-lg overflow-hidden">
            {results.map((result, idx) => (
              <Link
                key={idx}
                to={result.link}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
              >
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{result.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{result.description}</div>
                </div>
                <span className="text-xs text-muted-foreground">{result.section}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
        
        {query && results.length === 0 && (
          <div className="mt-2 p-4 text-center text-sm text-muted-foreground">
            No results found for "{query}"
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted border border-border rounded-lg text-sm text-muted-foreground transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Search docs...</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs bg-background border border-border rounded">⌘K</kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20" onClick={() => setIsOpen(false)}>
          <div className="w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documentation..."
                className="flex-1 bg-transparent text-lg focus:outline-none"
                autoFocus
              />
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="max-h-96 overflow-auto">
              {results.length > 0 ? (
                results.map((result, idx) => (
                  <Link
                    key={idx}
                    to={result.link}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                  >
                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{result.title}</div>
                      <div className="text-sm text-muted-foreground truncate">{result.description}</div>
                    </div>
                    <span className="text-xs bg-muted px-2 py-1 rounded">{result.section}</span>
                  </Link>
                ))
              ) : query ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No results found for "{query}"</p>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Start typing to search...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
