# Implementation Tasks for OBS Widget Integration

## Phase 1: HTTP Server Infrastructure

- [x] 1. Install Express.js dependency
  - [x] 1.1. Add `express` and `@types/express` to package.json dependencies
  - [x] 1.2. Ensure version compatibility with existing Node.js version
  - [x] 1.3. Verify Express.js is available for import in main process

- [x] 2. Create HTTP server configuration interface
  - [x] 2.1. Create `src/types/httpServer.ts` with `HttpServerConfig` interface
  - [x] 2.2. Add `WidgetUrlInfo` interface for URL information
  - [x] 2.3. Add `WidgetRouteParams` interface for type validation
  - [x] 2.4. Export interfaces for use across the application

- [x] 3. Implement port availability checking
  - [x] 3.1. Create utility function using Node.js `net` module
  - [x] 3.2. Return Promise<boolean> for async port checking
  - [x] 3.3. Handle connection errors gracefully
  - [x] 3.4. Add unit tests for port availability checking

- [x] 4. Implement port selection strategy
  - [x] 4.1. Create function to find available port starting from 58080
  - [x] 4.2. Try ports 58080-58089 (10 attempts)
  - [x] 4.3. Return first available port or throw error if all occupied
  - [x] 4.4. Log attempted ports for debugging

- [x] 5. Create basic Express server setup
  - [x] 5.1. Create Express app instance
  - [x] 5.2. Bind to localhost (127.0.0.1) only for security
  - [x] 5.3. Add basic error handling middleware
  - [x] 5.4. Configure JSON parsing middleware

- [x] 6. Implement HTTP server start method
  - [x] 6.1. Use port selection strategy to find available port
  - [x] 6.2. Start Express server on selected port
  - [x] 6.3. Return actual port being used
  - [x] 6.4. Handle server startup errors

- [x] 7. Implement HTTP server stop method
  - [x] 7.1. Gracefully close Express server
  - [x] 7.2. Clean up any active connections
  - [x] 7.3. Reset server state variables
  - [x] 7.4. Handle shutdown errors

- [x] 8. Create widget type validation
  - [x] 8.1. Define allowed widget types: 'standings', 'trackmap', 'weather', 'input', 'relative', 'fastercars'
  - [x] 8.2. Create validation function for URL parameters
  - [x] 8.3. Return appropriate error responses for invalid types
  - [x] 8.4. Add unit tests for widget type validation

- [ ] 9. Create basic widget HTML template
  - [-] 9.1. Create minimal HTML structure with transparent background CSS
  - [x] 9.2. Add meta tags for OBS Browser Source compatibility
  - [x] 9.3. Add script tag to load widget.js bundle
  - [x] 9.4. Include title and viewport meta tags

- [ ] 10. Implement widget endpoint handler
  - [ ] 10.1. Create Express route handler for `/widget` endpoint
  - [ ] 10.2. Extract and validate `type` query parameter
  - [ ] 10.3. Generate appropriate HTML response
  - [ ] 10.4. Handle invalid widget types with error pages
  - [ ] 10.5. Set appropriate content-type headers

- [ ] 11. Add server lifecycle management
  - [ ] 11.1. Create HttpWidgetServer class
  - [ ] 11.2. Implement start(), stop(), isRunning(), getCurrentPort() methods
  - [ ] 11.3. Track server state internally
  - [ ] 11.4. Provide getWidgetUrl() method for URL generation
  - [ ] 11.5. Export class for use in main process

- [ ] 12. Add error page generation
  - [ ] 12.1. Generate HTML error page with helpful message
  - [ ] 12.2. Maintain transparent background for OBS compatibility
  - [ ] 12.3. Include list of valid widget types
  - [ ] 12.4. Log errors to console

- [ ] 13. Add development vs production asset serving
  - [ ] 13.1. Detect development vs production environment
  - [ ] 13.2. In development: proxy to Vite dev server
  - [ ] 13.3. In production: serve from built dist directory
  - [ ] 13.4. Handle asset path resolution correctly

- [ ] 14. Integrate server with main Electron process
  - [ ] 14.1. Import HttpWidgetServer class in src/app/index.ts
  - [ ] 14.2. Start server when Electron app is ready
  - [ ] 14.3. Stop server when Electron app is quitting
  - [ ] 14.4. Handle server startup failures gracefully

- [ ] 15. Add HTTP server logging
  - [ ] 15.1. Log server start/stop events with port information
  - [ ] 15.2. Log widget requests with timestamp and type
  - [ ] 15.3. Log errors with context information
  - [ ] 15.4. Use appropriate log levels

## Phase 2: Widget Entry Point

- [ ] 16. Configure Vite for widget entry point
  - [ ] 16.1. Add widget entry to build.rollupOptions.input in vite.renderer.config.ts
  - [ ] 16.2. Configure output naming for widget bundle
  - [ ] 16.3. Ensure proper chunk splitting
  - [ ] 16.4. Maintain existing renderer entry point
  - [ ] 16.5. Verify Vite builds separate widget.js bundle

- [ ] 17. Create widget component mapping
  - [ ] 17.1. Create src/widget.tsx with WIDGET_COMPONENTS mapping
  - [ ] 17.2. Map 'standings' to Standings component
  - [ ] 17.3. Map 'trackmap' to TrackMap component
  - [ ] 17.4. Map 'weather' to Weather component
  - [ ] 17.5. Map 'input' to Input component
  - [ ] 17.6. Map 'relative' to Relative component
  - [ ] 17.7. Map 'fastercars' to FasterCarsFromBehind component

- [ ] 18. Implement widget type parameter extraction
  - [ ] 18.1. Use URLSearchParams to extract 'type' parameter
  - [ ] 18.2. Validate extracted type against component mapping
  - [ ] 18.3. Handle missing or invalid type parameters
  - [ ] 18.4. Default to error state for invalid types

- [ ] 19. Create widget app component
  - [ ] 19.1. Create main WidgetApp component that accepts widget type
  - [ ] 19.2. Render appropriate widget component based on type
  - [ ] 19.3. Handle component loading errors
  - [ ] 19.4. Apply transparent background styling

- [ ] 20. Set up provider context for widgets
  - [ ] 20.1. Import all existing providers (SessionStore, TelemetryStore, etc.)
  - [ ] 20.2. Wrap widget component with same provider hierarchy as main app
  - [ ] 20.3. Ensure IPC bridge connection works for widgets
  - [ ] 20.4. Handle provider initialization errors

- [ ] 21. Add transparent background CSS
  - [ ] 21.1. Set body background to transparent
  - [ ] 21.2. Remove default margins and padding
  - [ ] 21.3. Ensure widget containers have transparent backgrounds
  - [ ] 21.4. Test transparency with OBS Browser Source

- [ ] 22. Implement widget error boundary
  - [ ] 22.1. Create error boundary component for widget rendering
  - [ ] 22.2. Display error message with transparent background
  - [ ] 22.3. Log component errors to console
  - [ ] 22.4. Provide fallback UI for failed widgets

- [ ] 23. Add widget meta information
  - [ ] 23.1. Add data attributes to identify widget type
  - [ ] 23.2. Include version information in DOM
  - [ ] 23.3. Add accessibility labels for screen readers
  - [ ] 23.4. Set appropriate page title based on widget type

- [ ] 24. Handle widget-specific optimizations
  - [ ] 24.1. Optimize font sizes for streaming/OBS viewing
  - [ ] 24.2. Remove unnecessary animations for performance
  - [ ] 24.3. Apply appropriate contrast for streaming
  - [ ] 24.4. Handle different widget aspect ratios

- [ ] 25. Create widget entry point build script
  - [ ] 25.1. Import React and ReactDOM
  - [ ] 25.2. Create root element rendering
  - [ ] 25.3. Handle DOM ready state
  - [ ] 25.4. Add proper error handling for rendering

## Phase 3: Settings Integration

- [ ] 26. Create OBS Integration settings section component
  - [ ] 26.1. Create src/frontend/components/Settings/sections/OBSIntegrationSettings.tsx
  - [ ] 26.2. Follow existing settings section patterns
  - [ ] 26.3. Include server status display
  - [ ] 26.4. Add widget URL listing section

- [ ] 27. Add server status indicator
  - [ ] 27.1. Show green/red status indicator
  - [ ] 27.2. Display current port when server is running
  - [ ] 27.3. Show error message when server fails to start
  - [ ] 27.4. Update status in real-time

- [ ] 28. Implement widget URL list display
  - [ ] 28.1. Display URL for each widget type
  - [ ] 28.2. Include friendly name and description
  - [ ] 28.3. Show actual port being used
  - [ ] 28.4. Format URLs for easy reading

- [ ] 29. Add copy-to-clipboard functionality
  - [ ] 29.1. Add copy button next to each URL
  - [ ] 29.2. Use Clipboard API for copying
  - [ ] 29.3. Show success/failure feedback
  - [ ] 29.4. Handle clipboard permissions

- [ ] 30. Add server toggle control
  - [ ] 30.1. Add toggle switch for server control
  - [ ] 30.2. Handle start/stop operations
  - [ ] 30.3. Show loading state during operations
  - [ ] 30.4. Display error messages for failures

- [ ] 31. Create IPC bridge for server control
  - [ ] 31.1. Create src/app/bridge/httpServerBridge.ts
  - [ ] 31.2. Expose server control methods to renderer
  - [ ] 31.3. Handle server status queries
  - [ ] 31.4. Provide real-time status updates
  - [ ] 31.5. Follow existing bridge patterns

- [ ] 32. Add server configuration storage
  - [ ] 32.1. Create src/app/storage/httpServerSettings.ts
  - [ ] 32.2. Store server enabled/disabled preference
  - [ ] 32.3. Remember custom port configurations
  - [ ] 32.4. Use existing storage patterns
  - [ ] 32.5. Handle settings migration

- [ ] 33. Integrate OBS settings into main settings
  - [ ] 33.1. Import OBSIntegrationSettings component in Settings.tsx
  - [ ] 33.2. Add to settings navigation/sections
  - [ ] 33.3. Follow existing settings integration patterns
  - [ ] 33.4. Ensure proper spacing and layout

- [ ] 34. Add settings help text and documentation
  - [ ] 34.1. Add step-by-step OBS Browser Source setup instructions
  - [ ] 34.2. Include troubleshooting tips
  - [ ] 34.3. Link to OBS documentation if helpful
  - [ ] 34.4. Use collapsible help sections

- [ ] 35. Handle settings UI responsive design
  - [ ] 35.1. Test URL display on smaller screens
  - [ ] 35.2. Ensure copy buttons remain accessible
  - [ ] 35.3. Handle long URLs gracefully
  - [ ] 35.4. Maintain consistent spacing

## Phase 4: Testing & Polish

- [ ] 36. Create HTTP server unit tests
  - [ ] 36.1. Create src/app/httpServer.spec.ts
  - [ ] 36.2. Test port selection strategy
  - [ ] 36.3. Test server start/stop methods
  - [ ] 36.4. Test widget endpoint responses
  - [ ] 36.5. Test error handling scenarios

- [ ] 37. Create widget entry point tests
  - [ ] 37.1. Create src/widget.spec.tsx
  - [ ] 37.2. Test widget component rendering
  - [ ] 37.3. Test parameter extraction
  - [ ] 37.4. Test error boundary behavior
  - [ ] 37.5. Test provider integration

- [ ] 38. Add integration tests for OBS workflow
  - [ ] 38.1. Create src/app/integration/obsIntegration.spec.ts
  - [ ] 38.2. Test complete server startup to widget serving
  - [ ] 38.3. Test IPC communication with settings
  - [ ] 38.4. Test error scenarios
  - [ ] 38.5. Test multiple concurrent widgets

- [ ] 39. Add manual testing documentation
  - [ ] 39.1. Create docs/testing/obs-integration-testing.md
  - [ ] 39.2. Add step-by-step OBS setup instructions
  - [ ] 39.3. Create testing checklist for different widgets
  - [ ] 39.4. Add performance testing procedures
  - [ ] 39.5. Include troubleshooting guide

- [ ] 40. Optimize widget performance for OBS
  - [ ] 40.1. Minimize bundle size
  - [ ] 40.2. Optimize re-render frequency
  - [ ] 40.3. Reduce memory usage
  - [ ] 40.4. Test with multiple concurrent widgets

- [ ] 41. Add error recovery mechanisms
  - [ ] 41.1. Add auto-restart server on crashes
  - [ ] 41.2. Handle port conflicts gracefully
  - [ ] 41.3. Recover from widget rendering errors
  - [ ] 41.4. Provide fallback behaviors

- [ ] 42. Add comprehensive logging
  - [ ] 42.1. Log widget requests and rendering
  - [ ] 42.2. Track performance metrics
  - [ ] 42.3. Log error contexts
  - [ ] 42.4. Support debug logging levels

- [ ] 43. Create user documentation
  - [ ] 43.1. Create docs/obs-integration.md
  - [ ] 43.2. Add getting started guide
  - [ ] 43.3. Document widget configuration options
  - [ ] 43.4. Include troubleshooting common issues
  - [ ] 43.5. Add advanced usage scenarios

- [ ] 44. Add security validation
  - [ ] 44.1. Validate localhost-only binding
  - [ ] 44.2. Review input validation
  - [ ] 44.3. Test against common web vulnerabilities
  - [ ] 44.4. Ensure no sensitive data exposure

- [ ] 45. Performance benchmarking
  - [ ] 45.1. Create performance/obs-benchmarks.ts
  - [ ] 45.2. Measure server response times
  - [ ] 45.3. Test memory usage with concurrent widgets
  - [ ] 45.4. Benchmark widget rendering performance
  - [ ] 45.5. Compare to baseline dashboard performance