# GEMINI.md

## Project Overview

This project is a collaborative dice roller web application. It allows multiple users to join rooms, roll various types of dice, and see a history of the rolls. The frontend is built with Vue 3, TypeScript, and Vite, and it communicates with a Node.js/Express backend.

The application supports simple dice rolls (D4, D6, D8, D10, D12, D20, D100) as well as more complex, formula-based "Action Rolls" that can incorporate weapon and mastery ranks. It also features user identification, room creation/selection, and a detailed roll history. The application state (user name, active room) is persisted across sessions using `localStorage`.

## Building and Running

The following commands are available for building and running the project:

*   **`pnpm dev`**: Starts the development server with hot-reloading.
*   **`pnpm build`**: Builds the application for production.
*   **`pnpm preview`**: Serves the production build locally for previewing.

The backend API is expected to be running at the location specified by the `VITE_API_BASE_URL` environment variable, which defaults to `http://localhost:3001/api`.

## Development Conventions

*   **Framework**: The project uses Vue 3 with the Composition API.
*   **Language**: The codebase is written in TypeScript.
*   **Styling**: The application is styled using Tailwind CSS.
*   **Build Tool**: Vite is used for development and building.
*   **State Management**: The application uses a combination of `localStorage` for persistent state and reactive state management within Vue components.
*   **API Interaction**: The `useApiCache` composable is used for caching API responses.
*   **Code Structure**:
    *   `components/`: Contains reusable Vue components.
    *   `composables/`: Contains Vue Composition API functions for reusable logic.
    *   `App.vue`: The main application component.
    *   `main.ts`: The entry point of the application.
    *   `types.ts`: Contains TypeScript type definitions.
    *   `constants.ts`: Contains application-wide constants.
