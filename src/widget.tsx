/**
 * Widget Entry Point for OBS Integration
 * 
 * This file serves as the entry point for HTTP-served widgets that can be used
 * as OBS Browser Sources. It provides a complete widget runtime environment
 * that reuses all existing components and infrastructure.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  TelemetryProvider,
  DashboardProvider,
  RunningStateProvider,
  SessionProvider,
} from '@irdashies/context';

// Import all widget components using the same paths as the main app
import { Standings } from './frontend/components/Standings/Standings';
import { TrackMap } from './frontend/components/TrackMap/TrackMap';
import { Weather } from './frontend/components/Weather/Weather';
import { Input } from './frontend/components/Input/Input';
import { Relative } from './frontend/components/Standings/Relative';
import { FasterCarsFromBehind } from './frontend/components/FasterCarsFromBehind/FasterCarsFromBehind';

// Import CSS for styling
import './frontend/index.css';
import './widget.css';

/**
 * Widget component mapping for HTTP server types
 * Maps HTTP server widget types to React components
 */
const WIDGET_COMPONENTS = {
  'standings': Standings,
  'trackmap': TrackMap,
  'weather': Weather,
  'input': Input,
  'relative': Relative,
  'fastercars': FasterCarsFromBehind,
} as const;

/**
 * Valid widget type definition matching HTTP server expectations
 */
type WidgetType = keyof typeof WIDGET_COMPONENTS;

/**
 * Widget configuration interface passed from HTML template
 */
interface WidgetConfig {
  type: WidgetType;
  displayName: string;
  description: string;
}

/**
 * Extract widget type from URL search parameters
 * @returns Widget type or null if invalid
 */
function getWidgetTypeFromURL(): WidgetType | null {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type') as WidgetType;
  
  if (type && type in WIDGET_COMPONENTS) {
    return type;
  }
  
  return null;
}

/**
 * Get widget config from global window object or URL
 * @returns Widget configuration
 */
function getWidgetConfig(): WidgetConfig | null {
  // First try to get config from window object (set by HTML template)
  if (typeof window !== 'undefined' && 'WIDGET_CONFIG' in window) {
    const config = (window as any).WIDGET_CONFIG as WidgetConfig;
    if (config && config.type in WIDGET_COMPONENTS) {
      return config;
    }
  }
  
  // Fallback to URL parameter extraction
  const type = getWidgetTypeFromURL();
  if (type) {
    return {
      type,
      displayName: type.charAt(0).toUpperCase() + type.slice(1),
      description: `${type} widget`,
    };
  }
  
  return null;
}

/**
 * Error component for invalid widget types
 */
const WidgetError: React.FC<{ error: string }> = ({ error }) => (
  <div 
    role="alert"
    aria-label="Widget Error"
    aria-describedby="widget-error-message"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1rem',
      backgroundColor: 'transparent',
      color: '#ff6b6b',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center',
    }}
  >
    <div>
      <h2 style={{ margin: '0 0 0.5rem 0' }}>Widget Error</h2>
      <p id="widget-error-message" style={{ margin: 0, opacity: 0.8 }}>{error}</p>
    </div>
  </div>
);

/**
 * Loading component shown while widget initializes
 */
const WidgetLoading: React.FC<{ type: string }> = ({ type }) => (
  <div 
    role="status"
    aria-label={`Loading ${type} widget`}
    aria-describedby="widget-loading-message"
    aria-live="polite"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1rem',
      backgroundColor: 'transparent',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center',
    }}
  >
    <div>
      <h2 style={{ margin: '0 0 0.5rem 0' }}>Loading {type}...</h2>
      <p id="widget-loading-message" style={{ margin: 0, opacity: 0.8 }}>Connecting to iRacing data...</p>
    </div>
  </div>
);

/**
 * Error Boundary component for widget rendering
 * Catches JavaScript errors during component rendering and shows fallback UI
 */
interface WidgetErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class WidgetErrorBoundary extends React.Component<
  React.PropsWithChildren<{ widgetType: string }>,
  WidgetErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ widgetType: string }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): WidgetErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Update state with error details
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });

    // Log the error to console for debugging
    console.error('Widget Error Boundary caught an error:', {
      widgetType: this.props.widgetType,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI with transparent background for OBS compatibility
      return (
        <div 
          className="widget-error-boundary"
          role="alert"
          aria-label="Widget Rendering Error"
          aria-describedby="error-boundary-message"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '1rem',
            backgroundColor: 'transparent',
            color: '#ff6b6b',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'center',
          }}
        >
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>Widget Error</h2>
            <p id="error-boundary-message" style={{ margin: '0 0 0.5rem 0', opacity: 0.8 }}>
              The {this.props.widgetType} widget encountered an error and could not render.
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>
              Check the console for detailed error information.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Widget app component that renders the appropriate widget
 */
const WidgetApp: React.FC = () => {
  const config = getWidgetConfig();
  
  if (!config) {
    return (
      <WidgetError error="Invalid widget type. Please check the URL parameter." />
    );
  }
  
  const WidgetComponent = WIDGET_COMPONENTS[config.type];
  
  if (!WidgetComponent) {
    return (
      <WidgetError error={`Widget type "${config.type}" not found.`} />
    );
  }
  
  return (
    <WidgetErrorBoundary widgetType={config.type}>
      <DashboardProvider bridge={window.dashboardBridge}>
        <RunningStateProvider bridge={window.irsdkBridge}>
          <SessionProvider bridge={window.irsdkBridge} />
          <TelemetryProvider bridge={window.irsdkBridge} />
          <div 
            id="widget-container"
            role="application"
            aria-label={`iRacing ${config.displayName} Widget`}
            aria-description={`${config.description} - Live data from iRacing for OBS streaming`}
            aria-live="polite"
            aria-atomic="false"
            data-widget-type={config.type}
            data-widget-display-name={config.displayName}
            data-widget-description={config.description}
            data-widget-api-version="1.0.0"
            data-obs-integration-version="1.0.0"
            data-irdashies-version="0.0.19"
            data-obs-compatible="true"
            data-build-timestamp={new Date().toISOString()}
            style={{
              width: '100vw',
              height: '100vh',
              backgroundColor: 'transparent',
              overflow: 'hidden',
            }}
          >
            <React.Suspense fallback={<WidgetLoading type={config.displayName} />}>
              <WidgetComponent />
            </React.Suspense>
          </div>
        </RunningStateProvider>
      </DashboardProvider>
    </WidgetErrorBoundary>
  );
};

/**
 * Initialize the widget application
 */
function initializeWidget() {
  const rootElement = document.getElementById('widget-root');
  if (!rootElement) {
    console.error('Widget root element not found');
    return;
  }
  
  // Add data attributes to document body for widget identification
  const config = getWidgetConfig();
  if (config) {
    // Set page title based on widget type
    document.title = `irdashies ${config.displayName} Widget`;
    
    document.body.setAttribute('data-widget-type', config.type);
    document.body.setAttribute('data-widget-display-name', config.displayName);
    document.body.setAttribute('data-obs-widget', 'true');
    document.body.setAttribute('data-irdashies-widget', 'true');
    document.body.setAttribute('data-irdashies-version', '0.0.19');
    document.body.setAttribute('data-widget-api-version', '1.0.0');
    document.body.setAttribute('data-obs-integration-version', '1.0.0');
    
    // Add meta tags with version information
    const addMetaTag = (name: string, content: string) => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', name);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    };
    
    addMetaTag('irdashies:version', '0.0.19');
    addMetaTag('irdashies:widget-type', config.type);
    addMetaTag('irdashies:widget-api-version', '1.0.0');
    addMetaTag('irdashies:obs-integration-version', '1.0.0');
    addMetaTag('irdashies:build-timestamp', new Date().toISOString());
  } else {
    // Default title for error cases
    document.title = 'irdashies Widget - Error';
  }
  
  const root = createRoot(rootElement);
  root.render(<WidgetApp />);
  
  console.log('Widget initialized successfully');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWidget);
} else {
  initializeWidget();
}

// Export for testing and debugging
export { WIDGET_COMPONENTS, WidgetApp, WidgetErrorBoundary, getWidgetTypeFromURL, getWidgetConfig };
export default WidgetApp;