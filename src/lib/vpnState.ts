// Simple VPN state manager for browser integration
// This allows the browser to check if VPN is connected

type VPNStateListener = (connected: boolean, serverId: string | null) => void;

class VPNStateManager {
  private connected = false;
  private serverId: string | null = null;
  private listeners: VPNStateListener[] = [];

  setConnected(connected: boolean, serverId: string | null = null) {
    this.connected = connected;
    this.serverId = serverId;
    this.notifyListeners();
  }

  isConnected(): boolean {
    return this.connected;
  }

  getServerId(): string | null {
    return this.serverId;
  }

  subscribe(listener: VPNStateListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.connected, this.serverId));
  }
}

export const vpnState = new VPNStateManager();
