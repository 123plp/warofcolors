import { useState } from "react";
import { Layers, ChevronRight, ChevronDown, Eye, Code } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface ComponentNode {
  id: string;
  name: string;
  type: "component" | "element";
  props: Record<string, any>;
  children?: ComponentNode[];
  expanded?: boolean;
}

const ComponentInspectorTab = () => {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<ComponentNode | null>(null);
  
  // Simulated component tree (in real implementation, this would use React DevTools API)
  const [componentTree, setComponentTree] = useState<ComponentNode[]>([
    {
      id: "1",
      name: "App",
      type: "component",
      props: {},
      expanded: true,
      children: [
        {
          id: "2",
          name: "Desktop",
          type: "component",
          props: { onLogout: "fn", onReboot: "fn", onShutdown: "fn" },
          expanded: true,
          children: [
            {
              id: "3",
              name: "WindowManager",
              type: "component",
              props: { windows: "Array(3)", onClose: "fn" },
              children: [
                { id: "8", name: "Window", type: "component", props: { title: "Terminal", zIndex: 102 } },
                { id: "9", name: "Window", type: "component", props: { title: "Settings", zIndex: 103 } },
              ]
            },
            {
              id: "4",
              name: "Taskbar",
              type: "component",
              props: { onStartClick: "fn", pinnedApps: "Array(4)" }
            },
            {
              id: "5",
              name: "StartMenu",
              type: "component",
              props: { open: false, apps: "Array(27)" }
            },
            {
              id: "6",
              name: "DesktopSwitcher",
              type: "component",
              props: { desktops: "Array(2)", activeDesktopId: "desktop-1" }
            },
            {
              id: "7",
              name: "NotificationCenter",
              type: "component",
              props: { open: false }
            }
          ]
        }
      ]
    }
  ]);

  const toggleExpand = (nodeId: string) => {
    const updateNode = (nodes: ComponentNode[]): ComponentNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };
    setComponentTree(updateNode(componentTree));
  };

  const renderTree = (nodes: ComponentNode[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <button
          onClick={() => {
            setSelectedComponent(node);
            if (node.children) toggleExpand(node.id);
          }}
          onMouseEnter={() => setHoveredComponent(node.id)}
          onMouseLeave={() => setHoveredComponent(null)}
          className={`w-full flex items-center gap-1 px-2 py-1 text-left hover:bg-slate-800/50 transition-colors ${
            selectedComponent?.id === node.id ? 'bg-slate-800' : ''
          } ${hoveredComponent === node.id ? 'ring-1 ring-amber-500/50' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {node.children ? (
            node.expanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )
          ) : (
            <div className="w-3" />
          )}
          <span className={`font-mono text-sm ${
            node.type === "component" ? "text-cyan-400" : "text-purple-400"
          }`}>
            {node.name}
          </span>
        </button>
        {node.expanded && node.children && renderTree(node.children, depth + 1)}
      </div>
    ));
  };

  return (
    <div className="flex h-full">
      {/* Component Tree */}
      <div className="flex-1 flex flex-col border-r border-slate-700">
        <div className="p-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-amber-400">Component Inspector</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Simulated component tree (React DevTools integration coming soon)
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="py-2">
            {renderTree(componentTree)}
          </div>
        </ScrollArea>
      </div>

      {/* Component Details */}
      <div className="w-80 flex flex-col">
        {selectedComponent ? (
          <>
            <div className="p-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm font-mono">&lt;{selectedComponent.name}&gt;</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {selectedComponent.type}
              </p>
            </div>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-4">
                {/* Props */}
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground mb-2">Props</h4>
                  <Card className="p-3 bg-slate-800/50 border-slate-700">
                    {Object.keys(selectedComponent.props).length === 0 ? (
                      <span className="text-xs text-muted-foreground">No props</span>
                    ) : (
                      <div className="space-y-1">
                        {Object.entries(selectedComponent.props).map(([key, value]) => (
                          <div key={key} className="flex items-start gap-2 text-xs">
                            <span className="text-purple-400 font-mono">{key}:</span>
                            <span className="text-green-400 font-mono">
                              {typeof value === "string" ? `"${value}"` : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>

                {/* Actions */}
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground mb-2">Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        // In a real implementation, this would highlight the component
                        console.log("Highlighting component:", selectedComponent.name);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Highlight in UI
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        console.log("Component:", selectedComponent);
                      }}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Log to Console
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-400">
                    💡 This is a simulated component tree. Full React DevTools integration requires browser extension access.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Select a component to inspect</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentInspectorTab;
