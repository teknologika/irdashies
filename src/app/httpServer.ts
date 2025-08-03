/**
 * HTTP Widget Server for OBS Integration
 * 
 * This file implements an Express HTTP server that serves individual dashboard widgets
 * as standalone web pages for OBS Browser Source integration.
 */

import * as net from 'net';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
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
 * Environment detection utilities
 */

/**
 * Check if the application is running in development mode
 * @returns True if running in development mode
 */
export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if the application is running in production mode
 * @returns True if running in production mode
 */
export function isProductionMode(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Get the current environment name
 * @returns Environment name: 'development', 'production', or 'unknown'
 */
export function getEnvironmentName(): 'development' | 'production' | 'unknown' {
  const env = process.env.NODE_ENV;
  if (env === 'development' || env === 'production') {
    return env;
  }
  return 'unknown';
}

/**
 * Check if the application is running from a packaged Electron app
 * @returns True if running from a packaged app
 */
export function isPackagedApp(): boolean {
  // Check if running from an Electron package
  return process.mainModule?.filename.indexOf('app.asar') !== -1 || 
         process.mainModule?.filename.indexOf('resources/app') !== -1;
}

/**
 * Detect development environment with multiple checks
 * @returns True if definitely in development mode
 */
export function isDefinitelyDevelopment(): boolean {
  return isDevelopmentMode() && !isPackagedApp();
}

/**
 * Detect production environment with multiple checks
 * @returns True if definitely in production mode
 */
export function isDefinitelyProduction(): boolean {
  return isProductionMode() || isPackagedApp();
}

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
  
  // Enable trust proxy for accurate IP logging (localhost only, so safe)
  app.set('trust proxy', 'loopback');
  
  // Enhanced error handling middleware with comprehensive logging
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // Use the comprehensive error logging function
    logError(err, 'Express Server Middleware', req, {
      environment: getEnvironmentName(),
      serverTime: new Date().toISOString(),
      errorType: err.constructor.name
    });
    
    if (res.headersSent) {
      return next(err);
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: isDevelopmentMode() ? err.message : 'Something went wrong',
      timestamp: new Date().toISOString()
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
 * Generate HTML error page for invalid widget requests with transparent background
 * @param error Error message
 * @param statusCode HTTP status code (default: 400)
 * @returns HTML error page optimized for OBS Browser Source
 */
export function createWidgetErrorPage(error: string, statusCode: number = 400): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>irdashies Widget Error</title>
  
  <!-- OBS Browser Source compatibility -->
  <meta name="robots" content="noindex, nofollow, nosnippet">
  <meta name="theme-color" content="transparent">
  
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100vh;
      padding: 2rem;
      background: transparent;
      color: #ff6b6b;
      text-align: center;
    }
    
    .error-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #ff6b6b;
    }
    
    .error-message {
      font-size: 1rem;
      margin-bottom: 1.5rem;
      opacity: 0.9;
      line-height: 1.5;
    }
    
    .error-details {
      font-size: 0.875rem;
      opacity: 0.7;
      margin-bottom: 1rem;
    }
    
    .valid-types {
      font-size: 0.75rem;
      opacity: 0.6;
      margin-top: 1rem;
      max-width: 600px;
    }
    
    .example-url {
      font-size: 0.75rem;
      opacity: 0.5;
      margin-top: 0.5rem;
      font-family: monospace;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="error-container" role="alert" aria-label="Widget Error">
    <div class="error-title">Widget Error</div>
    <div class="error-message">${error}</div>
    <div class="error-details">Please check the widget type parameter in your URL.</div>
    <div class="valid-types">
      Valid widget types: ${VALID_WIDGET_TYPES.join(', ')}
    </div>
    <div class="example-url">
      Example: http://127.0.0.1:58080/widget?type=standings
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate JSON error response for API endpoints
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
 * Log levels for HTTP server logging
 */
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * Get the current log level based on environment
 */
function getCurrentLogLevel(): LogLevel {
  const env = getEnvironmentName();
  
  // In development, show more verbose logging
  if (env === 'development') {
    return LogLevel.DEBUG;
  }
  
  // In production, show only important information
  if (env === 'production') {
    return LogLevel.INFO;
  }
  
  // Default to INFO level
  return LogLevel.INFO;
}

/**
 * Check if a log level should be output based on current log level
 */
function shouldLog(level: LogLevel): boolean {
  return level >= getCurrentLogLevel();
}

/**
 * Log with appropriate level and formatting
 */
function logWithLevel(level: LogLevel, message: string, ...args: any[]): void {
  if (!shouldLog(level)) {
    return;
  }
  
  const timestamp = new Date().toISOString();
  const levelName = LogLevel[level];
  const formattedMessage = `[${timestamp}] [${levelName}] ${message}`;
  
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(formattedMessage, ...args);
      break;
    case LogLevel.INFO:
      console.info(formattedMessage, ...args);
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage, ...args);
      break;
    case LogLevel.ERROR:
      console.error(formattedMessage, ...args);
      break;
  }
}

/**
 * Logging helper functions for different levels
 */
const logger = {
  debug: (message: string, ...args: any[]) => logWithLevel(LogLevel.DEBUG, message, ...args),
  info: (message: string, ...args: any[]) => logWithLevel(LogLevel.INFO, message, ...args),
  warn: (message: string, ...args: any[]) => logWithLevel(LogLevel.WARN, message, ...args),
  error: (message: string, ...args: any[]) => logWithLevel(LogLevel.ERROR, message, ...args)
};

/**
 * Log an HTTP request with timestamp and client information
 * @param req Express request object
 * @param requestType Type of request being logged
 * @param details Additional details to include in the log
 */
function logHttpRequest(req: Request, requestType: string, details?: string): void {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const method = req.method;
  const path = req.path;
  
  let logMessage = `${requestType} - ${method} ${path}, Client: ${clientIP}`;
  if (details) {
    logMessage += `, ${details}`;
  }
  
  // Use INFO level for general request logging
  logger.info(logMessage);
}

/**
 * Log an error with comprehensive context information
 * @param error The error object or message
 * @param context Context where the error occurred
 * @param req Optional Express request object for additional context
 * @param additionalInfo Any additional context information
 */
function logError(
  error: Error | string, 
  context: string, 
  req?: Request, 
  additionalInfo?: Record<string, any>
): void {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  // Main error message
  let logMessage = `HTTP Widget Server Error - Context: ${context}, Error: ${errorMessage}`;
  
  // Add request context if available
  if (req) {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    logMessage += `, Request: ${req.method} ${req.path}, Client: ${clientIP}`;
    
    if (Object.keys(req.query).length > 0) {
      logMessage += `, Query: ${JSON.stringify(req.query)}`;
    }
  }
  
  // Add additional context if provided
  if (additionalInfo && Object.keys(additionalInfo).length > 0) {
    const contextEntries = Object.entries(additionalInfo)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');
    logMessage += `, Additional: {${contextEntries}}`;
  }
  
  // Log the error at ERROR level
  logger.error(logMessage);
  
  // In development mode, also log the stack trace at DEBUG level
  if (errorStack && shouldLog(LogLevel.DEBUG)) {
    logger.debug(`Stack trace for ${context}:`, errorStack);
  }
}

/**
 * HTTP Widget Server implementation for OBS integration
 */
export class HttpWidgetServer implements HttpWidgetServer {
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
    this.app.get('/health', (req, res) => {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Log health check requests at DEBUG level (less verbose)
      logger.debug(`Health Check - Client: ${clientIP}`);
      
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Widget bundle serving endpoint - environment-aware
    this.app.get('/widget.js', async (req, res) => {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const referrer = req.headers.referer || 'unknown';
      
      // Log widget bundle requests at INFO level
      logger.info(`Widget Bundle Request - widget.js, Client: ${clientIP}, Referrer: ${referrer}`);
      
      try {
        if (isDefinitelyDevelopment()) {
          // In development: proxy to Vite dev server
          await this.proxyToViteDevServer(req, res, '/widget.js');
          logger.info(`Widget Bundle Served - widget.js (development proxy), Client: ${clientIP}`);
        } else {
          // In production: serve from built dist directory (task 13.3)
          await this.serveFromDistDirectory(req, res, '/widget.js');
          logger.info(`Widget Bundle Served - widget.js (production dist), Client: ${clientIP}`);
        }
      } catch (error) {
        logError(error as Error, 'Widget Bundle Serving - widget.js', req, {
          environment: getEnvironmentName(),
          isDevelopment: isDefinitelyDevelopment(),
          isProduction: isDefinitelyProduction()
        });
        this.serveFallbackBundle(res);
        logger.info(`Widget Bundle Served - widget.js (fallback), Client: ${clientIP}`);
      }
    });

    // Static asset serving with environment detection
    this.app.get('/assets/*', async (req, res) => {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const assetPath = req.path;
      
      // Log asset requests at DEBUG level (less verbose for assets)
      logger.debug(`Asset Request - ${assetPath}, Client: ${clientIP}`);
      
      try {
        if (isDefinitelyDevelopment()) {
          // In development: proxy to Vite dev server
          await this.proxyToViteDevServer(req, res, req.path);
        } else {
          // In production: serve from built dist directory
          await this.serveFromDistDirectory(req, res, req.path);
        }
      } catch (error) {
        logError(error as Error, 'Static Asset Serving', req, {
          assetPath: req.path,
          environment: getEnvironmentName()
        });
        res.status(404).json({ error: 'Asset not found', path: req.path, timestamp: new Date().toISOString() });
      }
    });

    // CSS file serving (for widget.css and any imported CSS)
    this.app.get('*.css', async (req, res) => {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Log CSS requests at DEBUG level
      logger.debug(`CSS Request - ${req.path}, Client: ${clientIP}`);
      
      try {
        if (isDefinitelyDevelopment()) {
          await this.proxyToViteDevServer(req, res, req.path);
        } else {
          await this.serveFromDistDirectory(req, res, req.path);
        }
      } catch (error) {
        logError(error as Error, 'CSS File Serving', req, {
          cssPath: req.path,
          environment: getEnvironmentName()
        });
        res.status(404).json({ error: 'CSS file not found', path: req.path, timestamp: new Date().toISOString() });
      }
    });

    // Additional asset patterns that might be needed
    this.app.get('/fonts/*', async (req, res) => {
      try {
        if (isDefinitelyDevelopment()) {
          await this.proxyToViteDevServer(req, res, req.path);
        } else {
          await this.serveFromDistDirectory(req, res, req.path);
        }
      } catch (error) {
        console.error(`Error serving font ${req.path}:`, error);
        res.status(404).json({ error: 'Font not found' });
      }
    });

    // Images and media files
    this.app.get('/images/*', async (req, res) => {
      try {
        if (isDefinitelyDevelopment()) {
          await this.proxyToViteDevServer(req, res, req.path);
        } else {
          await this.serveFromDistDirectory(req, res, req.path);
        }
      } catch (error) {
        console.error(`Error serving image ${req.path}:`, error);
        res.status(404).json({ error: 'Image not found' });
      }
    });

    // Generic static file serving for any other assets
    // This should be last to catch anything not handled by specific routes above
    this.app.get(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico|webp|avif)$/, async (req, res) => {
      try {
        if (isDefinitelyDevelopment()) {
          await this.proxyToViteDevServer(req, res, req.path);
        } else {
          await this.serveFromDistDirectory(req, res, req.path);
        }
      } catch (error) {
        console.error(`Error serving static file ${req.path}:`, error);
        res.status(404).json({ error: 'Static file not found' });
      }
    });

    // Main widget endpoint with validation
    this.app.get('/widget', (req, res) => {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      // Log all widget requests at INFO level (important for monitoring)
      logger.info(`Widget Request - Client: ${clientIP}, User-Agent: ${userAgent.substring(0, 100)}`);
      
      const validation = validateWidgetParams(req.query as Record<string, string>);
      
      if (!validation.valid) {
        // Log invalid requests at WARN level
        logger.warn(`Invalid Widget Request - Error: ${validation.error}, Query: ${JSON.stringify(req.query)}, Client: ${clientIP}`);
        const errorHtml = createWidgetErrorPage(validation.error!, 400);
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        return res.status(400).send(errorHtml);
      }
      
      // Log successful widget requests with type information at INFO level
      const widgetType = validation.type!;
      const displayName = WIDGET_DISPLAY_NAMES[widgetType];
      logger.info(`Widget Served - Type: ${widgetType} (${displayName}), Client: ${clientIP}`);
      
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
          
          // Enhanced server start logging with detailed information
          const timestamp = new Date().toISOString();
          const environment = getEnvironmentName();
          const isDev = isDefinitelyDevelopment();
          const isProd = isDefinitelyProduction();
          
          console.log('='.repeat(60));
          console.log(`[${timestamp}] HTTP Widget Server Started Successfully`);
          console.log('='.repeat(60));
          console.log(`Server Details:`);
          console.log(`  • Port: ${targetPort}`);
          console.log(`  • Host: 127.0.0.1 (localhost only)`);
          console.log(`  • Environment: ${environment}`);
          console.log(`  • Development Mode: ${isDev}`);
          console.log(`  • Production Mode: ${isProd}`);
          console.log(`  • Asset Serving: ${isDev ? 'Vite dev server proxy' : 'Built dist directory'}`);
          console.log(`Health & Status:`);
          console.log(`  • Health Check: http://127.0.0.1:${targetPort}/health`);
          console.log(`  • Server Status: Running`);
          console.log(`Widget Endpoints:`);
          console.log(`  • Base URL: http://127.0.0.1:${targetPort}/widget`);
          console.log(`  • Standings: http://127.0.0.1:${targetPort}/widget?type=standings`);
          console.log(`  • Track Map: http://127.0.0.1:${targetPort}/widget?type=trackmap`);
          console.log(`  • Weather: http://127.0.0.1:${targetPort}/widget?type=weather`);
          console.log(`  • Input Trace: http://127.0.0.1:${targetPort}/widget?type=input`);
          console.log(`  • Relatives: http://127.0.0.1:${targetPort}/widget?type=relative`);
          console.log(`  • Faster Cars: http://127.0.0.1:${targetPort}/widget?type=fastercars`);
          console.log(`Usage Instructions:`);
          console.log(`  • Copy widget URLs into OBS Browser Source`);
          console.log(`  • Widgets have transparent backgrounds for overlay use`);
          console.log(`  • Widgets display real-time iRacing data`);
          console.log('='.repeat(60));
          
          resolve(targetPort);
        });

        // Handle server startup errors
        this.server.on('error', (error: NodeJS.ErrnoException) => {
          const timestamp = new Date().toISOString();
          
          console.log('='.repeat(60));
          console.error(`[${timestamp}] HTTP Widget Server Startup Failed`);
          console.log('='.repeat(60));
          console.error(`Error Details:`);
          console.error(`  • Attempted Port: ${targetPort}`);
          console.error(`  • Host: 127.0.0.1 (localhost only)`);
          console.error(`  • Error Code: ${error.code || 'Unknown'}`);
          console.error(`  • Error Message: ${error.message}`);
          console.error(`  • Server Status: Failed to start`);
          
          if (error.code === 'EADDRINUSE') {
            console.error(`Port Conflict:`);
            console.error(`  • Port ${targetPort} is already in use`);
            console.error(`  • Another application may be using this port`);
            console.error(`  • Server will try the next available port`);
          } else if (error.code === 'EACCES') {
            console.error(`Permission Error:`);
            console.error(`  • Access denied to port ${targetPort}`);
            console.error(`  • Try running with appropriate permissions`);
          }
          
          console.log('='.repeat(60));
          
          this.config.isRunning = false;
          this.server = null;
          reject(error);
        });
      });
    } catch (error) {
      logError(error as Error, 'HTTP Widget Server Startup', undefined, {
        environment: getEnvironmentName(),
        requestedPort: port,
        serverState: this.config.isRunning ? 'running' : 'stopped'
      });
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
          logError(error, 'HTTP Widget Server Shutdown', undefined, {
            environment: getEnvironmentName(),
            previousPort: this.config.currentPort,
            serverState: this.config.isRunning ? 'running' : 'stopped',
            shutdownType: 'forced'
          });
          
          // Reset state even on error to prevent inconsistent state
          this.config.isRunning = false;
          this.config.currentPort = 0;
          this.server = null;
          
          // In production, we might want to resolve instead of reject
          // to ensure cleanup continues even if server shutdown fails
          if (isProductionMode()) {
            console.warn('Continuing with cleanup despite shutdown error');
            resolve();
          } else {
            reject(error);
          }
        } else {
          // Enhanced server stop logging with detailed information
          const timestamp = new Date().toISOString();
          const stopPort = this.config.currentPort;
          
          console.log('='.repeat(60));
          console.log(`[${timestamp}] HTTP Widget Server Stopped Successfully`);
          console.log('='.repeat(60));
          console.log(`Shutdown Details:`);
          console.log(`  • Previous Port: ${stopPort}`);
          console.log(`  • Host: 127.0.0.1 (localhost only)`);
          console.log(`  • Shutdown Type: Graceful`);
          console.log(`  • Server Status: Stopped`);
          console.log(`Widget Endpoints:`);
          console.log(`  • All widget URLs are now unavailable`);
          console.log(`  • OBS Browser Sources will show connection errors`);
          console.log(`Recovery:`);
          console.log(`  • Restart irdashies to re-enable widget server`);
          console.log(`  • Widget URLs will be available after restart`);
          console.log('='.repeat(60));
          
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

  /**
   * Normalize and resolve asset paths for consistent handling
   * @param requestPath The path from the HTTP request
   * @returns Normalized path for asset resolution
   */
  private normalizeAssetPath(requestPath: string): string {
    // Remove leading slash if present
    let normalizedPath = requestPath.startsWith('/') ? requestPath.slice(1) : requestPath;
    
    // Handle URL-encoded paths
    normalizedPath = decodeURIComponent(normalizedPath);
    
    // Normalize path separators and remove any '..' or '.' segments for security
    normalizedPath = path.normalize(normalizedPath);
    
    // Ensure we're not escaping the intended directory
    if (normalizedPath.includes('..')) {
      console.warn(`Blocked path traversal attempt: ${requestPath}`);
      throw new Error('Invalid path');
    }
    
    return normalizedPath;
  }

  /**
   * Resolve asset path for production serving
   * @param assetPath Normalized asset path
   * @param distPath Base distribution directory path
   * @returns Full file system path to asset
   */
  private resolveProductionAssetPath(assetPath: string, distPath: string): string {
    console.log(`Resolving asset path: ${assetPath} in dist: ${distPath}`);
    
    // For assets, they are typically in the assets/ subdirectory in production
    if (assetPath.startsWith('assets/')) {
      const resolvedPath = path.join(distPath, assetPath);
      console.log(`Assets path resolved to: ${resolvedPath}`);
      return resolvedPath;
    }
    
    // For root-level files like widget.js
    if (assetPath === 'widget.js') {
      const resolvedPath = path.join(distPath, 'widget.js');
      console.log(`Widget.js resolved to: ${resolvedPath}`);
      return resolvedPath;
    }
    
    // For CSS files that might be in assets or root
    if (assetPath.endsWith('.css')) {
      // First try in assets directory
      const assetsPath = path.join(distPath, 'assets', path.basename(assetPath));
      console.log(`Checking CSS in assets: ${assetsPath}`);
      if (fs.existsSync(assetsPath)) {
        console.log(`CSS found in assets: ${assetsPath}`);
        return assetsPath;
      }
      // Fallback to root level
      const rootPath = path.join(distPath, assetPath);
      console.log(`CSS fallback to root: ${rootPath}`);
      return rootPath;
    }
    
    // For other files, try assets directory first, then root
    const assetsPath = path.join(distPath, 'assets', assetPath);
    console.log(`Checking asset in assets directory: ${assetsPath}`);
    if (fs.existsSync(assetsPath)) {
      console.log(`Asset found in assets: ${assetsPath}`);
      return assetsPath;
    }
    
    // Fallback to root level
    const rootPath = path.join(distPath, assetPath);
    console.log(`Asset fallback to root: ${rootPath}`);
    return rootPath;
  }

  /**
   * Detect Vite dev server port from environment or try common ports
   * @returns Promise resolving to the detected port or null if not found
   */
  private async detectViteDevServerPort(): Promise<number | null> {
    // Try environment variable first
    if (process.env.VITE_DEV_SERVER_PORT) {
      const port = parseInt(process.env.VITE_DEV_SERVER_PORT, 10);
      if (!isNaN(port)) {
        return port;
      }
    }
    
    // Try common Vite dev server ports
    const commonPorts = [5173, 3000, 8080, 8081, 8082];
    
    for (const port of commonPorts) {
      try {
        const isAvailable = await this.testViteDevServerConnection(port);
        if (isAvailable) {
          console.log(`Detected Vite dev server on port ${port}`);
          return port;
        }
      } catch (error) {
        // Port not available, continue trying
      }
    }
    
    return null;
  }

  /**
   * Test if Vite dev server is running on a specific port
   * @param port Port to test
   * @returns Promise resolving to true if server responds
   */
  private async testViteDevServerConnection(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const testRequest = http.request(`http://127.0.0.1:${port}/`, {
        method: 'HEAD',
        timeout: 2000,
      }, (res) => {
        // Any response indicates server is running
        resolve(res.statusCode !== undefined);
      });
      
      testRequest.on('error', () => {
        resolve(false);
      });
      
      testRequest.on('timeout', () => {
        testRequest.destroy();
        resolve(false);
      });
      
      testRequest.end();
    });
  }

  /**
   * Proxy request to Vite dev server in development mode
   * @param req Express request object
   * @param res Express response object
   * @param targetPath Path to proxy to on dev server
   */
  private async proxyToViteDevServer(req: Request, res: Response, targetPath: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Detect Vite dev server port
        const viteDevServerPort = await this.detectViteDevServerPort();
        
        if (!viteDevServerPort) {
          console.log('No Vite dev server detected, serving fallback bundle');
          if (targetPath === '/widget.js') {
            this.serveFallbackBundle(res);
            resolve();
            return;
          } else {
            reject(new Error('Vite dev server not available'));
            return;
          }
        }
        
        const viteUrl = `http://127.0.0.1:${viteDevServerPort}${targetPath}`;
        console.log(`Proxying ${targetPath} to Vite dev server: ${viteUrl}`);
        
        const proxyRequest = http.request(viteUrl, {
          method: req.method,
          headers: {
            ...req.headers,
            // Remove host header to prevent issues
            host: `127.0.0.1:${viteDevServerPort}`,
            // Forward original headers that Vite might need
            'user-agent': req.headers['user-agent'] || 'irdashies-widget-server',
            'accept': req.headers['accept'] || '*/*',
            'accept-encoding': req.headers['accept-encoding'] || 'gzip, deflate',
          },
        }, (proxyResponse) => {
          // Forward response status and headers
          res.status(proxyResponse.statusCode || 200);
          
          // Forward important headers
          const headersToForward = [
            'content-type',
            'content-length', 
            'content-encoding',
            'cache-control',
            'etag',
            'last-modified'
          ];
          
          headersToForward.forEach(headerName => {
            const headerValue = proxyResponse.headers[headerName];
            if (headerValue) {
              res.setHeader(headerName, headerValue);
            }
          });
          
          // Override cache headers for development
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          
          // Pipe response data
          proxyResponse.pipe(res);
          
          proxyResponse.on('end', () => {
            console.log(`Successfully proxied ${targetPath} from Vite dev server`);
            resolve();
          });
        });
        
        proxyRequest.on('error', (error) => {
          logError(error, 'Vite Dev Server Proxy', req, {
            targetPath,
            viteDevServerPort,
            viteUrl,
            environment: 'development'
          });
          
          // If Vite dev server is not available, try fallback
          if (targetPath === '/widget.js') {
            console.log('Vite dev server not available, serving fallback bundle');
            this.serveFallbackBundle(res);
            resolve();
          } else {
            reject(error);
          }
        });
        
        // Handle request timeout
        proxyRequest.setTimeout(10000, () => {
          console.warn(`Timeout proxying ${targetPath} to Vite dev server`);
          proxyRequest.destroy();
          reject(new Error('Proxy request timeout'));
        });
        
        // Forward request body if present
        if (req.body) {
          proxyRequest.write(req.body);
        }
        
        proxyRequest.end();
      } catch (error) {
        console.error(`Error in proxyToViteDevServer:`, error);
        reject(error);
      }
    });
  }

  /**
   * Get the correct dist directory path based on environment and packaging
   * @returns Promise resolving to the dist directory path or null if not found
   */
  private async getDistDirectoryPath(): Promise<string | null> {
    const isPackaged = isPackagedApp();
    const possiblePaths: string[] = [];
    
    if (isPackaged) {
      // In packaged Electron app, try various possible locations
      possiblePaths.push(
        path.join(process.resourcesPath, 'app', 'dist'),
        path.join(process.resourcesPath, 'dist'),
        path.join(process.resourcesPath, 'app.asar.unpacked', 'dist')
      );
    } else {
      // In development or local production testing
      possiblePaths.push(
        path.join(process.cwd(), 'dist'), // Standard dist location
        path.join(process.cwd(), '.vite', 'renderer', 'main_window'), // Electron Forge build location
        path.join(process.cwd(), 'out', 'main_window') // Alternative build location
      );
    }
    
    // Test each possible path
    for (const testPath of possiblePaths) {
      try {
        await fs.promises.access(testPath, fs.constants.F_OK);
        console.log(`Found dist directory at: ${testPath}`);
        return testPath;
      } catch (error) {
        // Path doesn't exist, continue testing
      }
    }
    
    console.warn('No dist directory found in any expected location');
    return null;
  }

  /**
   * Serve files from built dist directory in production mode
   * @param req Express request object
   * @param res Express response object
   * @param targetPath Path to serve from dist directory
   */
  private async serveFromDistDirectory(req: Request, res: Response, targetPath: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Get the correct dist directory path
        const distPath = await this.getDistDirectoryPath();
        
        if (!distPath) {
          console.error('Dist directory not found, serving fallback');
          if (targetPath === '/widget.js') {
            this.serveFallbackBundle(res);
            resolve();
            return;
          } else {
            res.status(404).json({ error: 'Dist directory not found' });
            reject(new Error('Dist directory not found'));
            return;
          }
        }
        
        // Normalize the asset path for consistent handling
        const normalizedAssetPath = this.normalizeAssetPath(targetPath);
        
        // Resolve the full file system path using improved resolution logic
        const filePath = this.resolveProductionAssetPath(normalizedAssetPath, distPath);
        const normalizedPath = path.normalize(filePath);
        
        // Security check: ensure the file is within the dist directory
        if (!normalizedPath.startsWith(path.normalize(distPath))) {
          console.warn(`Blocked attempt to access file outside dist directory: ${targetPath}`);
          res.status(403).json({ error: 'Forbidden' });
          reject(new Error('Path traversal attempt'));
          return;
        }
        
        console.log(`Serving ${targetPath} from dist directory: ${normalizedPath}`);
        
        // Check if file exists
        try {
          await fs.promises.access(normalizedPath, fs.constants.F_OK);
        } catch (err) {
          console.error(`File not found in dist directory: ${normalizedPath}`);
          
          // For widget.js specifically, serve fallback
          if (targetPath === '/widget.js') {
            console.log('widget.js not found in dist, serving fallback bundle');
            this.serveFallbackBundle(res);
            resolve();
            return;
          }
          
          res.status(404).json({ error: 'File not found' });
          reject(new Error(`File not found: ${targetPath}`));
          return;
        }
        
        // Determine content type based on file extension
        const ext = path.extname(targetPath).toLowerCase();
        const contentTypeMap: Record<string, string> = {
          '.js': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.html': 'text/html; charset=utf-8',
          '.json': 'application/json; charset=utf-8',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.woff': 'font/woff',
          '.woff2': 'font/woff2',
          '.ttf': 'font/ttf',
          '.eot': 'application/vnd.ms-fontobject',
          '.ico': 'image/x-icon',
          '.webp': 'image/webp',
          '.avif': 'image/avif',
        };
        
        const contentType = contentTypeMap[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        
        // Set appropriate cache headers
        if (isProductionMode()) {
          // Cache static assets for a reasonable time in production
          if (ext === '.js' || ext === '.css') {
            // Cache JS/CSS for longer since they have hashes in their names
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
            res.setHeader('ETag', `"${Date.now()}"`);
          } else if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.svg') {
            // Cache images for moderate time
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
          } else {
            // Default cache for other assets
            res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
          }
        } else {
          // No cache in development/testing
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
        
        // Get file stats for additional headers
        const stats = await fs.promises.stat(normalizedPath);
        res.setHeader('Last-Modified', stats.mtime.toUTCString());
        res.setHeader('Content-Length', stats.size.toString());
        
        // Stream the file
        const readStream = fs.createReadStream(normalizedPath);
        
        readStream.on('error', (streamError) => {
          logError(streamError, 'File Stream Reading', req, {
            filePath: normalizedPath,
            environment: getEnvironmentName(),
            distPath,
            fileExists: true // We already checked it exists
          });
          if (!res.headersSent) {
            res.status(500).json({ error: 'Error reading file', timestamp: new Date().toISOString() });
          }
          reject(streamError);
        });
        
        readStream.on('end', () => {
          console.log(`Successfully served ${targetPath} from dist directory`);
          resolve();
        });
        
        // Handle client disconnection
        req.on('close', () => {
          readStream.destroy();
        });
        
        readStream.pipe(res);
      } catch (error) {
        logError(error as Error, 'Distribution Directory Serving', req, {
          targetPath,
          environment: getEnvironmentName(),
          distPath: await this.getDistDirectoryPath(),
          isPackaged: isPackagedApp()
        });
        reject(error);
      }
    });
  }

  /**
   * Serve fallback bundle when Vite dev server or dist files are not available
   * @param res Express response object
   */
  private serveFallbackBundle(res: Response): void {
    const environment = getEnvironmentName();
    const fallbackBundle = `
      console.log('Fallback widget bundle loaded (${environment} mode)');
      console.log('Widget bundle loaded for type:', window.WIDGET_CONFIG?.type);
      
      // Fallback widget implementation
      document.addEventListener('DOMContentLoaded', function() {
        const root = document.getElementById('widget-root');
        if (root) {
          root.innerHTML = \`
            <div class="widget-loading">
              <div style="color: #ffffff; text-align: center; padding: 20px;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px;">Widget Ready (Fallback)</h3>
                <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                  Type: \${window.WIDGET_CONFIG?.displayName || 'Unknown'}
                </p>
                <p style="margin: 10px 0 0 0; font-size: 10px; opacity: 0.6;">
                  Environment: ${environment}
                </p>
                <p style="margin: 5px 0 0 0; font-size: 10px; opacity: 0.6;">
                  Widget implementation will be added in Phase 2
                </p>
              </div>
            </div>
          \`;
        }
      });
    `;
    
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(fallbackBundle);
  }
}

// Default export for easy importing in main process
export default HttpWidgetServer;

// Named export for convenience and tests
export { HttpWidgetServer as WidgetServer };
export { HttpWidgetServer as WidgetHttpServer };