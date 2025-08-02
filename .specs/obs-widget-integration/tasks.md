# Implementation Tasks for OBS Widget Integration

## Overview
Implementation tasks for adding HTTP server that serves individual irdashies widgets as standalone web pages for OBS Browser Source integration.

## Task Categories

### Phase 1: HTTP Server Infrastructure (Tasks 1-15)
Core HTTP server implementation with port selection strategy and basic widget serving capability.

### Phase 2: Widget Entry Point (Tasks 16-25)
New Vite entry point for HTTP-served widgets that reuses existing React components.

### Phase 3: Settings Integration (Tasks 26-35)
Settings UI for displaying widget URLs and managing server status.

### Phase 4: Testing & Polish (Tasks 36-45)
Comprehensive testing, error handling improvements, and documentation.

---

## Phase 1: HTTP Server Infrastructure

### Task 1: Install Express.js dependency
**File**: `package.json`
**Description**: Add Express.js as a dependency for the HTTP server
**Details**: 
- Add `express` and `@types/express` to dependencies
- Ensure version compatibility with existing Node.js version
**Acceptance Criteria**: Express.js is available for import in main process

### Task 2: Create HTTP server configuration interface
**File**: `src/types/httpServer.ts` (new)
**Description**: Define TypeScript interfaces for HTTP server configuration
**Details**:
```typescript
interface HttpServerConfig {
  defaultPort: number; // 58080
  currentPort: number; // Actual port being used
  isRunning: boolean;
  maxPortAttempts: number; // Try 10 ports before failing
}

interface WidgetUrlInfo {
  type: string;
  displayName: string;
  url: string;
  description: string;
}
```
**Acceptance Criteria**: Interfaces are properly typed and exportable

### Task 3: Implement port availability checking
**File**: `src/app/httpServer.ts` (new)
**Description**: Create utility function to check if a port is available
**Details**:
- Use Node.js `net` module to test port availability
- Return Promise<boolean> for async port checking
- Handle connection errors gracefully
**Acceptance Criteria**: Function correctly identifies available/occupied ports

### Task 4: Implement port selection strategy  
**File**: `src/app/httpServer.ts`
**Description**: Create function to find available port starting from 58080
**Details**:
- Try ports 58080-58089 (10 attempts)
- Return first available port or throw error if all occupied
- Log attempted ports for debugging
**Acceptance Criteria**: Successfully finds available port or fails gracefully

### Task 5: Create basic Express server setup
**File**: `src/app/httpServer.ts`
**Description**: Initialize Express server with basic configuration
**Details**:
- Create Express app instance
- Bind to localhost (127.0.0.1) only for security
- Add basic error handling middleware
- Configure JSON parsing middleware
**Acceptance Criteria**: Express server starts and binds to localhost only

### Task 6: Implement HTTP server start method
**File**: `src/app/httpServer.ts`
**Description**: Create server start method with port selection
**Details**:
- Use port selection strategy to find available port
- Start Express server on selected port
- Return actual port being used
- Handle server startup errors
**Acceptance Criteria**: Server starts successfully and returns actual port

### Task 7: Implement HTTP server stop method
**File**: `src/app/httpServer.ts`
**Description**: Create server stop method with cleanup
**Details**:
- Gracefully close Express server
- Clean up any active connections
- Reset server state variables
- Handle shutdown errors
**Acceptance Criteria**: Server stops cleanly without hanging connections

### Task 8: Create widget type validation
**File**: `src/app/httpServer.ts`
**Description**: Validate widget type parameters against allowed values
**Details**:
- Define allowed widget types: 'standings', 'trackmap', 'weather', 'input', 'relative', 'fastercars'
- Create validation function for URL parameters
- Return appropriate error responses for invalid types
**Acceptance Criteria**: Only valid widget types are accepted

### Task 9: Create basic widget HTML template
**File**: `src/app/httpServer.ts`
**Description**: Generate HTML template for widget rendering
**Details**:
- Minimal HTML structure with transparent background CSS
- Meta tags for OBS Browser Source compatibility
- Script tag to load widget.js bundle
- Title and viewport meta tags
**Acceptance Criteria**: HTML template renders with transparent background

### Task 10: Implement widget endpoint handler
**File**: `src/app/httpServer.ts`
**Description**: Create Express route handler for `/widget` endpoint
**Details**:
- Extract and validate `type` query parameter
- Generate appropriate HTML response
- Handle invalid widget types with error pages
- Set appropriate content-type headers
**Acceptance Criteria**: Endpoint serves HTML for valid widget types

### Task 11: Add server lifecycle management
**File**: `src/app/httpServer.ts`
**Description**: Create HttpWidgetServer class with lifecycle methods
**Details**:
- Implement start(), stop(), isRunning(), getCurrentPort() methods
- Track server state internally
- Provide getWidgetUrl() method for URL generation
- Export class for use in main process
**Acceptance Criteria**: Server can be controlled programmatically

### Task 12: Add error page generation
**File**: `src/app/httpServer.ts`
**Description**: Create error page for invalid widget requests
**Details**:
- Generate HTML error page with helpful message
- Maintain transparent background for OBS compatibility
- Include list of valid widget types
- Log errors to console
**Acceptance Criteria**: Invalid requests show helpful error page

### Task 13: Add development vs production asset serving
**File**: `src/app/httpServer.ts`
**Description**: Handle serving widget assets in development and production
**Details**:
- In development: proxy to Vite dev server
- In production: serve from built dist directory
- Detect environment and configure accordingly
- Handle asset path resolution
**Acceptance Criteria**: Widget assets load correctly in both environments

### Task 14: Integrate server with main Electron process
**File**: `src/app/index.ts`
**Description**: Start/stop HTTP server with Electron application
**Details**:
- Import HttpWidgetServer class
- Start server when Electron app is ready
- Stop server when Electron app is quitting
- Handle server startup failures gracefully
**Acceptance Criteria**: Server lifecycle matches Electron app lifecycle

### Task 15: Add HTTP server logging
**File**: `src/app/httpServer.ts`
**Description**: Implement proper logging for server operations
**Details**:
- Log server start/stop events with port information
- Log widget requests with timestamp and type
- Log errors with context information
- Use appropriate log levels
**Acceptance Criteria**: Server operations are properly logged

---

## Phase 2: Widget Entry Point

### Task 16: Configure Vite for widget entry point
**File**: `vite.renderer.config.ts`
**Description**: Add widget.tsx as new entry point in Vite configuration
**Details**:
- Add widget entry to build.rollupOptions.input
- Configure output naming for widget bundle
- Ensure proper chunk splitting
- Maintain existing renderer entry point
**Acceptance Criteria**: Vite builds separate widget.js bundle

### Task 17: Create widget component mapping
**File**: `src/widget.tsx` (new)
**Description**: Map widget type strings to React components
**Details**:
```typescript
const WIDGET_COMPONENTS = {
  'standings': Standings,
  'trackmap': TrackMap,
  'weather': Weather,
  'input': Input,
  'relative': Relative,
  'fastercars': FasterCarsFromBehind
} as const;
```
**Acceptance Criteria**: All widget components are properly mapped

### Task 18: Implement widget type parameter extraction
**File**: `src/widget.tsx`
**Description**: Extract widget type from URL search parameters
**Details**:
- Use URLSearchParams to extract 'type' parameter
- Validate extracted type against component mapping
- Handle missing or invalid type parameters
- Default to error state for invalid types
**Acceptance Criteria**: Widget type is correctly extracted from URL

### Task 19: Create widget app component
**File**: `src/widget.tsx`
**Description**: Main component that renders selected widget
**Details**:
- Accept widget type as prop or from URL
- Render appropriate widget component
- Handle component loading errors
- Apply transparent background styling
**Acceptance Criteria**: Correct widget component renders based on type

### Task 20: Set up provider context for widgets
**File**: `src/widget.tsx`
**Description**: Wrap widgets with necessary context providers
**Details**:
- Import all existing providers (SessionStore, TelemetryStore, etc.)
- Wrap widget component with same provider hierarchy as main app
- Ensure IPC bridge connection works for widgets
- Handle provider initialization errors
**Acceptance Criteria**: Widgets receive real-time data through existing providers

### Task 21: Add transparent background CSS
**File**: `src/widget.tsx`
**Description**: Apply OBS-compatible transparent background styling
**Details**:
- Set body background to transparent
- Remove default margins and padding
- Ensure widget containers have transparent backgrounds
- Test with OBS Browser Source
**Acceptance Criteria**: Widgets have fully transparent backgrounds in OBS

### Task 22: Implement widget error boundary
**File**: `src/widget.tsx`
**Description**: Add React error boundary for widget component failures
**Details**:
- Create error boundary component for widget rendering
- Display error message with transparent background
- Log component errors to console
- Provide fallback UI for failed widgets
**Acceptance Criteria**: Widget errors don't crash the entire page

### Task 23: Add widget meta information
**File**: `src/widget.tsx`
**Description**: Include widget identification and metadata
**Details**:
- Add data attributes to identify widget type
- Include version information in DOM
- Add accessibility labels for screen readers
- Set appropriate page title based on widget type
**Acceptance Criteria**: Widgets include proper metadata and accessibility info

### Task 24: Handle widget-specific optimizations
**File**: `src/widget.tsx`
**Description**: Apply widget-specific CSS and performance optimizations
**Details**:
- Optimize font sizes for streaming/OBS viewing
- Remove unnecessary animations for performance
- Apply appropriate contrast for streaming
- Handle different widget aspect ratios
**Acceptance Criteria**: Widgets are optimized for OBS/streaming use

### Task 25: Create widget entry point build script
**File**: `src/widget.tsx`
**Description**: Set up proper React DOM rendering for widget entry
**Details**:
- Import React and ReactDOM
- Create root element rendering
- Handle DOM ready state
- Add proper error handling for rendering
**Acceptance Criteria**: Widget entry point renders correctly in browser

---

## Phase 3: Settings Integration

### Task 26: Create OBS Integration settings section component
**File**: `src/frontend/components/Settings/sections/OBSIntegrationSettings.tsx` (new)
**Description**: New settings section for OBS widget integration
**Details**:
- Create React component for OBS settings
- Follow existing settings section patterns
- Include server status display
- Add widget URL listing
**Acceptance Criteria**: Settings section displays in settings panel

### Task 27: Add server status indicator
**File**: `src/frontend/components/Settings/sections/OBSIntegrationSettings.tsx`
**Description**: Display HTTP server running status
**Details**:
- Show green/red status indicator
- Display current port when server is running
- Show error message when server fails to start
- Update status in real-time
**Acceptance Criteria**: Status accurately reflects server state

### Task 28: Implement widget URL list display
**File**: `src/frontend/components/Settings/sections/OBSIntegrationSettings.tsx`
**Description**: List all available widget URLs with descriptions
**Details**:
- Display URL for each widget type
- Include friendly name and description
- Show actual port being used
- Format URLs for easy reading
**Acceptance Criteria**: All widget URLs are displayed with descriptions

### Task 29: Add copy-to-clipboard functionality
**File**: `src/frontend/components/Settings/sections/OBSIntegrationSettings.tsx`
**Description**: Allow users to copy widget URLs to clipboard
**Details**:
- Add copy button next to each URL
- Use Clipboard API for copying
- Show success/failure feedback
- Handle clipboard permissions
**Acceptance Criteria**: URLs can be copied to clipboard with feedback

### Task 30: Add server toggle control
**File**: `src/frontend/components/Settings/sections/OBSIntegrationSettings.tsx`
**Description**: Allow manual start/stop of HTTP server
**Details**:
- Add toggle switch for server control
- Handle start/stop operations
- Show loading state during operations
- Display error messages for failures
**Acceptance Criteria**: Server can be controlled through settings UI

### Task 31: Create IPC bridge for server control
**File**: `src/app/bridge/httpServerBridge.ts` (new)
**Description**: IPC communication between renderer and HTTP server
**Details**:
- Expose server control methods to renderer
- Handle server status queries
- Provide real-time status updates
- Follow existing bridge patterns
**Acceptance Criteria**: Renderer can control and monitor HTTP server

### Task 32: Add server configuration storage
**File**: `src/app/storage/httpServerSettings.ts` (new)
**Description**: Persist HTTP server settings
**Details**:
- Store server enabled/disabled preference
- Remember custom port configurations
- Use existing storage patterns
- Handle settings migration
**Acceptance Criteria**: Server settings persist across app restarts

### Task 33: Integrate OBS settings into main settings
**File**: `src/frontend/components/Settings/Settings.tsx`
**Description**: Add OBS Integration section to main settings panel
**Details**:
- Import OBSIntegrationSettings component
- Add to settings navigation/sections
- Follow existing settings integration patterns
- Ensure proper spacing and layout
**Acceptance Criteria**: OBS settings appear in main settings interface

### Task 34: Add settings help text and documentation
**File**: `src/frontend/components/Settings/sections/OBSIntegrationSettings.tsx`
**Description**: Include helpful instructions for OBS setup
**Details**:
- Add step-by-step OBS Browser Source setup instructions
- Include troubleshooting tips
- Link to OBS documentation if helpful
- Use collapsible help sections
**Acceptance Criteria**: Users have clear instructions for OBS setup

### Task 35: Handle settings UI responsive design
**File**: `src/frontend/components/Settings/sections/OBSIntegrationSettings.tsx`
**Description**: Ensure settings UI works on different screen sizes
**Details**:
- Test URL display on smaller screens
- Ensure copy buttons remain accessible
- Handle long URLs gracefully
- Maintain consistent spacing
**Acceptance Criteria**: Settings UI is usable on different screen sizes

---

## Phase 4: Testing & Polish

### Task 36: Create HTTP server unit tests
**File**: `src/app/httpServer.spec.ts` (new)
**Description**: Unit tests for HTTP server functionality
**Details**:
- Test port selection strategy
- Test server start/stop methods
- Test widget endpoint responses
- Test error handling
**Acceptance Criteria**: HTTP server has comprehensive test coverage

### Task 37: Create widget entry point tests
**File**: `src/widget.spec.tsx` (new)
**Description**: Tests for widget entry point functionality
**Details**:
- Test widget component rendering
- Test parameter extraction
- Test error boundary behavior
- Test provider integration
**Acceptance Criteria**: Widget entry point has proper test coverage

### Task 38: Add integration tests for OBS workflow
**File**: `src/app/integration/obsIntegration.spec.ts` (new)
**Description**: End-to-end tests for OBS integration workflow
**Details**:
- Test complete server startup to widget serving
- Test IPC communication with settings
- Test error scenarios
- Test multiple concurrent widgets
**Acceptance Criteria**: Full OBS integration workflow is tested

### Task 39: Add manual testing documentation
**File**: `docs/testing/obs-integration-testing.md` (new)
**Description**: Manual testing procedures for OBS integration
**Details**:
- Step-by-step OBS setup instructions
- Testing checklist for different widgets
- Performance testing procedures
- Troubleshooting guide
**Acceptance Criteria**: Clear manual testing documentation exists

### Task 40: Optimize widget performance for OBS
**File**: `src/widget.tsx`
**Description**: Performance optimizations specific to OBS Browser Source
**Details**:
- Minimize bundle size
- Optimize re-render frequency
- Reduce memory usage
- Test with multiple concurrent widgets
**Acceptance Criteria**: Widgets perform well in OBS with multiple instances

### Task 41: Add error recovery mechanisms
**File**: `src/app/httpServer.ts`
**Description**: Improve error handling and recovery
**Details**:
- Auto-restart server on crashes
- Handle port conflicts gracefully
- Recover from widget rendering errors
- Provide fallback behaviors
**Acceptance Criteria**: System recovers gracefully from common failures

### Task 42: Add comprehensive logging
**File**: `src/app/httpServer.ts`, `src/widget.tsx`
**Description**: Enhance logging for debugging and monitoring
**Details**:
- Log widget requests and rendering
- Track performance metrics
- Log error contexts
- Support debug logging levels
**Acceptance Criteria**: Comprehensive logging aids debugging

### Task 43: Create user documentation
**File**: `docs/obs-integration.md` (new)
**Description**: User-facing documentation for OBS integration
**Details**:
- Getting started guide
- Widget configuration options
- Troubleshooting common issues
- Advanced usage scenarios
**Acceptance Criteria**: Users have clear documentation for OBS integration

### Task 44: Add security validation
**File**: `src/app/httpServer.ts`
**Description**: Security review and validation
**Details**:
- Validate localhost-only binding
- Review input validation
- Test against common web vulnerabilities
- Ensure no sensitive data exposure
**Acceptance Criteria**: Security review passes with no critical issues

### Task 45: Performance benchmarking
**File**: `performance/obs-benchmarks.ts` (new)
**Description**: Benchmark performance with multiple widgets
**Details**:
- Measure server response times
- Test memory usage with concurrent widgets
- Benchmark widget rendering performance
- Compare to baseline dashboard performance
**Acceptance Criteria**: Performance meets requirements with no degradation

---

## Implementation Notes

### Dependencies Required
- `express` and `@types/express` for HTTP server
- No additional React dependencies (reuse existing)

### Key Integration Points
- Electron main process: `src/app/index.ts`
- Vite configuration: `vite.renderer.config.ts`
- Settings system: `src/frontend/components/Settings/`
- IPC bridge: `src/app/bridge/`

### Testing Strategy
- Unit tests for core server functionality
- Integration tests for end-to-end workflow
- Manual testing with actual OBS setup
- Performance testing with multiple widgets

### Success Criteria
- Streamers can add widgets to OBS in under 2 minutes
- Widgets update in real-time without lag
- Server starts reliably on high port (58080+)
- Multiple widgets work simultaneously
- No impact on existing dashboard performance