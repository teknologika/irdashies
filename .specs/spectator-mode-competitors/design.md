# Design for Spectator Mode & Competitors Support

## Architecture Overview
Extend the existing irdashies architecture to support spectator mode by leveraging `CamCarIdx` telemetry and `session.DriverInfo.CompetingDrivers[]` data. The design maintains backward compatibility while adding camera-car-aware functionality to all dashboard widgets.

## Core Design Principles
- **Extend, don't replace** existing functionality
- **Camera car as focus point** using `CamCarIdx` from telemetry
- **Competing drivers data** from `session.DriverInfo.CompetingDrivers[]` (filtered list)
- **Automatic mode detection** based on camera vs player car index
- **Zero performance impact** on existing player mode
- **Frame-based optimizations** for expensive calculations

## Key Insights from APR.Opponents SimHub Plugin

### Data Structure Clarification
- **Use `CompetingDrivers`** instead of all `Drivers` (pre-filtered to exclude spectators/pace cars)
- **Filter pattern**: `!driver.IsSpectator && driver.IsConnected && !driver.IsPaceCar`
- **Camera car lookup**: Find driver where `CarIdx === CamCarIdx`

### Performance Patterns
- **Frame-based updates**: Not all data needs 60Hz refresh
- **Tiered update cycles**: 60Hz telemetry, 1Hz expensive calculations
- **Selective recalculation**: Only update when camera car actually changes

### Relative Calculation Algorithm
```typescript
// Distance calculation to camera car (from APR.Opponents)
const calculateLapDistToCameraCar = (driverTrackPct: number, cameraCarTrackPct: number, trackLength: number) => {
  let distance = (cameraCarTrackPct * trackLength) - (driverTrackPct * trackLength);
  if (distance > trackLength / 2) {
    distance -= trackLength;
  } else if (distance < -trackLength / 2) {
    distance += trackLength;
  }
  return distance;
};
```

## Components

### 1. Data Layer Extensions

#### SessionStore Enhancement
- **Current**: Exposes player-focused session data via `session.DriverInfo.Drivers[]`
- **Addition**: Add `competingDrivers` and `cameraCarIdx` to store
- **Data source**: `session.DriverInfo.CompetingDrivers[]` (pre-filtered by iRacing)
- **New selectors**: 
  - `useCameraCarIdx()` - Current camera car index from telemetry
  - `useCameraCarDriver()` - Driver object for camera car from CompetingDrivers
  - `useCompetingDrivers()` - Filtered competing drivers array
  - `useIsSpectatorMode()` - Boolean: CamCarIdx !== DriverCarIdx

#### TelemetryStore Enhancement
- **Current**: Processes telemetry with player focus
- **Addition**: Add `CamCarIdx` tracking with change detection
- **Performance**: Frame-based updates for camera car changes
- **New functionality**: Emit camera car change events only when CamCarIdx actually changes

### 2. Widget Enhancements

#### Standings Component
- **Current**: `useDriverStandings()` shows relative to player using all drivers
- **Extension**: Add optional `focusCarIdx` parameter, use CompetingDrivers data
- **New hook**: `useSpectatorStandings(cameraCarIdx)` with competing drivers only
- **Visual**: Highlight camera car in standings list
- **Filtering**: Leverage CompetingDrivers to exclude spectators automatically

#### TrackMap Component  
- **Current**: Shows all cars, highlights player
- **Extension**: Add leader and camera car highlighting from competing drivers
- **New props**: `highlightCameraCarIdx`, `highlightLeaderCarIdx`
- **Colors**: Distinct colors for player, camera car, and leader
- **Data source**: Use CompetingDrivers for cleaner visualization

#### Relatives Component
- **Current**: `useDriverRelatives()` relative to player
- **Extension**: Accept optional focus car index, use APR.Opponents calculation pattern
- **New calculations**: Use `calculateLapDistToCameraCar` algorithm for accurate gaps
- **Auto-update**: Recalculate when camera car changes, with debouncing
- **Track wrapping**: Handle ±0.5 track length edge cases properly

#### FasterCarsFromBehind Component
- **Current**: Alerts for cars behind player
- **Extension**: Work from camera car perspective when spectating
- **Logic**: Use camera car position for "behind" calculations from CompetingDrivers
- **Filtering**: Benefit from pre-filtered competing drivers data

#### Input Component
- **Current**: Shows player inputs
- **Extension**: Hide when `CamCarIdx !== DriverCarIdx`
- **Fallback**: Show "Input data not available in spectator mode" message
- **Detection**: Use spectator mode detection from SessionStore

### 3. Integration Points

#### iRacing SDK Bridge Enhancement
- **File**: `src/app/bridge/iracingSdk/iracingSdkBridge.ts`
- **Addition**: Include `CamCarIdx` in telemetry processing
- **Change detection**: Emit events only when camera car actually changes (not every frame)
- **Data filtering**: Process CompetingDrivers alongside existing Drivers data

#### Hook Extensions
- **Pattern**: Extend existing hooks with optional `focusCarIdx` parameter
- **Backward compatibility**: Default to player car index when not specified
- **Data source**: Switch between Drivers and CompetingDrivers as appropriate
- **Examples**:
  ```typescript
  useDriverStandings(focusCarIdx?: number) // Uses CompetingDrivers when focusCarIdx provided
  useDriverRelatives(focusCarIdx?: number) // Uses APR.Opponents calculation pattern
  ```

## Data Models

### Extended Telemetry Interface
```typescript
interface SpectatorTelemetry extends Telemetry {
  CamCarIdx: number;
  previousCamCarIdx?: number;
  isSpectatorMode: boolean;
  frameCounter: number; // For performance optimizations
}
```

### Camera Car Context
```typescript
interface CameraCarContext {
  cameraCarIdx: number;
  cameraCarDriver: CompetingDriver | null; // From CompetingDrivers array
  isSpectatorMode: boolean;
  playerCarIdx: number;
}
```

### Competing Driver Interface (Extended)
```typescript
interface CompetingDriver extends Driver {
  IsSpectator: boolean; // Already filtered out in CompetingDrivers
  IsConnected: boolean;
  IsPaceCar: boolean; // Already filtered out in CompetingDrivers
  LapDistToCameraCar?: number; // Calculated relative to camera car
}
```

## Data Flow

### 1. Telemetry Processing with Performance Optimization
```
iRacing SDK → CamCarIdx → Frame Counter → Camera Car Change Event (debounced)
```

### 2. Session Data Processing  
```
iRacing SDK → DriverInfo.CompetingDrivers[] → SessionStore → Filtered Drivers Available
```

### 3. Widget Updates with Selective Recalculation
```
Camera Car Change → Affected Hooks Recalculate → Widgets Re-render → UI Updates
```

## Performance Considerations (APR.Opponents Inspired)

### Frame-Based Update Strategy
```typescript
// Implement tiered update system
interface UpdateCycles {
  telemetry: 60; // 60Hz for live telemetry
  cameraCarDetection: 30; // 30Hz for camera car changes
  relatives: 10; // 10Hz for relative calculations
  standings: 5; // 5Hz for standings updates
}
```

### Calculation Optimization
- **Memoization**: Cache relative calculations until camera car changes
- **Selective updates**: Only recalculate affected widgets when camera car changes
- **Debouncing**: Prevent rapid camera car change processing (200ms delay)
- **Frame counters**: Use modulo operations to control update frequencies

### Memory Management
- **Competing drivers**: Use pre-filtered CompetingDrivers to reduce processing
- **Telemetry arrays**: Leverage existing CarIdx indexing patterns
- **Change detection**: Minimal overhead for camera car tracking with frame-based checks

## Error Handling (Enhanced)

### Missing Camera Car Data
- **Scenario**: `CamCarIdx` points to invalid car index or not in CompetingDrivers
- **Fallback**: Use player car index as camera car
- **Validation**: Check if camera car exists in CompetingDrivers array
- **User feedback**: Silent fallback, log warning with car index details

### Spectator Mode Detection
- **Scenario**: Unable to determine spectator vs player mode
- **Fallback**: Assume player mode (existing behavior)
- **Validation**: Verify CamCarIdx and DriverCarIdx are valid numbers
- **User feedback**: No change in UI behavior

### Performance Degradation
- **Scenario**: Processing all competing drivers impacts performance
- **Mitigation**: Frame-based updates, use CompetingDrivers pre-filtering
- **Monitoring**: Performance metrics for spectator mode with frame timing
- **Fallback**: Reduce update frequencies if frame rate drops

## Testing Strategy

### Unit Tests
- Camera car detection logic with CompetingDrivers data
- Relative calculations using APR.Opponents algorithm
- Frame-based update cycle behavior
- Widget prop handling with optional focus car

### Integration Tests
- End-to-end spectator mode workflow with CompetingDrivers
- Camera car change handling with performance monitoring
- CompetingDrivers vs Drivers data consistency

### Performance Tests
- Frame rate impact measurement
- Memory usage with competing drivers processing
- Update frequency optimization validation

### Manual Testing
- Live spectator mode during iRacing sessions
- Replay mode validation with camera switching
- Widget behavior verification with filtered driver data

## Security Considerations
- **Data isolation**: No additional external data access required
- **Input validation**: Validate `CamCarIdx` bounds and existence in CompetingDrivers
- **State management**: Prevent camera car state corruption with proper validation
- **Data filtering**: Trust iRacing's CompetingDrivers filtering but validate indices

## Implementation Phases

### Phase 1: Core Data Layer
- Extend SessionStore with CompetingDrivers and camera car tracking
- Add frame-based camera car detection
- Implement basic spectator mode identification
- Add performance monitoring hooks

### Phase 2: Widget Extensions
- Update Standings component to use CompetingDrivers data
- Implement APR.Opponents relative calculation algorithm
- Add TrackMap highlighting with camera car support
- Implement Input component hiding in spectator mode

### Phase 3: Performance Optimization
- Implement frame-based update cycles
- Add debouncing for camera car changes
- Optimize relative calculations with memoization
- Add performance monitoring and metrics

### Phase 4: Testing & Validation
- Comprehensive test coverage including performance tests
- Live testing with iRacing in spectator mode
- Documentation updates with CompetingDrivers patterns
- Performance benchmarking against APR.Opponents patterns