# Requirements for OBS Widget Integration

## Overview
Add OBS integration to irdashies by exposing each dashboard widget as individual HTTP URLs that streamers can use as browser sources in OBS. This allows streamers to add real-time iRacing data widgets to their stream overlays with complete flexibility in positioning and sizing.

## User Stories

### Primary Users
- **Streamers** - All types of racing content creators, broadcasters, team members, and educational creators

### Core User Stories
- As a **streamer**, I want to add individual irdashies widgets to OBS as browser sources so that I can create professional racing overlays
- As a **streamer**, I want each widget to display real-time iRacing data so that my viewers see live race information
- As a **streamer**, I want widgets to have transparent backgrounds so that they integrate seamlessly with my stream layout
- As a **streamer**, I want to easily find widget URLs in the irdashies settings so that I can quickly set up my OBS scenes
- As a **streamer**, I want widgets to work independently so that I can position and resize them freely in OBS

## Acceptance Criteria

### AC1: Individual Widget HTTP Endpoints
- WHEN irdashies is running THEN each widget SHALL be accessible via individual HTTP URLs
- WHEN accessing a widget URL THEN the widget SHALL render as a standalone component
- WHEN widgets are accessed THEN they SHALL display the same component as in the main irdashies dashboard

### AC2: Real-time Data Updates
- WHEN widget is loaded in OBS browser source THEN it SHALL connect to real-time iRacing data
- WHEN iRacing data changes THEN widget SHALL update automatically without page refresh
- WHEN multiple widgets are used simultaneously THEN all SHALL receive real-time updates

### AC3: OBS Browser Source Compatibility
- WHEN widget is added as OBS browser source THEN it SHALL render correctly
- WHEN widget is displayed THEN background SHALL be transparent for overlay use
- WHEN multiple widgets are used THEN they SHALL not interfere with each other

### AC4: Settings Integration
- WHEN user opens irdashies settings THEN widget URLs SHALL be displayed
- WHEN HTTP server is running THEN URLs SHALL be easily copyable for OBS setup
- WHEN server is stopped THEN settings SHALL indicate widgets are unavailable

### AC5: All Widget Support
- WHEN feature is enabled THEN ALL current widgets SHALL be available via HTTP
- WHEN new widgets are added to irdashies THEN they SHALL automatically be available via HTTP
- WHEN widgets include: Standings, TrackMap, Weather, Input, FasterCarsFromBehind, Relatives

### AC6: Performance Requirements
- WHEN multiple widgets are active THEN main irdashies performance SHALL not be impacted
- WHEN widgets are running in OBS THEN they SHALL not cause frame rate drops
- WHEN no OBS browser sources are active THEN HTTP server SHALL have minimal resource usage

## Nice to Have Features

## Constraints
- **Security**: HTTP server must only bind to localhost to prevent external access
- **Performance**: Multiple browser sources must not impact main application performance
- **Compatibility**: Must work with OBS Browser Source plugin
- **Architecture**: HTTP server must integrate cleanly with existing Electron app structure

## Out of Scope
- **Theme customization** - No custom themes or advanced styling options
- **External access** - No remote access or network streaming capabilities
- **Widget collections** - No grouping or bundling of widgets
- **Advanced configuration** - No per-widget detailed customization options

## Success Criteria
1. **Easy setup** - Streamers can add widgets to OBS in under 2 minutes
2. **Real-time performance** - Widgets update smoothly without lag or frame drops
3. **Reliable operation** - Widgets work consistently during long streaming sessions
4. **Community adoption** - Racing streamers actively use irdashies widgets in their overlays
5. **Zero impact** - Existing irdashies functionality remains unaffected