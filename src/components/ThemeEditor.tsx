import { useState, useMemo } from "react";
import { 
  Palette, Sun, Moon, Monitor, Sliders, Download, Upload, Copy, Trash2,
  Check, X, Sparkles, Eye, Paintbrush, Type, Zap, Clock
} from "lucide-react";
import { useThemeEngine, FullTheme, THEME_PRESETS } from "@/hooks/useThemeEngine";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const FONT_OPTIONS = [
  { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" },
  { value: "'Inter', sans-serif", label: "Inter" },
  { value: "'SF Pro Display', -apple-system, sans-serif", label: "SF Pro Display" },
  { value: "'Segoe UI', sans-serif", label: "Segoe UI" },
  { value: "'Fira Code', monospace", label: "Fira Code" },
  { value: "'Source Code Pro', monospace", label: "Source Code Pro" },
  { value: "'Roboto Mono', monospace", label: "Roboto Mono" },
  { value: "'Ubuntu', sans-serif", label: "Ubuntu" },
];

interface ThemeCardProps {
  theme: FullTheme;
  isActive: boolean;
  isCustom: boolean;
  onSelect: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
}

const ThemeCard = ({ theme, isActive, isCustom, onSelect, onDuplicate, onDelete, onExport }: ThemeCardProps) => {
  const colors = theme.darkColors;
  
  return (
    <div
      onClick={onSelect}
      className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
        isActive 
          ? "border-primary shadow-lg shadow-primary/20" 
          : "border-border/50 hover:border-primary/50"
      }`}
      style={{
        background: `linear-gradient(135deg, hsl(${colors.card}), hsl(${colors.background}))`
      }}
    >
      {isActive && (
        <div className="absolute top-2 right-2">
          <Check className="w-4 h-4 text-primary" />
        </div>
      )}
      
      {/* Color preview dots */}
      <div className="flex gap-1.5 mb-3">
        <div 
          className="w-4 h-4 rounded-full border border-white/20"
          style={{ background: `hsl(${colors.primary})` }}
        />
        <div 
          className="w-4 h-4 rounded-full border border-white/20"
          style={{ background: `hsl(${colors.accent})` }}
        />
        <div 
          className="w-4 h-4 rounded-full border border-white/20"
          style={{ background: `hsl(${colors.secondary})` }}
        />
        <div 
          className="w-4 h-4 rounded-full border border-white/20"
          style={{ background: `hsl(${colors.muted})` }}
        />
      </div>
      
      <h3 
        className="font-semibold text-sm truncate"
        style={{ color: `hsl(${colors.foreground})` }}
      >
        {theme.name}
      </h3>
      {theme.description && (
        <p 
          className="text-xs truncate mt-0.5"
          style={{ color: `hsl(${colors.mutedForeground})` }}
        >
          {theme.description}
        </p>
      )}
      
      <div className="flex items-center gap-1 mt-2">
        {isCustom && (
          <Badge variant="outline" className="text-[10px] h-5">Custom</Badge>
        )}
        {!isCustom && theme.id.includes("windows") && (
          <Badge variant="outline" className="text-[10px] h-5">Windows</Badge>
        )}
        {!isCustom && theme.id.includes("mac") && (
          <Badge variant="outline" className="text-[10px] h-5">macOS</Badge>
        )}
      </div>
      
      {/* Quick actions */}
      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onDuplicate && (
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="p-1 rounded hover:bg-white/10"
            title="Duplicate"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
        {onExport && (
          <button
            onClick={(e) => { e.stopPropagation(); onExport(); }}
            className="p-1 rounded hover:bg-white/10"
            title="Export"
          >
            <Download className="w-3 h-3" />
          </button>
        )}
        {isCustom && onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 rounded hover:bg-destructive/20 text-destructive"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export const ThemeEditor = () => {
  const {
    currentTheme,
    currentThemeId,
    effectiveMode,
    settings,
    allThemes,
    customThemes,
    presets,
    setTheme,
    updateSettings,
    createTheme,
    deleteTheme,
    exportTheme,
    importTheme,
    duplicateTheme
  } = useThemeEngine();

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");

  const handleImport = () => {
    if (importTheme(importJson)) {
      setImportDialogOpen(false);
      setImportJson("");
    }
  };

  const handleCreateTheme = () => {
    if (!newThemeName.trim()) {
      toast.error("Please enter a theme name");
      return;
    }
    
    const baseTheme = currentTheme;
    createTheme({
      name: newThemeName,
      description: "Custom theme",
      darkColors: { ...baseTheme.darkColors }
    });
    
    setCreateDialogOpen(false);
    setNewThemeName("");
  };

  return (
    <div className="h-full flex flex-col p-4 bg-background">
      <Tabs defaultValue="gallery" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mb-4">
          <TabsTrigger value="gallery" className="gap-1.5">
            <Palette className="w-4 h-4" />
            Theme Gallery
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5">
            <Sliders className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="effects" className="gap-1.5">
            <Sparkles className="w-4 h-4" />
            Effects
          </TabsTrigger>
        </TabsList>

        {/* Theme Gallery */}
        <TabsContent value="gallery" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {/* Mode selector */}
            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                {effectiveMode === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span className="text-sm font-medium">Color Mode</span>
              </div>
              <Select 
                value={settings.mode} 
                onValueChange={(v) => updateSettings({ mode: v as any })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">
                    <span className="flex items-center gap-2">
                      <Moon className="w-3 h-3" /> Dark
                    </span>
                  </SelectItem>
                  <SelectItem value="light">
                    <span className="flex items-center gap-2">
                      <Sun className="w-3 h-3" /> Light
                    </span>
                  </SelectItem>
                  <SelectItem value="auto">
                    <span className="flex items-center gap-2">
                      <Monitor className="w-3 h-3" /> Auto
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.mode === "auto" && (
              <div className="mb-4 p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Auto Mode Schedule</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Light mode starts</Label>
                    <Select 
                      value={settings.autoModeStartHour.toString()}
                      onValueChange={(v) => updateSettings({ autoModeStartHour: parseInt(v) })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Dark mode starts</Label>
                    <Select 
                      value={settings.autoModeEndHour.toString()}
                      onValueChange={(v) => updateSettings({ autoModeEndHour: parseInt(v) })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mb-4">
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Paintbrush className="w-4 h-4" />
                    Create Theme
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Theme</DialogTitle>
                    <DialogDescription>
                      Create a new theme based on "{currentTheme.name}"
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label>Theme Name</Label>
                    <Input
                      value={newThemeName}
                      onChange={(e) => setNewThemeName(e.target.value)}
                      placeholder="My Custom Theme"
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateTheme}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Upload className="w-4 h-4" />
                    Import
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Theme</DialogTitle>
                    <DialogDescription>
                      Paste the JSON theme data below
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    placeholder='{"name": "My Theme", "darkColors": {...}}'
                    className="min-h-[200px] font-mono text-xs"
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleImport}>Import</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Built-in Themes */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Built-in Themes
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {presets.map(theme => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isActive={currentThemeId === theme.id}
                    isCustom={false}
                    onSelect={() => setTheme(theme.id)}
                    onDuplicate={() => duplicateTheme(theme.id)}
                    onExport={() => exportTheme(theme.id)}
                  />
                ))}
              </div>
            </div>

            {/* Custom Themes */}
            {customThemes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  Custom Themes
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {customThemes.map(theme => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      isActive={currentThemeId === theme.id}
                      isCustom={true}
                      onSelect={() => setTheme(theme.id)}
                      onDuplicate={() => duplicateTheme(theme.id)}
                      onDelete={() => deleteTheme(theme.id)}
                      onExport={() => exportTheme(theme.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="flex-1 mt-0">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {/* Fonts */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Type className="w-4 h-4 text-primary" />
                  Typography
                </h3>
                
                <div className="space-y-3 pl-6">
                  <div>
                    <Label className="text-sm">System Font</Label>
                    <Select 
                      value={settings.fontFamily}
                      onValueChange={(v) => updateSettings({ fontFamily: v })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map(font => (
                          <SelectItem key={font.value} value={font.value}>
                            <span style={{ fontFamily: font.value }}>{font.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Monospace Font</Label>
                    <Select 
                      value={settings.monoFontFamily}
                      onValueChange={(v) => updateSettings({ monoFontFamily: v })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.filter(f => f.value.includes("mono")).map(font => (
                          <SelectItem key={font.value} value={font.value}>
                            <span style={{ fontFamily: font.value }}>{font.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Current Theme Preview */}
              <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
                <h4 className="text-sm font-semibold mb-3">Current Theme: {currentTheme.name}</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(currentTheme.darkColors).slice(0, 8).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border border-white/20"
                        style={{ background: `hsl(${value})` }}
                      />
                      <span className="text-xs text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Effects Settings */}
        <TabsContent value="effects" className="flex-1 mt-0">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {/* Acrylic/Blur */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  Acrylic & Blur
                </h3>
                
                <div className="space-y-4 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Acrylic Effect</Label>
                      <p className="text-xs text-muted-foreground">Frosted glass effect on windows</p>
                    </div>
                    <Switch 
                      checked={settings.enableAcrylic}
                      onCheckedChange={(v) => updateSettings({ enableAcrylic: v })}
                    />
                  </div>

                  {settings.enableAcrylic && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Blur Intensity</Label>
                        <span className="text-sm text-muted-foreground">{settings.blurIntensity}px</span>
                      </div>
                      <Slider
                        value={[settings.blurIntensity]}
                        onValueChange={([v]) => updateSettings({ blurIntensity: v })}
                        min={0}
                        max={24}
                        step={2}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Animations */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Animations
                </h3>
                
                <div className="space-y-4 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Animations</Label>
                      <p className="text-xs text-muted-foreground">Window and UI animations</p>
                    </div>
                    <Switch 
                      checked={settings.enableAnimations}
                      onCheckedChange={(v) => updateSettings({ enableAnimations: v })}
                    />
                  </div>

                  {settings.enableAnimations && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Reduce Motion</Label>
                          <p className="text-xs text-muted-foreground">Minimize animations for accessibility</p>
                        </div>
                        <Switch 
                          checked={settings.reduceMotion}
                          onCheckedChange={(v) => updateSettings({ reduceMotion: v })}
                        />
                      </div>

                      <div>
                        <Label>Animation Speed</Label>
                        <Select 
                          value={settings.animationSpeed}
                          onValueChange={(v) => updateSettings({ animationSpeed: v as any })}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="slow">Slow</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="fast">Fast</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Preview */}
              <div className="p-4 rounded-xl border border-border/50 bg-card">
                <h4 className="text-sm font-semibold mb-4">Effects Preview</h4>
                <div className="space-y-3">
                  <div 
                    className="p-4 rounded-lg border transition-all"
                    style={{
                      backdropFilter: settings.enableAcrylic ? `blur(${settings.blurIntensity}px)` : 'none',
                      background: `hsl(var(--glass))`,
                      borderColor: 'hsl(var(--border))'
                    }}
                  >
                    <p className="text-sm">Glass panel with current blur settings</p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className={settings.enableAnimations && !settings.reduceMotion ? "hover:scale-105 transition-transform" : ""}
                  >
                    Hover me for animation
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
