import { useState } from "react";
import { Lock, Terminal as TerminalIcon, User } from "lucide-react";

interface UserSelectionScreenProps {
  onLogin: () => void;
}

export const UserSelectionScreen = ({ onLogin }: UserSelectionScreenProps) => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Get admin user with error handling
  const adminData = localStorage.getItem("urbanshade_admin");
  let admin = null;
  
  try {
    if (adminData) {
      admin = JSON.parse(adminData);
      // Validate required fields
      if (!admin.id || !admin.name || !admin.password) {
        console.error("Invalid admin data structure");
        admin = null;
      }
    }
  } catch (e) {
    console.error("Failed to parse admin data:", e);
    admin = null;
  }

  // Get additional accounts
  const accountsData = localStorage.getItem("urbanshade_accounts");
  let additionalAccounts: any[] = [];
  
  try {
    if (accountsData) {
      additionalAccounts = JSON.parse(accountsData);
    }
  } catch (e) {
    console.error("Failed to parse accounts data:", e);
  }

  // Combine admin and additional accounts
  const users = admin ? [admin, ...additionalAccounts] : additionalAccounts;

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    setPassword("");
    setError("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter password");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const user = users.find(u => u.id === selectedUser);
      if (user && password === user.password) {
        // Store current logged in user
        localStorage.setItem("urbanshade_current_user", JSON.stringify(user));
        onLogin();
      } else {
        setError("Incorrect password");
        setLoading(false);
        setPassword("");
      }
    }, 1000);
  };

  const handleBack = () => {
    setSelectedUser(null);
    setPassword("");
    setError("");
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TerminalIcon className="w-16 h-16 text-primary urbanshade-glow" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-primary">URBANSHADE</h1>
          <p className="text-sm text-muted-foreground font-mono">
            SECURE OPERATING SYSTEM v3.2.1
          </p>
          <div className="mt-4 text-xs text-muted-foreground font-mono">
            [CLASSIFIED FACILITY] • DEPTH: 8,247m • PRESSURE: EXTREME
          </div>
        </div>

        {!selectedUser ? (
          /* User Selection */
          <div className="space-y-4">
            <div className="glass-panel p-6">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Lock className="w-5 h-5" />
                <span className="font-bold text-sm">SELECT USER</span>
              </div>

              <div className="space-y-3">
                {users.length === 0 ? (
                  <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/30 text-center space-y-3">
                    <div className="text-destructive font-bold">SYSTEM ERROR</div>
                    <div className="text-sm text-muted-foreground">
                      No user accounts found. Please reinstall the system.
                    </div>
                    <button
                      onClick={() => {
                        localStorage.removeItem("urbanshade_admin");
                        window.location.reload();
                      }}
                      className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary text-sm hover:bg-primary/30 transition-colors"
                    >
                      REINSTALL SYSTEM
                    </button>
                  </div>
                ) : (
                  users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user.id)}
                      className="w-full p-4 rounded-lg bg-black/40 border border-white/10 hover:border-primary/50 hover:bg-black/60 transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                          <User className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-lg">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.role}</div>
                          <div className="text-xs text-primary mt-1">Clearance Level {user.clearance}</div>
                        </div>
                        <div className="text-2xl text-muted-foreground group-hover:text-primary transition-colors">›</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground font-mono">
              © 2024 Urbanshade Corporation
            </div>
          </div>
        ) : (
          /* Password Input */
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="glass-panel p-6 space-y-6">
              {/* Selected User Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg">{users.find(u => u.id === selectedUser)?.name}</div>
                  <div className="text-sm text-muted-foreground">{users.find(u => u.id === selectedUser)?.role}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-2 font-mono">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-foreground font-mono text-sm focus:border-primary/50 focus:outline-none transition-colors"
                  placeholder="Enter password"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
                  ⚠ ERROR: {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  BACK
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-lg bg-primary/20 border border-primary/30 text-primary font-bold hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "AUTHENTICATING..." : "LOGIN"}
                </button>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground font-mono space-y-1">
              <div>© 2024 Urbanshade Corporation</div>
              <div className="text-destructive">⚠ UNAUTHORIZED ACCESS IS PROHIBITED</div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
