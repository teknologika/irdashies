# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start application**: `npm start` (runs prestart script to ensure tracks)
**Testing**: `npm run test` (Vitest with coverage)
**Linting**: `npm run lint` (ESLint with flat config)
**Storybook**: `npm run storybook` (Component development environment)
**Package**: `npm run package` (Create .exe)
**Make installer**: `npm run make` (Create .exe and installer)
**Generate assets**: `npm run generate-assets` (Generate track assets using tsx)

# Development tools

**spec_server**: use the spec_server tools and structured_thinking to research and design new features.

## Architecture Overview

This is an Electron application for iRacing overlays built with React and TypeScript.

**Core Structure**:
- `src/app/` - Electron main process (Node.js backend)
- `src/frontend/` - React renderer process (UI components)
- `src/types/` - Shared TypeScript types between frontend/backend

**Key Architectural Rules**:
- Frontend components MUST NOT import from `src/app/` (Electron-specific modules)
- Communication between frontend/backend happens via IPC and shared types
- Mock SDK available for macOS development (Windows-only iRacing SDK mocked)

**Data Flow**:
- iRacing SDK → Bridge → IPC → React components
- State management via Zustand stores and React Context
- Real-time telemetry data flows through TelemetryStore and SessionStore

**Import Aliases** (tsconfig.json):
- `@irdashies/types` → `./src/types`
- `@irdashies/context` → `./src/frontend/context`
- `@irdashies/utils/*` → `./src/frontend/utils/*`
- `@irdashies/storybook` → `./.storybook`

## Development Environment

**Platform Support**:
- Windows: Full iRacing SDK integration
- macOS: Mock SDK with sample data for UI development

**Requirements**:
- Node.js v20+
- Windows build tools (Windows only)
- iRacing installed (Windows only)

**Testing**: Uses Vitest with coverage and React Testing Library
**Storybook**: Available for isolated component development
**Native Dependencies**: C++ iRacing SDK bindings in `src/app/irsdk/native/`