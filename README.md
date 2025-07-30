[![MIT License](https://img.shields.io/github/license/alan2207/bulletproof-react)](https://github.com/Warwolfer/collaborative-dice-roller/blob/main/LICENSE)

# Collaborative Dice Roller

A web application that allows multiple users to roll various types of dice in shared rooms and view a history of these rolls. The application features a Vue 3 frontend and a Node.js/Express backend with an SQLite database, supporting both simple dice rolls and complex action rolls with modifiers.

## Features

*   **User Identification:** Users can set a display name.
*   **Room Creation:** Create new rooms for dice rolling.
*   **Room Selection:** Join existing rooms.
*   **Simple Dice Rolling:** Supports D4, D6, D8, D10, D12, D20, and D100.
*   **Action Rolls:** Complex formula-based rolls with weapon ranks, mastery ranks, and multiple dice types.
*   **Advanced Dice Mechanics:** 
    *   Explosion dice (dice that explode on max values)
    *   Cascading explosions (explosion dice can trigger further explosions)
    *   Bonus modifiers and multipliers
    *   Raw dice tracking (separates pure dice luck from character bonuses)
*   **Detailed Roll History:** View comprehensive roll history including:
    *   Basic info: user, result, dice type, timestamp, comments
    *   Action roll details: weapon/mastery ranks, formula breakdowns
    *   Raw dice results vs final calculated results for transparency
    *   Detailed breakdown strings showing individual dice and modifiers
*   **Persistent State:** Remembers user name and active room across sessions using `localStorage`.
*   **Responsive Design:** UI adapts to different screen sizes with dark theme.
*   **Error Handling:** Comprehensive error handling with user-friendly messages and retry options.

## Tech Stack

**Frontend:**

*   Vue 3 with Composition API
*   TypeScript
*   Vite for development and building
*   Tailwind CSS for styling

**Backend:**

*   Node.js with Express.js framework
*   SQLite3 (via `better-sqlite3` library) for the database
*   Database migrations for schema management
*   Formula calculator for complex dice mechanics

## Getting Started

### Prerequisites

*   Node.js (v14.x or later recommended)
*   Microsoft Visual C++ Build Tools (Windows)

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd dice-roller-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the backend server:**
    *   For development (with auto-restarting using `nodemon`):
        ```bash
        npm run dev
        ```
    *   For production:
        ```bash
        npm start
        ```
    The backend server will typically start on `http://localhost:3001`.
    The SQLite database file (`diceroller.db`) will be automatically created in the `dice-roller-backend/data/` directory, and migrations will run on the first startup.

### Frontend Setup

1.  **Install dependencies in root directory:**
    ```bash
    npm install
    ```

2.  **Configure environment (optional):**
    Create a `.env` file and set `VITE_API_BASE_URL` to your backend server address if different from default:
    ```env
    VITE_API_BASE_URL=http://localhost:3001/api
    ```

3.  **Run the frontend:**
    *   For development:
        ```bash
        npm run dev
        ```
    *   For production build:
        ```bash
        npm run build
        npm run preview
        ```
    The frontend will start on `http://localhost:5173`.


## Database Schema

The application uses SQLite with the following key tables:

*   **rooms:** Store room information (id, name, creation timestamp)
*   **rolls:** Store all roll data including:
    *   Basic roll info (id, roomId, userName, diceType, result, timestamp, comment)
    *   Action roll data (actionName, weaponRank, masteryRank, rollFormula)
    *   Roll details (rollDetails JSON, rawDiceResult for transparency)

Database migrations are automatically applied on backend startup to keep schema up-to-date.

## API Endpoints

*   `GET /api/rooms` - List all rooms
*   `POST /api/rooms` - Create a new room
*   `GET /api/rooms/:id` - Get room details with roll history
*   `POST /api/rooms/:id/rolls` - Add a new roll to a room

## Recent Updates

*   **Raw Dice Tracking:** Added transparency between pure dice luck and character bonuses
*   **Cascading Explosions:** Explosion dice can trigger additional explosions with safety limits
*   **Enhanced Roll Display:** Detailed breakdowns showing individual dice, modifiers, and calculations
*   **Bug Fixes:** Fixed room loading issues and improved error handling
*   **Vue 3 Migration:** Migrated from React to Vue 3 with Composition API

## Potential Future Enhancements

*   **Real-time Collaboration:** Implement WebSockets for instant updates across all clients in a room
*   **User Authentication:** A more robust user system with accounts and permissions
*   **Room Management:** Features like deleting rooms, setting room passwords, or room moderation
*   **Custom Actions:** Allow users to create and save custom action formulas
*   **Roll Statistics:** Analytics and statistics for dice rolls and user performance
