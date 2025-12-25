import { useState } from "react";
import { Box, ChevronRight, ChevronDown, Eye, Code, Layers, Search } from "lucide-react";

interface ComponentNode {
  name: string;
  type: 'component' | 'element' | 'provider';
  props?: Record<string, any>;
  children?: ComponentNode[];
  isExpanded?: boolean;
}

const mockComponentTree: ComponentNode = {
  name: 'App',
  type: 'component',
  children: [
    {
      name: 'BrowserRouter',
      type: 'provider',
      children: [
        {
          name: 'QueryClientProvider',
          type: 'provider',
          children: [
            {
              name: 'TooltipProvider',
              type: 'provider',
              children: [
                {
                  name: 'Index',
                  type: 'component',
                  props: { stage: 'desktop' },
                  children: [
                    {
                      name: 'Desktop',
                      type: 'component',
                      props: { windows: 3 },
                      children: [
                        { name: 'Taskbar', type: 'component', props: { pinnedApps: 4 } },
                        { name: 'DesktopSwitcher', type: 'component', props: { desktops: 2 } },
                        { name: 'WindowManager', type: 'component', props: { windows: 3 } },
                        { name: 'StartMenu', type: 'component', props: { open: false } },
                        { name: 'GlobalSearch', type: 'component', props: { open: false } },
                        { name: 'TaskView', type: 'component', props: { open: false } },
                      ]
                    },
                    { name: 'SupabaseConnectivityChecker', type: 'component' },
                    { name: 'ChangelogDialog', type: 'component' },
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    { name: 'Toaster', type: 'component' },
    { name: 'Sonner', type: 'component' },
  ]
};

export const ComponentTab = () => {
  const [tree, setTree] = useState<ComponentNode>(mockComponentTree);
  const [selectedNode, setSelectedNode] = useState<ComponentNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['App', 'BrowserRouter', 'QueryClientProvider', 'TooltipProvider', 'Index', 'Desktop']));

  const toggleNode = (nodeName: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeName)) {
        next.delete(nodeName);
      } else {
        next.add(nodeName);
      }
      return next;
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'component': return 'text-cyan-400';
      case 'provider': return 'text-purple-400';
      default: return 'text-amber-400';
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'component': return 'bg-cyan-500/10 border-cyan-500/30';
      case 'provider': return 'bg-purple-500/10 border-purple-500/30';
      default: return 'bg-amber-500/10 border-amber-500/30';
    }
  };

  const renderNode = (node: ComponentNode, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.name);
    const isSelected = selectedNode?.name === node.name;
    const matchesSearch = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <div key={node.name + depth}>
        <div
          className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition-all ${
            isSelected ? 'bg-cyan-500/20' : 'hover:bg-slate-800/50'
          } ${matchesSearch ? 'ring-1 ring-amber-500/50' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => setSelectedNode(node)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.name);
              }}
              className="p-0.5 hover:bg-white/10 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-slate-400" />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}
          
          <span className={`text-sm font-mono ${getTypeColor(node.type)}`}>
            {'<'}{node.name}
            {node.props && Object.keys(node.props).length > 0 && (
              <span className="text-slate-500"> ...</span>
            )}
            {hasChildren ? '>' : ' />'}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child, i) => renderNode(child, depth + 1))}
            <div
              className="text-sm font-mono text-slate-500 py-0.5"
              style={{ paddingLeft: `${depth * 16 + 24}px` }}
            >
              {'</'}{node.name}{'>'}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Component Inspector</h2>
            <p className="text-xs text-slate-500">React component tree viewer</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search components..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm focus:border-cyan-500/50 focus:outline-none"
        />
      </div>

      <div className="flex gap-4">
        {/* Tree */}
        <div className="flex-1 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 max-h-[400px] overflow-y-auto">
          {renderNode(tree)}
        </div>

        {/* Details panel */}
        {selectedNode && (
          <div className="w-64 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-4">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded border ${getTypeBg(selectedNode.type)}`}>
                <Box className={`w-4 h-4 ${getTypeColor(selectedNode.type)}`} />
              </div>
              <div>
                <h3 className="font-bold text-sm">{selectedNode.name}</h3>
                <p className={`text-xs ${getTypeColor(selectedNode.type)}`}>{selectedNode.type}</p>
              </div>
            </div>

            {selectedNode.props && Object.keys(selectedNode.props).length > 0 && (
              <div>
                <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-2">Props</h4>
                <div className="space-y-1">
                  {Object.entries(selectedNode.props).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-purple-400">{key}:</span>
                      <span className="text-amber-400 font-mono">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedNode.children && (
              <div>
                <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-2">Children</h4>
                <div className="text-xs text-slate-300">
                  {selectedNode.children.length} child component{selectedNode.children.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-slate-400">Component</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="text-slate-400">Provider</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-slate-400">Element</span>
        </div>
      </div>
    </div>
  );
};
