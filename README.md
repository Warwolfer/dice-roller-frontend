[![MIT License](https://img.shields.io/github/license/alan2207/bulletproof-react)](https://github.com/Warwolfer/collaborative-dice-roller/blob/main/LICENSE)

# Collaborative Dice Roller

A real-time collaborative web application that allows multiple users to roll various types of dice in shared rooms and view a history of these rolls. The application features a Vue 3 frontend and a Node.js/Express backend with SQLite database, WebSocket real-time updates, and RPG character integration.

## Features

### Core Functionality
*   **User Identification:** Users can set a display name with optional character integration
*   **Room Management:** Create new rooms with optional room codes, join existing rooms
*   **Real-time Collaboration:** Instant updates via WebSocket when users join rooms or make rolls
*   **Room Participants:** View all participants with creator badges and character data

### Dice Rolling System
*   **Simple Dice Rolling:** Supports D4, D6, D8, D10, D12, D20, and D100
*   **Action Rolls:** Complex formula-based rolls with weapon ranks, mastery ranks, and multiple dice types
*   **Advanced Dice Mechanics:** 
    *   Explosion dice (dice that explode on max values)
    *   Cascading explosions (explosion dice can trigger further explosions)
    *   Bonus modifiers and multipliers
    *   Raw dice tracking (separates pure dice luck from character bonuses)
*   **Roll Comments:** Mandatory comments for all rolls to provide context

### Character Integration
*   **Character Data Import:** Automatically import character stats, equipment, and masteries
*   **Avatar Display:** Show character avatars for authenticated users
*   **Equipment Integration:** Auto-populate weapon ranks from character equipment data
*   **Mastery Display:** Show character masteries and ranks in participant view

### User Interface
*   **Detailed Roll History:** View comprehensive roll history with filtering by participant
*   **Collapsible Sections:** Organized UI with expandable roll and participant sections
*   **Compact View:** Toggle between detailed and compact participant display
*   **Responsive Design:** UI adapts to different screen sizes with dark theme
*   **Persistent State:** Remembers user name and active room across sessions using `localStorage`
*   **Error Handling:** Comprehensive error handling with user-friendly messages and retry options

## Tech Stack

**Frontend:**

*   Vue 3 with Composition API
*   TypeScript
*   Vite for development and building
*   Tailwind CSS for styling

**Backend:**

*   Node.js with Express.js framework
*   WebSocket server (via `ws` library) for real-time updates
*   SQLite3 (via `better-sqlite3` library) for the database
*   Database migrations for schema management
*   Formula calculator for complex dice mechanics
*   External API integration for character data

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
    pnpm install
    ```

3.  **Run the backend server:**
    *   For development (with auto-restarting using `nodemon`):
        ```bash
        pnpm run dev
        ```
    *   For production:
        ```bash
        pnpm start
        ```
    The backend server will typically start on `http://localhost:3001`.
    The SQLite database file (`diceroller.db`) will be automatically created in the `dice-roller-backend/data/` directory, and migrations will run on the first startup.

### Frontend Setup

1.  **Install dependencies in root directory:**
    ```bash
    pnpm install
    ```

2.  **Configure environment (optional):**
    Create a `.env` file and set `VITE_API_BASE_URL` to your backend server address if different from default:
    ```env
    VITE_API_BASE_URL=http://localhost:3001/api
    ```

3.  **Run the frontend:**
    *   For development:
        ```bash
        pnpm run dev
        ```
    *   For production build:
        ```bash
        pnpm run build
        pnpm run preview
        ```
    The frontend will start on `http://localhost:5173`.


## Database Schema

The application uses SQLite with the following key tables:

*   **rooms:** Store room information including:
    *   Basic info (id, name, timestamps)
    *   Creator information (creator_name, creator_user_id)
    *   Optional room codes for private rooms
*   **rolls:** Store all roll data including:
    *   Basic roll info (id, roomId, userName, diceType, result, timestamp, comment)
    *   Action roll data (actionName, weaponRank, masteryRank, rollFormula)
    *   Roll details (rollDetails JSON, rawDiceResult for transparency)
    *   User avatars (avatarUrl)
*   **participants:** Track room participants with:
    *   User information and join timestamps
    *   Character integration data (user_id, character stats, equipment, masteries)

Database migrations are automatically applied on backend startup to keep schema up-to-date.

## API Endpoints

### REST API
*   `GET /api/rooms` - List all rooms
*   `POST /api/rooms` - Create a new room with creator information
*   `GET /api/rooms/:id` - Get room details with roll history and participants
*   `POST /api/rooms/:id/rolls` - Add a new roll to a room (dice or action)
*   `POST /api/rooms/:id/join` - Join a room as a participant
*   `GET /api/character-user/:userId` - Proxy to character API for character data
*   `GET /api/actions` - Get available action definitions
*   `GET /api/action-categories` - Get action categories

### WebSocket Events
*   **Client → Server:**
    *   `join_room` - Join a room for real-time updates
    *   `leave_room` - Leave a room
    *   `ping` - Connection heartbeat
*   **Server → Client:**
    *   `joined_room` - Confirmation of room join
    *   `new_roll` - Broadcast new roll to room participants
    *   `participant_joined` - Broadcast new participant to room
    *   `error` - Error messages
    *   `pong` - Heartbeat response

## Recent Updates

*   **WebSocket Real-time Updates:** Implemented WebSocket server for instant roll and participant updates
*   **Character Integration:** Full integration with external character API for character data, avatars, and equipment
*   **Creator Badges:** Room creators are now displayed with special badges in participant lists
*   **Mandatory Roll Comments:** All rolls now require comments for better context
*   **Participant Management:** Enhanced participant display with compact/detailed view toggle
*   **Rank Scaling Updates:** Updated mastery/weapon rank bonuses (D:10, C:15, B:25, A:30, S:40)
*   **UI Improvements:** Collapsible sections, better layout, and responsive design enhancements
*   **Database Schema Updates:** Added creator tracking, participant management, and character data storage

## Potential Future Enhancements

*   **User Authentication:** A more robust user system with accounts and permissions
*   **Room Management:** Features like deleting rooms, setting room passwords, or room moderation
*   **Custom Actions:** Allow users to create and save custom action formulas
*   **Roll Statistics:** Analytics and statistics for dice rolls and user performance
*   **Campaign Management:** Organize rooms into campaigns with persistent character progression
