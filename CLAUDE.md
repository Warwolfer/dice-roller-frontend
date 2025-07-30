# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a collaborative dice roller web application built with Vue 3 and TypeScript. Users can create rooms, roll various dice types (D4-D100), and view roll history with other users. The frontend connects to a backend API for data persistence.

## Development Commands

```bash
# Development server (runs on http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking (no dedicated script - run manually)
vue-tsc --noEmit
```

## Architecture

### Frontend Structure (Vue 3 + Vite + TypeScript)
- **App.vue**: Main application component using Composition API for state management, API calls, and view routing
- **main.ts**: Application entry point that mounts the Vue app
- **components/**: Reusable Vue SFC components (Button, DiceSelector, RoomView, etc.) - available in both .vue and .tsx formats
- **composables/**: Vue composables including useLocalStorage for state persistence
- **types.ts**: TypeScript interfaces for Room, Roll, and Dice enum
- **constants.ts**: Configuration including API base URL
- **vite.config.ts**: Vite configuration with Vue plugin and environment variable handling

### State Management Architecture
- **Local Storage Persistence**: User name and active room ID persisted via useLocalStorage composable
- **Reactive State**: Uses Vue's `reactive()` for complex state objects (roomsState, activeRoomState)
- **API State Management**: Separate loading/error states for rooms list and active room data
- **Error Handling**: Global app error state with user-dismissible error messages

### Key Data Flow
1. App.vue manages all state and API interactions using Composition API
2. State persistence handled through useLocalStorage composable
3. API calls to backend using native fetch() with proper error handling
4. Real-time updates through reactive watchers and manual refetching
5. Optimistic UI updates for smooth user experience

### API Integration
- Backend API URL configured in constants.ts (defaults to localhost:3001/api)
- REST endpoints: GET /rooms, GET /rooms/:id, POST /rooms, POST /rooms/:id/rolls
- Error handling includes network failures and HTTP error status codes
- Room not found (404) automatically clears active room from localStorage

### Component Architecture
- All components available in both Vue SFC (.vue) and TSX (.tsx) formats
- Composition API used throughout for consistency
- Props and emits properly typed with TypeScript
- Tailwind CSS for styling with dark theme design

## Development Notes

- Vue 3 with Composition API and `<script setup>` syntax
- TypeScript with strict typing throughout (tsconfig.json configured with strict mode)
- Vite for fast development and building with Vue plugin
- No testing framework currently configured
- Environment variables handled through Vite's loadEnv with GEMINI_API_KEY defined in vite.config.ts
- Path alias configured: `@/*` maps to project root