import { useState, useEffect } from 'react';

interface WidgetUrlInfo {
  type: string;
  displayName: string;
  url: string;
  description: string;
}

interface ServerStatus {
  isRunning: boolean;
  port: number | null;
  widgetUrls: WidgetUrlInfo[];
  error?: string;
}

export const OBSIntegrationSettings = () => {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    isRunning: false,
    port: null,
    widgetUrls: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Load initial server status
  useEffect(() => {
    const loadServerStatus = async () => {
      try {
        const status = await window.httpServerBridge.getServerStatus();
        setServerStatus(status);
      } catch (error) {
        console.error('Failed to load server status:', error);
        setServerStatus({
          isRunning: false,
          port: null,
          widgetUrls: [],
          error: 'Failed to load server status',
        });
      }
    };

    loadServerStatus();

    // Listen for real-time status updates
    const handleStatusUpdate = (status: { isRunning: boolean; port: number | null; error?: string }) => {
      setServerStatus(prev => ({
        ...prev,
        isRunning: status.isRunning,
        port: status.port,
        error: status.error,
        // Keep existing widget URLs if server is still running
        widgetUrls: status.isRunning ? prev.widgetUrls : [],
      }));
    };

    window.httpServerBridge.onServerStatusChanged(handleStatusUpdate);

    return () => {
      window.httpServerBridge.removeAllListeners();
    };
  }, []);

  const handleServerToggle = async () => {
    setIsLoading(true);
    try {
      if (serverStatus.isRunning) {
        const result = await window.httpServerBridge.stopServer();
        if (result.success) {
          setServerStatus(prev => ({
            ...prev,
            isRunning: false,
            port: null,
            widgetUrls: [],
            error: undefined,
          }));
        } else {
          setServerStatus(prev => ({
            ...prev,
            error: result.error || 'Failed to stop server',
          }));
        }
      } else {
        const result = await window.httpServerBridge.startServer();
        if (result.success && result.port) {
          // Refresh status to get widget URLs
          const status = await window.httpServerBridge.getServerStatus();
          setServerStatus(status);
        } else {
          setServerStatus(prev => ({
            ...prev,
            error: result.error || 'Failed to start server',
          }));
        }
      }
    } catch (error) {
      setServerStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (url: string, widgetName: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyFeedback(`Copied ${widgetName} URL!`);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (error) {
      setCopyFeedback('Failed to copy to clipboard');
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h2 className="text-xl mb-4">OBS Integration</h2>
        <p className="text-slate-400 mb-4">
          Enable HTTP server to use irdashies widgets as OBS Browser Sources in your streaming overlays.
        </p>
      </div>

      {/* Server Status and Control */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-slate-200">Server Status</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  serverStatus.isRunning ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm text-slate-300">
                {serverStatus.isRunning
                  ? `Running on port ${serverStatus.port}`
                  : 'Stopped'
                }
              </span>
            </div>
            <button
              onClick={handleServerToggle}
              disabled={isLoading}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                isLoading
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : serverStatus.isRunning
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLoading
                ? 'Loading...'
                : serverStatus.isRunning
                ? 'Stop Server'
                : 'Start Server'
              }
            </button>
          </div>
        </div>

        {/* Error Display */}
        {serverStatus.error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
            <p className="text-red-400 text-sm">{serverStatus.error}</p>
          </div>
        )}
      </div>

      {/* Widget URLs Section */}
      {serverStatus.isRunning && serverStatus.widgetUrls.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">Widget URLs</h3>
            <p className="text-slate-400 text-sm mb-4">
              Copy these URLs to use as Browser Sources in OBS. Each widget displays real-time iRacing data.
            </p>
          </div>

          <div className="space-y-3">
            {serverStatus.widgetUrls.map((widget) => (
              <div
                key={widget.type}
                className="bg-slate-800 border border-slate-700 rounded p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-slate-200 font-medium">{widget.displayName}</h4>
                    <p className="text-slate-400 text-sm">{widget.description}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(widget.url, widget.displayName)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Copy URL
                  </button>
                </div>
                <div className="bg-slate-900 border border-slate-600 rounded p-2 mt-2">
                  <code className="text-slate-300 text-xs break-all">{widget.url}</code>
                </div>
              </div>
            ))}
          </div>

          {/* Copy Feedback */}
          {copyFeedback && (
            <div className="bg-green-900/20 border border-green-500/30 rounded p-3">
              <p className="text-green-400 text-sm">{copyFeedback}</p>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-200">OBS Browser Source Setup</h3>
        <div className="bg-slate-800 border border-slate-700 rounded p-4">
          <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm">
            <li>Start the HTTP server above</li>
            <li>In OBS, add a new Browser Source to your scene</li>
            <li>Copy and paste one of the widget URLs above</li>
            <li>Set Width: 800, Height: 600 (adjust as needed)</li>
            <li>Check "Shutdown source when not visible" for better performance</li>
            <li>Position and resize the widget in your OBS scene</li>
          </ol>
          <p className="text-slate-400 text-xs mt-3">
            Note: Widgets have transparent backgrounds and will overlay perfectly on your stream.
          </p>
        </div>
      </div>
    </div>
  );
};