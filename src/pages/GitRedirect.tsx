import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const GitRedirect = () => {
  useEffect(() => {
    window.location.href = 'https://github.com/aswdBatch/urbanshade-OS';
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Redirecting to GitHub...</p>
      </div>
    </div>
  );
};

export default GitRedirect;
