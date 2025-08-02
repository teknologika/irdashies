# Requirements for Spectator Mode & Competitors Support

## Overview
Add comprehensive spectator mode support to irdashies that provides meaningful dashboard data when spectating other drivers or watching replays. The feature automatically adapts the dashboard based on the camera car (CamCarIdx) and builds relative data from the competitors structure rather than player-only perspective.

## User Stories

### Primary Users
- **Spectators** watching live iRacing events
- **Replay viewers** (who might be broadcasters) analyzing past races
- **Broadcasters/Streamers** covering racing events  
- **Team members** watching teammates race

### Core User Stories
All user types want these core capabilities:

- As a **user**, I want to see full standings when watching any driver so that I understand the complete race situation
- As a **user**, I want relatives calculated from the camera car's perspective so that I can analyze any driver's race context
- As a **user**, I want the trackmap to highlight both the leader and watched car so that I can easily identify key positions
- As a **user**, I want weather and track conditions visible while spectating so that I can provide strategy advice or commentary

## Acceptance Criteria

### AC1: Automatic Camera Car Detection
- WHEN CamCarIdx changes in the game THEN the dashboard SHALL automatically switch focus to the new camera car
- WHEN spectating any driver THEN all dashboard widgets SHALL update to show data from that driver's perspective
- WHEN in replay mode THEN the system SHALL work identically to live spectating

### AC2: Full Standings Support
- WHEN spectating any driver THEN the standings widget SHALL display the complete field
- WHEN viewing standings THEN the camera car SHALL be visually highlighted
- WHEN standings update THEN positions SHALL be accurate for all competitors

### AC3: Camera Car-Based Relatives
- WHEN spectating any driver THEN relatives SHALL be calculated from the camera car's perspective
- WHEN camera car changes THEN relative gaps SHALL recalculate automatically
- WHEN displaying relatives THEN data SHALL show cars ahead/behind the camera car

### AC4: Enhanced TrackMap
- WHEN viewing trackmap THEN the leader SHALL be highlighted in a distinct color
- WHEN viewing trackmap THEN the camera car SHALL be highlighted in a different distinct color
- WHEN camera car changes THEN trackmap highlighting SHALL update immediately

### AC5: Competitors Data Integration
- WHEN reading race data THEN the system SHALL access SessionData._DriverInfo._Drivers
- WHEN processing competitors THEN all Driver model properties SHALL be available
- WHEN calculating gaps THEN data SHALL be computed in real-time without historical dependencies

### AC6: Widget Compatibility
- WHEN spectating THEN Standings widget SHALL work with camera car focus
- WHEN spectating THEN TrackMap widget SHALL work with camera car focus  
- WHEN spectating THEN Weather widget SHALL work normally
- WHEN spectating THEN FasterCarsFromBehind SHALL work from camera car perspective
- WHEN spectating THEN Input displays SHALL be disabled/hidden (not available when not driving)

## Constraints
- Must not impact performance of existing player-focused dashboard
- Must work with existing iRacing SDK data structures
- Must integrate with current Driver model from APR.Opponents
- No historical data storage required - all calculations in real-time

## Out of Scope
- Input displays for spectated drivers (not available from iRacing)
- Manual camera car override/locking
- Historical data analysis or storage
- Driver modeling or prediction features

## Success Criteria
1. **Full standings visible** when spectating any driver
2. **Relatives calculated correctly** based on camera car position
3. **TrackMap highlights** both leader and watched car in different colors
4. **Automatic switching** works seamlessly when camera changes
5. **Zero performance impact** on existing player mode functionality