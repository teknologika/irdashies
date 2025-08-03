/**
 * HTTP Widget Server for OBS Integration
 * 
 * This file implements an Express HTTP server that serves individual dashboard widgets
 * as standalone web pages for OBS Browser Source integration.
 */

import * as net from 'net';
import express, { Application, Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import {
  HttpServerConfig,
  WidgetUrlInfo,
  WidgetType,
  HttpWidgetServer,
  DEFAULT_HTTP_SERVER_CONFIG,
  WIDGET_DISPLAY_NAMES,
  WIDGET_DESCRIPTIONS,
  VALID_WIDGET_TYPES,
} from '../types/httpServer';

/**
 * Check if a specific port is available for binding
 * @param port Port number to check
 * @returns Promise that resolves to true if port is available, false if occupied
 */
export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    // Create a test server to check port availability
    const testServer = net.createServer();
    
    // Set up timeout to prevent hanging
    const timeout = setTimeout(() => {
      testServer.close();
      resolve(false);
    }, 1000); // 1 second timeout
    
    testServer.once('error', (err: NodeJS.ErrnoException) => {
      clearTimeout(timeout);
      testServer.close();
      
      // Port is occupied if we get EADDRINUSE error
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        // Other errors (like EACCES for privileged ports) also mean unavailable
        resolve(false);
      }
    });
    
    testServer.once('listening', () => {
      clearTimeout(timeout);
      testServer.close(() => {
        // Port is available
        resolve(true);
      });
    });
    
    // Try to bind to the port on localhost only (security)
    testServer.listen(port, '127.0.0.1');
  });
}

/**
 * Find the first available port starting from the default port
 * @param startPort Starting port to check (default: 58080)
 * @param maxAttempts Maximum number of ports to try (default: 10)
 * @returns Promise that resolves to the first available port number
 * @throws Error if no available port is found within maxAttempts
 */
export async function findAvailablePort(
  startPort: number = DEFAULT_HTTP_SERVER_CONFIG.defaultPort,
  maxAttempts: number = DEFAULT_HTTP_SERVER_CONFIG.maxPortAttempts
): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    
    try {
      const available = await isPortAvailable(port);
      if (available) {
        console.log(`Found available port: ${port}`);
        return port;
      }
      console.log(`Port ${port} is occupied, trying next...`);
    } catch (error) {
      console.warn(`Error checking port ${port}:`, error);
      // Continue to next port on error
    }
  }
  
  throw new Error(
    `No available port found after trying ${maxAttempts} ports starting from ${startPort}`
  );
}

/**
 * Create and configure Express application with basic middleware
 * @returns Configured Express application instance
 */
export function createExpressApp(): Application {
  const app = express();
  
  // Configure JSON parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  
  // Basic error handling middleware
  app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
    console.error('Express server error:', err);
    
    if (res.headersSent) {
      return next(err);
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  });
  
  return app;
}

/**
 * Validate widget type parameter
 * @param type Widget type to validate
 * @returns True if valid widget type, false otherwise
 */
export function isValidWidgetType(type: string): type is WidgetType {
  return VALID_WIDGET_TYPES.includes(type as WidgetType);
}

/**
 * Validate URL parameters for widget requests
 * @param params Object containing URL parameters
 * @returns Validation result with error message if invalid
 */
export function validateWidgetParams(params: Record<string, string>): { valid: boolean; error?: string; type?: WidgetType } {
  const { type } = params;
  
  if (!type) {
    return { valid: false, error: 'Missing required parameter: type' };
  }
  
  if (!isValidWidgetType(type)) {
    return { 
      valid: false, 
      error: `Invalid widget type: ${type}. Valid types are: ${VALID_WIDGET_TYPES.join(', ')}` 
    };
  }
  
  return { valid: true, type };
}

/**
 * Generate error response for invalid widget requests
 * @param error Error message
 * @param statusCode HTTP status code (default: 400)
 * @returns Express response object
 */
export function createWidgetErrorResponse(error: string, statusCode: number = 400) {
  return {
    status: statusCode,
    json: {
      error: 'Invalid widget request',
      message: error,
      validTypes: VALID_WIDGET_TYPES,
      example: 'http://127.0.0.1:58080/widget?type=standings'
    }
  };
}

/**
 * Generate minimal HTML template for widget rendering with transparent background
 * Optimized for OBS Browser Source compatibility
 * @param widgetType The validated widget type
 * @returns HTML string with transparent background and OBS optimizations
 */
export function createWidgetHtmlTemplate(widgetType: WidgetType): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no">
  <title>irdashies ${WIDGET_DISPLAY_NAMES[widgetType]} Widget</title>
  
  <!-- OBS Browser Source optimizations -->
  <meta name="description" content="${WIDGET_DESCRIPTIONS[widgetType]}">
  <meta name="format-detection" content="telephone=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  
  <!-- Enhanced OBS Browser Source compatibility -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="robots" content="noindex, nofollow, nosnippet">
  <meta name="referrer" content="no-referrer">
  <meta name="theme-color" content="transparent">
  <meta name="msapplication-TileColor" content="transparent">
  <meta name="msapplication-navbutton-color" content="transparent">
  
  <!-- Disable browser features that can interfere with streaming -->
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="application-name" content="irdashies ${WIDGET_DISPLAY_NAMES[widgetType]}">
  <meta name="apple-mobile-web-app-title" content="irdashies ${WIDGET_DISPLAY_NAMES[widgetType]}">
  
  <!-- Performance and rendering optimizations -->
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  
  <!-- Prevent unwanted browser behaviors -->
  <meta name="msapplication-tap-highlight" content="no">
  <meta name="apple-touch-fullscreen" content="yes">
  
  <style>
    /* Reset and transparent background for OBS compatibility */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: 100%;
      height: 100%;
      background: transparent !important;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }
    
    /* Root container for widget rendering */
    #widget-root {
      width: 100%;
      height: 100%;
      background: transparent !important;
      position: relative;
    }
    
    /* Ensure all children maintain transparency */
    #widget-root * {
      background-color: transparent;
    }
    
    /* OBS-specific optimizations */
    body {
      /* Disable text selection for streaming */
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      
      /* Disable context menu for cleaner streaming */
      -webkit-context-menu: none;
      
      /* Smooth rendering for streaming */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      
      /* Prevent scrolling in OBS */
      overflow: hidden;
      
      /* Ensure crisp rendering */
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
    
    /* Hide scrollbars completely */
    ::-webkit-scrollbar {
      display: none;
    }
    
    /* Loading state styling */
    .widget-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #ffffff;
      font-size: 14px;
      background: transparent;
    }
    
    /* Error state styling */
    .widget-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #ff6b6b;
      font-size: 12px;
      text-align: center;
      background: transparent;
      padding: 20px;
    }
  </style>
</head>
<body data-widget-type="${widgetType}">
  <!-- Widget container with loading state -->
  <div id="widget-root">
    <div class="widget-loading">
      Loading ${WIDGET_DISPLAY_NAMES[widgetType]}...
    </div>
  </div>
  
  <!-- Widget bundle will be loaded here -->
  <script>
    // Widget configuration
    window.WIDGET_CONFIG = {
      type: '${widgetType}',
      displayName: '${WIDGET_DISPLAY_NAMES[widgetType]}',
      description: '${WIDGET_DESCRIPTIONS[widgetType]}'
    };
  </script>
  
  <!-- Main widget bundle -->
  <script src="/widget.js" defer></script>
</body>
</html>`;
}

/**
 * HTTP Widget Server implementation for OBS integration
 */
export class WidgetHttpServer implements HttpWidgetServer {
  private app: Application;
  private server: Server | null = null;
  private config: HttpServerConfig;

  constructor() {
    this.app = createExpressApp();
    this.config = { ...DEFAULT_HTTP_SERVER_CONFIG };
    this.setupRoutes();
  }

  /**
   * Set up Express routes for widget serving
   */
  private setupRoutes(): void {
    // Basic health check endpoint
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Widget bundle serving endpoint
    this.app.get('/widget.js', (_req, res) => {
      // TODO: In Phase 2, this will serve the actual widget.js bundle
      // For now, return a minimal bundle that shows a "Widget not implemented" message
      const placeholderBundle = `
        console.log('Widget bundle loaded for type:', window.WIDGET_CONFIG?.type);
        
        // Placeholder widget implementation
        document.addEventListener('DOMContentLoaded', function() {
          const root = document.getElementById('widget-root');
          if (root) {
            root.innerHTML = \`
              <div class="widget-loading">
                <div style="color: #ffffff; text-align: center; padding: 20px;">
                  <h3 style="margin: 0 0 10px 0; font-size: 16px;">Widget Ready</h3>
                  <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                    Type: \${window.WIDGET_CONFIG?.displayName || 'Unknown'}
                  </p>
                  <p style="margin: 10px 0 0 0; font-size: 10px; opacity: 0.6;">
                    Widget implementation will be added in Phase 2
                  </p>
                </div>
              </div>
            \`;
          }
        });
      `;
      
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(placeholderBundle);
    });

    // Main widget endpoint with validation
    this.app.get('/widget', (req, res) => {
      const validation = validateWidgetParams(req.query as Record<string, string>);
      
      if (!validation.valid) {
        const errorResponse = createWidgetErrorResponse(validation.error!);
        console.warn(`Invalid widget request: ${validation.error}`);
        return res.status(errorResponse.status).json(errorResponse.json);
      }
      
      // Generate and serve the widget HTML template
      const html = createWidgetHtmlTemplate(validation.type!);
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.send(html);
    });
  }

  /**
   * Start the HTTP server
   * @param port Optional port to use (defaults to finding available port)
   * @returns Promise that resolves to the actual port being used
   */
  async start(port?: number): Promise<number> {
    if (this.config.isRunning) {
      throw new Error('Server is already running');
    }

    try {
      // Use provided port or find available port
      const targetPort = port || await findAvailablePort();
      
      return new Promise((resolve, reject) => {
        // Create HTTP server with localhost binding for security
        this.server = this.app.listen(targetPort, '127.0.0.1', () => {
          this.config.currentPort = targetPort;
          this.config.isRunning = true;
          
          console.log(`Widget HTTP server started on port ${targetPort}`);
          console.log(`Health check: http://127.0.0.1:${targetPort}/health`);
          
          resolve(targetPort);
        });

        // Handle server startup errors
        this.server.on('error', (error: NodeJS.ErrnoException) => {
          console.error('Failed to start widget HTTP server:', error);
          this.config.isRunning = false;
          this.server = null;
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error starting widget HTTP server:', error);
      throw error;
    }
  }

  /**
   * Stop the HTTP server gracefully
   */
  async stop(): Promise<void> {
    if (!this.server || !this.config.isRunning) {
      return;
    }

    return new Promise((resolve, reject) => {
      // Set a timeout to prevent hanging indefinitely
      const shutdownTimeout = setTimeout(() => {
        console.warn('Server shutdown timeout reached, forcing state reset');
        this.config.isRunning = false;
        this.config.currentPort = 0;
        this.server = null;
        resolve();
      }, 5000); // 5 second timeout

      this.server!.close((error) => {
        clearTimeout(shutdownTimeout);
        
        if (error) {
          console.error('Error stopping widget HTTP server:', error);
          
          // Reset state even on error to prevent inconsistent state
          this.config.isRunning = false;
          this.config.currentPort = 0;
          this.server = null;
          
          // In production, we might want to resolve instead of reject
          // to ensure cleanup continues even if server shutdown fails
          if (process.env.NODE_ENV === 'production') {
            console.warn('Continuing with cleanup despite shutdown error');
            resolve();
          } else {
            reject(error);
          }
        } else {
          console.log('Widget HTTP server stopped');
          this.config.isRunning = false;
          this.config.currentPort = 0;
          this.server = null;
          resolve();
        }
      });
    });
  }

  /**
   * Check if server is currently running
   */
  isRunning(): boolean {
    return this.config.isRunning;
  }

  /**
   * Get the current port, null if not running
   */
  getCurrentPort(): number | null {
    return this.config.isRunning ? this.config.currentPort : null;
  }

  /**
   * Generate widget URL for given type
   */
  getWidgetUrl(type: string): string {
    if (!this.config.isRunning) {
      throw new Error('Server is not running');
    }
    
    return `http://127.0.0.1:${this.config.currentPort}/widget?type=${encodeURIComponent(type)}`;
  }
}