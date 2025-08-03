/**
 * HTTP Server Configuration and Types for OBS Widget Integration
 * 
 * This file contains TypeScript interfaces for the HTTP server that serves
 * individual dashboard widgets as standalone web pages for OBS Browser Source integration.
 */

/**
 * Configuration for the HTTP widget server
 */
export interface HttpServerConfig {
  /** Default port to attempt binding (58080) */
  defaultPort: number;
  /** Actual port being used by the server */
  currentPort: number;
  /** Whether the server is currently running */
  isRunning: boolean;
  /** Maximum number of port attempts before failing (10) */
  maxPortAttempts: number;
}

/**
 * Information about a widget URL for display in settings
 */
export interface WidgetUrlInfo {
  /** Widget type identifier */
  type: string;
  /** Human-readable display name */
  displayName: string;
  /** Complete URL for the widget */
  url: string;
  /** Description of what the widget displays */
  description: string;
}

/**
 * Valid widget types for URL parameters
 */
export interface WidgetRouteParams {
  /** Widget type from URL query parameter */
  type: 'standings' | 'trackmap' | 'weather' | 'input' | 'relative' | 'fastercars';
}

/**
 * HTTP Widget Server interface for lifecycle management
 */
export interface HttpWidgetServer {
  /** Start the server, returns actual port used */
  start(port?: number): Promise<number>;
  /** Stop the server gracefully */
  stop(): Promise<void>;
  /** Check if server is currently running */
  isRunning(): boolean;
  /** Get the current port, null if not running */
  getCurrentPort(): number | null;
  /** Generate widget URL for given type */
  getWidgetUrl(type: string): string;
}

/**
 * Settings integration interface for OBS controls
 */
export interface OBSIntegrationSettings {
  /** Whether the server is currently running */
  serverRunning: boolean;
  /** Current port being used */
  currentPort: number;
  /** List of available widget URLs */
  widgetUrls: WidgetUrlInfo[];
  /** Copy URL to clipboard function */
  copyUrlToClipboard(url: string): void;
}

/**
 * Valid widget types as a union type
 */
export type WidgetType = WidgetRouteParams['type'];

/**
 * Array of all valid widget types - single source of truth
 */
export const VALID_WIDGET_TYPES: readonly WidgetType[] = Object.freeze([
  'standings',
  'trackmap', 
  'weather',
  'input',
  'relative',
  'fastercars'
] as const);

/**
 * Default configuration values
 */
export const DEFAULT_HTTP_SERVER_CONFIG: Readonly<HttpServerConfig> = {
  defaultPort: 58080,
  currentPort: 0,
  isRunning: false,
  maxPortAttempts: 10,
} as const;

/**
 * Widget type to display name mapping
 */
export const WIDGET_DISPLAY_NAMES: Record<WidgetType, string> = {
  standings: 'Standings',
  trackmap: 'Track Map',
  weather: 'Weather',
  input: 'Input Trace',
  relative: 'Relatives',
  fastercars: 'Faster Cars from Behind',
} as const;

/**
 * Widget type to description mapping
 */
export const WIDGET_DESCRIPTIONS: Record<WidgetType, string> = {
  standings: 'Session standings with position and timing information',
  trackmap: 'Live track map showing car positions and track layout',
  weather: 'Track conditions, temperature, and weather information',
  input: 'Driver input traces for throttle, brake, and steering',
  relative: 'Relative timing gaps to cars ahead and behind',
  fastercars: 'Alerts for faster cars approaching from behind',
} as const;