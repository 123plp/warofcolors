import { useState, useEffect } from "react";
import { Globe, Filter, Trash2, RefreshCw, CheckCircle, XCircle, Clock, ArrowDownUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  status: number;
  statusText: string;
  duration: number;
  size: number;
  timestamp: Date;
  type: "fetch" | "xhr" | "supabase";
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
}

const NetworkInspectorTab = () => {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(null);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "error">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "fetch" | "xhr" | "supabase">("all");

  // Simulate some network requests for demo
  useEffect(() => {
    const sampleRequests: NetworkRequest[] = [
      {
        id: "1",
        method: "GET",
        url: "https://api.supabase.co/rest/v1/profiles",
        status: 200,
        statusText: "OK",
        duration: 145,
        size: 2048,
        timestamp: new Date(Date.now() - 5000),
        type: "supabase",
        requestHeaders: { "Authorization": "Bearer ***", "Content-Type": "application/json" },
        responseBody: '{"id": 1, "name": "Admin"}'
      },
      {
        id: "2",
        method: "POST",
        url: "https://api.supabase.co/auth/v1/token",
        status: 200,
        statusText: "OK",
        duration: 320,
        size: 512,
        timestamp: new Date(Date.now() - 10000),
        type: "supabase"
      },
      {
        id: "3",
        method: "GET",
        url: "https://api.example.com/data",
        status: 404,
        statusText: "Not Found",
        duration: 89,
        size: 128,
        timestamp: new Date(Date.now() - 15000),
        type: "fetch"
      },
      {
        id: "4",
        method: "PUT",
        url: "https://api.supabase.co/rest/v1/settings",
        status: 500,
        statusText: "Internal Server Error",
        duration: 1205,
        size: 64,
        timestamp: new Date(Date.now() - 20000),
        type: "supabase"
      }
    ];
    setRequests(sampleRequests);
  }, []);

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-400";
    if (status >= 300 && status < 400) return "text-blue-400";
    if (status >= 400 && status < 500) return "text-yellow-400";
    return "text-red-400";
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-500/20 text-green-400";
      case "POST": return "bg-blue-500/20 text-blue-400";
      case "PUT": return "bg-yellow-500/20 text-yellow-400";
      case "DELETE": return "bg-red-500/20 text-red-400";
      case "PATCH": return "bg-purple-500/20 text-purple-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = filter === "" || req.url.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "success" && req.status < 400) ||
      (statusFilter === "error" && req.status >= 400);
    const matchesType = typeFilter === "all" || req.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const clearRequests = () => {
    setRequests([]);
    setSelectedRequest(null);
  };

  return (
    <div className="flex h-full">
      {/* Request List */}
      <div className="flex-1 flex flex-col border-r border-slate-700">
        {/* Toolbar */}
        <div className="p-3 border-b border-slate-700 space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-amber-400">Network Inspector</h2>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={clearRequests}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Filter by URL..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 h-8 bg-slate-800 border-slate-600"
            />
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-28 h-8 bg-slate-800 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
              <SelectTrigger className="w-28 h-8 bg-slate-800 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fetch">Fetch</SelectItem>
                <SelectItem value="supabase">Supabase</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Request List */}
        <ScrollArea className="flex-1">
          <div className="divide-y divide-slate-800">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No network requests captured</p>
              </div>
            ) : (
              filteredRequests.map(req => (
                <button
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`w-full p-3 text-left hover:bg-slate-800/50 transition-colors ${
                    selectedRequest?.id === req.id ? 'bg-slate-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-mono ${getMethodColor(req.method)}`}>
                      {req.method}
                    </span>
                    <span className={`text-sm font-mono ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                    <span className="text-sm truncate flex-1 text-muted-foreground">
                      {new URL(req.url).pathname}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {req.duration}ms
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{new URL(req.url).hostname}</span>
                    <span>•</span>
                    <span>{formatSize(req.size)}</span>
                    <span>•</span>
                    <span>{req.timestamp.toLocaleTimeString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Request Details */}
      <div className="w-80 flex flex-col">
        {selectedRequest ? (
          <>
            <div className="p-3 border-b border-slate-700">
              <h3 className="font-bold text-sm">Request Details</h3>
            </div>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground mb-1">General</h4>
                  <Card className="p-2 bg-slate-800/50 border-slate-700 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">URL:</span>
                      <span className="font-mono truncate max-w-40">{selectedRequest.url}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method:</span>
                      <span className="font-mono">{selectedRequest.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={getStatusColor(selectedRequest.status)}>
                        {selectedRequest.status} {selectedRequest.statusText}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{selectedRequest.duration}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{formatSize(selectedRequest.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{selectedRequest.type}</span>
                    </div>
                  </Card>
                </div>

                {selectedRequest.requestHeaders && (
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground mb-1">Request Headers</h4>
                    <Card className="p-2 bg-slate-800/50 border-slate-700">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {JSON.stringify(selectedRequest.requestHeaders, null, 2)}
                      </pre>
                    </Card>
                  </div>
                )}

                {selectedRequest.responseBody && (
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground mb-1">Response Body</h4>
                    <Card className="p-2 bg-slate-800/50 border-slate-700">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {selectedRequest.responseBody}
                      </pre>
                    </Card>
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <ArrowDownUp className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Select a request to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkInspectorTab;
