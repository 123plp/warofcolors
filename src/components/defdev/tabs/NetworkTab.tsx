import { useState, useEffect } from "react";
import { Wifi, Globe, ArrowDown, ArrowUp, Clock, Filter, Trash2, AlertTriangle, Check, X } from "lucide-react";

interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  duration: number;
  size: string;
  timestamp: Date;
  type: 'fetch' | 'xhr' | 'ws';
}

export const NetworkTab = () => {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'fetch' | 'xhr' | 'error'>('all');
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(null);

  // Simulate network requests
  useEffect(() => {
    const endpoints = [
      { url: '/api/status', method: 'GET' },
      { url: '/api/users', method: 'GET' },
      { url: '/api/settings', method: 'POST' },
      { url: 'https://oukxkpihsyikamzldiek.supabase.co/rest/v1/site_status', method: 'GET' },
      { url: 'https://oukxkpihsyikamzldiek.supabase.co/rest/v1/profiles', method: 'GET' },
      { url: '/api/sync', method: 'PUT' },
    ];

    const addRequest = () => {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const isError = Math.random() < 0.1;
      
      const newRequest: NetworkRequest = {
        id: `req-${Date.now()}`,
        url: endpoint.url,
        method: endpoint.method,
        status: isError ? (Math.random() < 0.5 ? 500 : 404) : 200,
        duration: Math.floor(50 + Math.random() * 500),
        size: `${(Math.random() * 50).toFixed(1)} KB`,
        timestamp: new Date(),
        type: Math.random() < 0.8 ? 'fetch' : 'xhr'
      };

      setRequests(prev => [newRequest, ...prev].slice(0, 50));
    };

    // Add initial requests
    for (let i = 0; i < 5; i++) {
      setTimeout(() => addRequest(), i * 200);
    }

    const interval = setInterval(addRequest, 3000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'error') return r.status >= 400;
    return r.type === filter;
  });

  const getStatusColor = (status: number) => {
    if (status >= 500) return 'text-red-400 bg-red-500/10';
    if (status >= 400) return 'text-amber-400 bg-amber-500/10';
    if (status >= 300) return 'text-blue-400 bg-blue-500/10';
    return 'text-green-400 bg-green-500/10';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-cyan-400';
      case 'POST': return 'text-green-400';
      case 'PUT': return 'text-amber-400';
      case 'DELETE': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Network Inspector</h2>
            <p className="text-xs text-slate-500">{requests.length} requests captured</p>
          </div>
        </div>
        <button
          onClick={() => setRequests([])}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'fetch', 'xhr', 'error'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            {f === 'error' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'error' && ` (${requests.filter(r => r.status >= 400).length})`}
          </button>
        ))}
      </div>

      {/* Request list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredRequests.map((req) => (
          <div
            key={req.id}
            onClick={() => setSelectedRequest(selectedRequest?.id === req.id ? null : req)}
            className={`p-3 rounded-xl bg-slate-800/50 border transition-all cursor-pointer ${
              selectedRequest?.id === req.id
                ? 'border-cyan-500/50'
                : 'border-slate-700/50 hover:border-slate-600/50'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Method */}
              <span className={`text-xs font-mono font-bold w-12 ${getMethodColor(req.method)}`}>
                {req.method}
              </span>

              {/* Status */}
              <span className={`px-2 py-0.5 rounded text-xs font-mono ${getStatusColor(req.status)}`}>
                {req.status}
              </span>

              {/* URL */}
              <span className="flex-1 text-sm text-slate-300 truncate font-mono">
                {req.url}
              </span>

              {/* Duration */}
              <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {req.duration}ms
              </span>

              {/* Size */}
              <span className="text-xs text-slate-500 font-mono">
                {req.size}
              </span>
            </div>

            {/* Expanded details */}
            {selectedRequest?.id === req.id && (
              <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2 animate-fade-in">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Type:</span>
                    <span className="ml-2 text-slate-300">{req.type.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Time:</span>
                    <span className="ml-2 text-slate-300">{req.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="text-xs">
                  <span className="text-slate-500">Full URL:</span>
                  <div className="mt-1 p-2 rounded bg-slate-900 font-mono text-cyan-400 break-all">
                    {req.url}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Wifi className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No requests to display</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
          <ArrowDown className="w-4 h-4 mx-auto mb-1 text-green-400" />
          <div className="text-sm font-bold text-green-400">
            {requests.filter(r => r.status < 400).length}
          </div>
          <div className="text-[10px] text-slate-500">Success</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
          <X className="w-4 h-4 mx-auto mb-1 text-red-400" />
          <div className="text-sm font-bold text-red-400">
            {requests.filter(r => r.status >= 400).length}
          </div>
          <div className="text-[10px] text-slate-500">Errors</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
          <Clock className="w-4 h-4 mx-auto mb-1 text-amber-400" />
          <div className="text-sm font-bold text-amber-400">
            {requests.length > 0 ? Math.round(requests.reduce((a, b) => a + b.duration, 0) / requests.length) : 0}ms
          </div>
          <div className="text-[10px] text-slate-500">Avg Time</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
          <ArrowUp className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
          <div className="text-sm font-bold text-cyan-400">
            {requests.length}
          </div>
          <div className="text-[10px] text-slate-500">Total</div>
        </div>
      </div>
    </div>
  );
};
