/**
 * HTTP Server IPC Bridge for OBS Widget Integration
 * 
 * This bridge provides communication between the renderer process (settings UI)
 * and the main process HTTP widget server for OBS integration.
 */

import { ipcMain, BrowserWindow } from 'electron';
import { HttpWidgetServer } from '../httpServer';

/**
 * HTTP Server bridge interface for renderer process
 */
export interface HttpServerBridge {
  // Server control methods
  startServer: () => Promise<{ success: boolean; port?: number; error?: string }>;
  stopServer: () => Promise<{ success: boolean; error?: string }>;
  getServerStatus: () => Promise<{
    isRunning: boolean;
    port: number | null;
    widgetUrls: Array<{
      type: string;
      displayName: string;
      url: string;
      description: string;
    }>;
  }>;
  
  // Real-time status updates
  onServerStatusChanged: (callback: (status: {
    isRunning: boolean;
    port: number | null;
    error?: string;
  }) => void) => void;
  
  // Cleanup
  removeAllListeners: () => void;
}

/**
 * Widget URL information for settings display
 */
export interface WidgetUrlInfo {
  type: string;
  displayName: string;
  url: string;
  description: string;
}

/**
 * Server status information
 */
export interface ServerStatus {
  isRunning: boolean;
  port: number | null;
  error?: string;
}

/**
 * Broadcast status change to all renderer processes
 * @param status Server status to broadcast
 */
function broadcastStatusChange(status: ServerStatus) {
  // Send to all open windows
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('httpServer:statusChanged', status);
  });
}

/**
 * Set up HTTP server IPC bridge
 * @param httpWidgetServer The HTTP widget server instance
 */
export function setupHttpServerBridge(httpWidgetServer: HttpWidgetServer) {
  // Handle server start requests
  ipcMain.handle('httpServer:start', async () => {
    try {
      if (httpWidgetServer.isRunning()) {
        return {
          success: true,
          port: httpWidgetServer.getCurrentPort(),
        };
      }
      
      const port = await httpWidgetServer.start();
      
      // Emit status change event
      const status: ServerStatus = {
        isRunning: true,
        port,
      };
      
      // Broadcast to all renderer processes
      broadcastStatusChange(status);
      
      return {
        success: true,
        port,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Emit status change event with error
      const status: ServerStatus = {
        isRunning: false,
        port: null,
        error: errorMessage,
      };
      
      broadcastStatusChange(status);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  });

  // Handle server stop requests
  ipcMain.handle('httpServer:stop', async () => {
    try {
      if (!httpWidgetServer.isRunning()) {
        return { success: true };
      }
      
      await httpWidgetServer.stop();
      
      // Emit status change event
      const status: ServerStatus = {
        isRunning: false,
        port: null,
      };
      
      broadcastStatusChange(status);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  });

  // Handle server status requests
  ipcMain.handle('httpServer:getStatus', async () => {
    const isRunning = httpWidgetServer.isRunning();
    const port = httpWidgetServer.getCurrentPort();
    
    // Generate widget URLs if server is running
    const widgetUrls: WidgetUrlInfo[] = [];
    
    if (isRunning && port) {
      const widgetTypes = [
        { type: 'standings', displayName: 'Standings', description: 'Live race standings and positions' },
        { type: 'trackmap', displayName: 'Track Map', description: 'Interactive track map with car positions' },
        { type: 'weather', displayName: 'Weather', description: 'Current track weather conditions' },
        { type: 'input', displayName: 'Input Trace', description: 'Steering and pedal input visualization' },
        { type: 'relative', displayName: 'Relatives', description: 'Cars relative to your position' },
        { type: 'fastercars', displayName: 'Faster Cars', description: 'Faster cars approaching from behind' },
      ];
      
      for (const widget of widgetTypes) {
        try {
          widgetUrls.push({
            type: widget.type,
            displayName: widget.displayName,
            url: httpWidgetServer.getWidgetUrl(widget.type),
            description: widget.description,
          });
        } catch (error) {
          // Skip widgets that can't generate URLs
          console.warn(`Could not generate URL for widget type: ${widget.type}`, error);
        }
      }
    }
    
    return {
      isRunning,
      port,
      widgetUrls,
    };
  });

}

/**
 * Get current HTTP server status (utility function for main process)
 * @param httpWidgetServer The HTTP widget server instance
 * @returns Current server status
 */
export function getCurrentHttpServerStatus(httpWidgetServer: HttpWidgetServer): ServerStatus {
  return {
    isRunning: httpWidgetServer.isRunning(),
    port: httpWidgetServer.getCurrentPort(),
  };
}