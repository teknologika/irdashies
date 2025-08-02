# Implementation Tasks for Spectator Mode & Competitors Support

## Setup and Infrastructure

- [ ] 1. Add camera telemetry hooks to shared context
  - [ ] 1.1. Create `useCamCarIdx()` hook using existing `useTelemetryValue` pattern
  - [ ] 1.2. Create `useCamCameraState()` hook for camera state tracking
  - [ ] 1.3. Add camera change detection with debouncing (200ms)
  - [ ] 1.4. Add unit tests for camera telemetry hooks

- [ ] 2. Extend SessionStore with spectator support
  - [ ] 2.1. Create `useCompetingDrivers()` hook that filters `!IsSpectator && CarIdx >= 0`
  - [ ] 2.2. Create `useIsSpectatorMode()` hook comparing `playerCarIdx !== cameraCarIdx`
  - [ ] 2.3. Create `useCameraCarDriver()` hook to get driver object for camera car
  - [ ] 2.4. Add performance monitoring for spectator hooks
  - [ ] 2.5. Add unit tests for spectator detection and filtering

## Core Functionality - Data Layer

- [ ] 3. Implement APR.Opponents relative calculation algorithm
  - [ ] 3.1. Create `calculateLapDistToCameraCar()` utility function with track wrapping logic
  - [ ] 3.2. Create `useRelativeToCamera()` hook for camera-car-based calculations
  - [ ] 3.3. Add memoization for relative calculations until camera car changes
  - [ ] 3.4. Add unit tests for relative calculation edge cases (track wrapping)

- [ ] 4. Extend existing driver hooks with camera car support
  - [ ] 4.1. Modify `useDriverStandings()` to accept optional `focusCarIdx` parameter
  - [ ] 4.2. Modify `useDriverRelatives()` to accept optional `focusCarIdx` parameter
  - [ ] 4.3. Ensure backward compatibility with default to player car index
  - [ ] 4.4. Add integration tests for focus car parameter handling

## Widget Extensions

- [ ] 5. Update Standings component for spectator mode
  - [ ] 5.1. Add camera car highlighting in standings list
  - [ ] 5.2. Use `useCompetingDrivers()` when in spectator mode
  - [ ] 5.3. Add visual indicator for current camera car
  - [ ] 5.4. Handle empty competing drivers gracefully
  - [ ] 5.5. Add Storybook stories for spectator mode standings

- [ ] 6. Update Relatives component for camera car perspective
  - [ ] 6.1. Use camera car as reference point when in spectator mode
  - [ ] 6.2. Implement APR.Opponents gap calculation algorithm
  - [ ] 6.3. Add smooth transitions when camera car changes
  - [ ] 6.4. Update relative positioning logic for camera car focus
  - [ ] 6.5. Add Storybook stories for camera car relatives

- [ ] 7. Update TrackMap component with enhanced highlighting
  - [ ] 7.1. Add `highlightCameraCarIdx` prop for camera car highlighting
  - [ ] 7.2. Add `highlightLeaderCarIdx` prop for leader highlighting
  - [ ] 7.3. Implement distinct colors: player (existing), camera car (new), leader (new)
  - [ ] 7.4. Update trackmap drawing utilities for multiple highlight types
  - [ ] 7.5. Add Storybook stories for enhanced trackmap highlighting

- [ ] 8. Update FasterCarsFromBehind for spectator mode
  - [ ] 8.1. Use camera car position for "behind" calculations when spectating
  - [ ] 8.2. Filter competing drivers instead of all drivers
  - [ ] 8.3. Update alert logic to work from camera car perspective
  - [ ] 8.4. Add configuration option to enable/disable in spectator mode

- [ ] 9. Update Input component with spectator mode hiding
  - [ ] 9.1. Hide input displays when `isSpectatorMode === true`
  - [ ] 9.2. Show "Input data not available in spectator mode" message
  - [ ] 9.3. Add smooth transitions for show/hide behavior
  - [ ] 9.4. Add Storybook story for spectator mode input display

## Performance Optimization

- [ ] 10. Implement frame-based update system
  - [ ] 10.1. Create `useFrameCounter()` hook for performance optimization
  - [ ] 10.2. Implement tiered update frequencies (60Hz→30Hz→10Hz→5Hz)
  - [ ] 10.3. Add camera car change debouncing to prevent UI thrashing
  - [ ] 10.4. Add performance metrics collection for spectator mode

- [ ] 11. Optimize calculations and memory usage
  - [ ] 11.1. Add memoization for expensive relative calculations
  - [ ] 11.2. Implement selective recalculation only for affected widgets
  - [ ] 11.3. Cache competing drivers filtering until session changes
  - [ ] 11.4. Add memory usage monitoring for spectator mode

## Error Handling and Edge Cases

- [ ] 12. Add robust error handling for camera car data
  - [ ] 12.1. Handle invalid `CamCarIdx` values (fallback to player car)
  - [ ] 12.2. Handle camera car not found in competing drivers list
  - [ ] 12.3. Add validation for camera car index bounds
  - [ ] 12.4. Add warning logs for camera car data issues

- [ ] 13. Handle spectator mode detection edge cases
  - [ ] 13.1. Handle missing or invalid telemetry data
  - [ ] 13.2. Handle session transitions (practice→qualify→race)
  - [ ] 13.3. Add graceful degradation when spectator features fail
  - [ ] 13.4. Handle rapid camera car switching

## Testing

- [ ] 14. Unit tests for spectator mode functionality
  - [ ] 14.1. Test camera telemetry hooks with mock data
  - [ ] 14.2. Test competing drivers filtering logic
  - [ ] 14.3. Test relative calculation algorithm accuracy
  - [ ] 14.4. Test spectator mode detection logic
  - [ ] 14.5. Test error handling and fallback scenarios

- [ ] 15. Integration tests for end-to-end workflows
  - [ ] 15.1. Test camera car switching with widget updates
  - [ ] 15.2. Test performance impact measurement
  - [ ] 15.3. Test competing drivers vs all drivers data consistency
  - [ ] 15.4. Test spectator mode with real iRacing test data

- [ ] 16. Manual testing and validation
  - [ ] 16.1. Test with live iRacing spectator mode
  - [ ] 16.2. Test with iRacing replay mode
  - [ ] 16.3. Validate widget behavior with camera switching
  - [ ] 16.4. Test performance with multiple competing drivers
  - [ ] 16.5. Validate accuracy against APR.Opponents plugin behavior

## Documentation and Polish

- [ ] 17. Update documentation and examples
  - [ ] 17.1. Document new spectator mode hooks and usage patterns
  - [ ] 17.2. Update component documentation with spectator mode features
  - [ ] 17.3. Add usage examples for spectator mode
  - [ ] 17.4. Document performance considerations and best practices

- [ ] 18. Add settings and configuration options
  - [ ] 18.1. Add spectator mode enable/disable setting
  - [ ] 18.2. Add camera car highlighting color customization
  - [ ] 18.3. Add performance tuning options (update frequencies)
  - [ ] 18.4. Add debug mode for spectator mode troubleshooting

## Final Validation

- [ ] 19. Performance benchmarking and optimization
  - [ ] 19.1. Benchmark spectator mode vs player mode performance
  - [ ] 19.2. Optimize any performance bottlenecks found
  - [ ] 19.3. Validate zero impact on existing player mode functionality
  - [ ] 19.4. Compare accuracy with APR.Opponents plugin

- [ ] 20. Production readiness checklist
  - [ ] 20.1. All tests passing with spectator mode enabled
  - [ ] 20.2. Performance metrics within acceptable ranges
  - [ ] 20.3. Error handling tested with edge cases
  - [ ] 20.4. Documentation complete and accurate
  - [ ] 20.5. Feature flag or setting available for gradual rollout