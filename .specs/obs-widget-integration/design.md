# Design for OBS Widget Integration

## Architecture Overview

The OBS Widget Integration feature extends the existing irdashies Electron application by adding an HTTP server that serves individual widgets as standalone web pages. This design leverages the existing React components and data infrastructure without duplication, treating HTTP-served widgets as additional renderer processes.

**Core Principle**: Reuse everything - zero changes to existing widget components, same data flow, same providers.

## Design Approach Selection

### Chosen Approach: Shared Component Architecture
- **HTTP Server** in Electron main process serves widget endpoints
- **Separate Widget Entry Point** that reuses all existing React infrastructure  
- **Same Data Flow** through existing IPC bridge to HTTP-served widgets
- **Transparent Background** CSS for OBS overlay compatibility

### Alternative Approaches Considered
1. **Duplicate Widget Logic**: Copy components for HTTP serving (❌ violates DRY)
2. **Iframe Embedding**: Embed main dashboard in HTTP pages (❌ complex, performance issues)
3. **Static Widget Generation**: Pre-render widgets as static content (❌ no real-time updates)

## Components

### 1. HTTP Widget Server (`src/app/httpServer.ts`)
- **Purpose**: Express server providing widget endpoints on high port
- **Port Strategy**: Default 58080, auto-increment if occupied (58081, 58082, etc.)
- **Security**: Localhost binding only, no external access
- **Endpoints**: Single `/widget?type={widgetType}` endpoint for all widgets
- **Integration**: Started/stopped with main Electron application

### 2. Widget Entry Point (`src/widget.tsx`)
- **Purpose**: New Vite entry point for HTTP-served widgets
- **Component Reuse**: Imports and renders existing widget components
- **Provider Reuse**: Uses same context providers (SessionStore, TelemetryStore, etc.)
- **Routing**: URL parameter determines which widget component to render
- **Styling**: Transparent background and OBS-optimized CSS

### 3. Widget HTML Template
- **Purpose**: Minimal HTML shell for widget rendering
- **Transparency**: CSS for transparent backgrounds in OBS
- **Meta Tags**: OBS Browser Source compatibility optimizations
- **Bundle Loading**: Loads compiled widget.js from Vite build

### 4. Settings Integration (`src/frontend/components/Settings/`)
- **Purpose**: Display widget URLs in settings interface
- **URL Display**: Shows actual port being used (not assumed port)
- **Copy Functionality**: Click-to-copy URLs for easy OBS setup
- **Status Indicator**: Shows server running/stopped status

## Data Models

### HTTP Server Configuration
```typescript
interface HttpServerConfig {
  defaultPort: number; // 58080
  currentPort: number; // Actual port being used
  isRunning: boolean;
  maxPortAttempts: number; // Try 10 ports before failing
}
```

### Widget Route Parameters
```typescript
interface WidgetRouteParams {
  type: 'standings' | 'trackmap' | 'weather' | 'input' | 'relative' | 'fastercars';
}
```

### Widget URL Information
```typescript
interface WidgetUrlInfo {
  type: string;
  displayName: string;
  url: string;
  description: string;
}
```

## Technical Implementation

### Port Selection Strategy
- **Default Port**: 58080 (high port, unlikely conflicts)
- **Fallback Strategy**: Auto-increment (58081, 58082, etc.) if port occupied
- **Maximum Attempts**: Try 10 consecutive ports before failing
- **Port Detection**: Use Node.js `net` module to test port availability
- **Configuration**: Store actual port in application state for settings display

### Widget Component Mapping
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

### Build System Integration
- **Vite Configuration**: Add widget entry point to `vite.renderer.config.ts`
- **Output**: Separate `widget.js` bundle alongside existing `renderer.js`
- **Development Mode**: Widget server works in development with Vite dev server
- **Production Mode**: Serves built widget assets from `dist/` directory

## Data Flow Architecture

### Existing Flow (Unchanged)
```
iRacing SDK → Bridge → IPC → Main Dashboard Widgets
```

### Extended Flow (Added)
```
iRacing SDK → Bridge → IPC → HTTP Widget Server → Browser (OBS)
                    ↘ → Main Dashboard Widgets
```

**Key Insight**: HTTP widgets receive the same real-time data through the existing IPC bridge mechanism. No new data paths required.

## Interfaces

### HTTP Server Interface
```typescript
interface HttpWidgetServer {
  start(port?: number): Promise<number>; // Returns actual port used
  stop(): Promise<void>;
  isRunning(): boolean;
  getCurrentPort(): number | null;
  getWidgetUrl(type: string): string;
}
```

### Widget Entry Point Interface
```typescript
interface WidgetApp {
  renderWidget(type: string): void;
  getAvailableWidgets(): string[];
}
```

### Settings Integration Interface
```typescript
interface OBSIntegrationSettings {
  serverRunning: boolean;
  currentPort: number;
  widgetUrls: WidgetUrlInfo[];
  copyUrlToClipboard(url: string): void;
}
```

## Error Handling

### Port Binding Failures
- **Scenario**: All attempted ports (58080-58089) are occupied
- **Response**: Log error, disable HTTP server, show status in settings
- **User Feedback**: Settings UI shows "Unable to start server - all ports occupied"
- **Recovery**: Manual restart attempt via settings toggle

### Widget Component Errors
- **Scenario**: Invalid widget type requested or component fails to render
- **Response**: Serve error page with helpful message
- **Fallback**: Default to empty page with transparent background
- **Logging**: Log widget errors to main process console

### Data Connection Failures  
- **Scenario**: IPC bridge fails or no iRacing data available
- **Response**: Widgets show "No data available" state (same as main dashboard)
- **Consistency**: Same error handling as existing dashboard widgets
- **User Experience**: Transparent background maintained for OBS

## Security Considerations

### Network Security
- **Localhost Only**: HTTP server binds to 127.0.0.1 only
- **No External Access**: Cannot be accessed from other machines
- **Port Range**: High port range reduces conflict with system services
- **No Authentication**: Not needed due to localhost-only access

### Data Security
- **Same Data Access**: No additional data exposure beyond existing dashboard
- **IPC Isolation**: Uses existing secure IPC bridge mechanisms
- **No Storage**: No additional data storage or persistence required

### Input Validation
- **URL Parameters**: Validate widget type against allowed values
- **Path Traversal**: Use Express.js built-in protections
- **Content Security**: Serve only application-generated content

## Performance Considerations

### HTTP Server Impact
- **Lightweight**: Express.js with minimal middleware
- **On-Demand**: Only starts when feature is enabled
- **Resource Usage**: Minimal CPU/memory overhead when no clients connected
- **Connection Limits**: Browser connections naturally limited

### Widget Rendering Performance
- **Component Reuse**: Same optimized components as main dashboard
- **Data Efficiency**: No additional data processing required
- **Update Frequency**: Same real-time update rates as main dashboard
- **Memory Usage**: Each browser tab creates separate renderer process

### Multiple Widget Support
- **Concurrent Widgets**: Support multiple OBS browser sources simultaneously
- **Independent Updates**: Each widget receives updates independently
- **Shared Data Source**: All widgets share same IPC data stream
- **No Performance Degradation**: Existing dashboard performance unaffected

## Testing Strategy

### Unit Tests
- HTTP server start/stop functionality with port selection
- Widget component mapping and parameter validation
- Settings UI URL generation and copy functionality
- Error handling for invalid widget types and port conflicts

### Integration Tests
- End-to-end widget serving through HTTP server
- IPC data flow to HTTP-served widgets
- Settings integration with server status updates
- Browser compatibility with OBS Browser Source plugin

### Manual Testing
- OBS Browser Source integration with transparent backgrounds
- Multiple widgets simultaneously in OBS scenes
- Server restart behavior and port conflict resolution
- Real-time data updates in OBS-served widgets

## Implementation Phases

### Phase 1: HTTP Server Infrastructure
- Implement HTTP server with port selection strategy
- Create basic widget HTML template serving
- Add server lifecycle management to main process

### Phase 2: Widget Entry Point
- Create widget.tsx entry point with component mapping
- Configure Vite build for widget bundle
- Implement transparent background and OBS optimizations

### Phase 3: Settings Integration
- Add OBS Integration section to settings UI
- Implement URL display and copy functionality
- Add server status indicators and controls

### Phase 4: Testing & Polish
- Comprehensive testing with OBS Browser Source
- Performance validation with multiple concurrent widgets
- Documentation and user experience refinements

## Files to Create/Modify

### New Files (~150 lines total)
- `src/app/httpServer.ts` - HTTP server implementation
- `src/widget.tsx` - Widget entry point
- `src/frontend/components/Settings/sections/OBSIntegrationSettings.tsx` - Settings UI

### Modified Files (minimal changes)
- `vite.renderer.config.ts` - Add widget entry point
- `src/app/index.ts` - Start HTTP server with application
- `src/frontend/components/Settings/Settings.tsx` - Add OBS settings section

This design maintains the DRY principle by reusing all existing components and infrastructure while providing the HTTP serving capability needed for OBS integration.