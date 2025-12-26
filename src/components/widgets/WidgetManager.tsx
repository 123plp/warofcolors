import { Plus, Settings, Layout } from 'lucide-react';
import { Widget, WidgetType, WIDGET_CONFIGS, useWidgets } from '@/hooks/useWidgets';
import { WidgetContainer } from './WidgetContainer';
import { ClockWidget } from './ClockWidget';
import { WeatherWidget } from './WeatherWidget';
import { NotesWidget } from './NotesWidget';
import { SystemMonitorWidget } from './SystemMonitorWidget';
import { QuickLinksWidget } from './QuickLinksWidget';
import { AnomalyStatusWidget } from './AnomalyStatusWidget';
import { BreachAlertWidget } from './BreachAlertWidget';
import { SecurityLevelWidget } from './SecurityLevelWidget';
import { PowerGridWidget } from './PowerGridWidget';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface WidgetManagerProps {
  onOpenApp?: (appId: string) => void;
}

export const WidgetManager = ({ onOpenApp }: WidgetManagerProps) => {
  const {
    widgets,
    editMode,
    selectedWidget,
    setSelectedWidget,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    updateWidgetSettings,
    cycleWidgetSize,
    toggleEditMode,
  } = useWidgets();

  const [showAddMenu, setShowAddMenu] = useState(false);

  const renderWidget = (widget: Widget) => {
    const commonProps = { widget };
    
    switch (widget.type) {
      case 'clock':
        return <ClockWidget {...commonProps} />;
      case 'weather':
        return <WeatherWidget {...commonProps} />;
      case 'notes':
        return (
          <NotesWidget 
            {...commonProps} 
            onUpdateSettings={(settings) => updateWidgetSettings(widget.id, settings)} 
          />
        );
      case 'system-monitor':
        return <SystemMonitorWidget {...commonProps} />;
      case 'quick-links':
        return <QuickLinksWidget {...commonProps} onOpenApp={onOpenApp} />;
      case 'anomaly-status':
        return <AnomalyStatusWidget {...commonProps} />;
      case 'breach-alert':
        return <BreachAlertWidget {...commonProps} />;
      case 'security-level':
        return <SecurityLevelWidget {...commonProps} />;
      case 'power-grid':
        return <PowerGridWidget {...commonProps} />;
      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            {widget.type}
          </div>
        );
    }
  };

  const handleAddWidget = (type: WidgetType) => {
    // Find a good position for the new widget
    const existingPositions = widgets.map(w => ({ x: w.x, y: w.y }));
    let x = 100;
    let y = 100;
    
    // Try to find a non-overlapping position
    while (existingPositions.some(p => Math.abs(p.x - x) < 50 && Math.abs(p.y - y) < 50)) {
      x += 50;
      if (x > window.innerWidth - 400) {
        x = 100;
        y += 50;
      }
    }
    
    addWidget(type, x, y);
    setShowAddMenu(false);
  };

  const groupedConfigs = {
    general: WIDGET_CONFIGS.filter(c => c.category === 'general'),
    utility: WIDGET_CONFIGS.filter(c => c.category === 'utility'),
    scp: WIDGET_CONFIGS.filter(c => c.category === 'scp'),
  };

  return (
    <>
      {/* Widget Controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={toggleEditMode}
          className={cn(
            "p-2 rounded-lg backdrop-blur-md transition-all",
            "border shadow-lg",
            editMode 
              ? "bg-primary text-primary-foreground border-primary" 
              : "bg-background/80 text-muted-foreground border-border hover:text-foreground"
          )}
          title={editMode ? "Exit edit mode" : "Edit widgets"}
        >
          <Layout className="w-4 h-4" />
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className={cn(
              "p-2 rounded-lg backdrop-blur-md transition-all",
              "bg-background/80 border border-border shadow-lg",
              "text-muted-foreground hover:text-foreground"
            )}
            title="Add widget"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          {/* Add Widget Menu */}
          {showAddMenu && (
            <div className="absolute top-full right-0 mt-2 w-72 max-h-[70vh] overflow-auto rounded-lg border border-border bg-background/95 backdrop-blur-md shadow-xl p-3">
              <div className="text-sm font-medium mb-3">Add Widget</div>
              
              {Object.entries(groupedConfigs).map(([category, configs]) => (
                <div key={category} className="mb-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    {category === 'scp' ? 'SCP Facility' : category}
                  </div>
                  <div className="grid gap-1">
                    {configs.map(config => (
                      <button
                        key={config.type}
                        onClick={() => handleAddWidget(config.type)}
                        className={cn(
                          "flex items-start gap-3 p-2 rounded-lg",
                          "hover:bg-primary/10 transition-colors",
                          "text-left"
                        )}
                      >
                        <div className="text-lg">
                          {config.icon === 'Clock' && '🕐'}
                          {config.icon === 'CloudRain' && '🌦️'}
                          {config.icon === 'StickyNote' && '📝'}
                          {config.icon === 'Activity' && '📊'}
                          {config.icon === 'Link' && '🔗'}
                          {config.icon === 'Calendar' && '📅'}
                          {config.icon === 'Search' && '🔍'}
                          {config.icon === 'AlertTriangle' && '⚠️'}
                          {config.icon === 'Siren' && '🚨'}
                          {config.icon === 'Shield' && '🛡️'}
                          {config.icon === 'Zap' && '⚡'}
                          {config.icon === 'Users' && '👥'}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{config.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {config.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Widgets */}
      {widgets.map(widget => (
        <WidgetContainer
          key={widget.id}
          widget={widget}
          editMode={editMode}
          isSelected={selectedWidget === widget.id}
          onSelect={() => setSelectedWidget(widget.id)}
          onRemove={() => removeWidget(widget.id)}
          onMove={(x, y) => updateWidgetPosition(widget.id, x, y)}
          onCycleSize={() => cycleWidgetSize(widget.id)}
        >
          {renderWidget(widget)}
        </WidgetContainer>
      ))}

      {/* Edit Mode Overlay hint */}
      {editMode && widgets.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-muted-foreground">
            <Layout className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click the + button to add widgets</p>
          </div>
        </div>
      )}

      {/* Click outside to close add menu */}
      {showAddMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowAddMenu(false)}
        />
      )}
    </>
  );
};
