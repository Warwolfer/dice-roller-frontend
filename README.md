[![MIT License](https://img.shields.io/github/license/alan2207/bulletproof-react)](https://github.com/alan2207/bulletproof-react/blob/master/LICENSE)

# Collaborative Dice Roller

A web application that allows multiple users to roll various types of dice in shared rooms and view a history of these rolls. The application features a React frontend and a Node.js/Express backend with an SQLite database.

## Features

*   **User Identification:** Users can set a display name.
*   **Room Creation:** Create new rooms for dice rolling.
*   **Room Selection:** Join existing rooms.
*   **Dice Rolling:** Supports D4, D6, D8, D10, D12, D20, and D100.
*   **Roll History:** View a history of rolls within each room, including who rolled, the result, dice type, timestamp, and optional comments.
*   **Persistent User Name & Active Room:** Remembers the user's name and last active room across sessions using `localStorage`.
*   **Responsive Design:** UI adapts to different screen sizes.
*   **Comments:** Users can add optional comments to their rolls, which are stored and displayed.

## Tech Stack

**Frontend:**

*   React
*   TypeScript
*   Tailwind CSS for styling

**Backend:**

*   Express.js framework
*   SQLite3 (via `better-sqlite3` library) for the database

## Getting Started

### Prerequisites

*   Node.js (v14.x or later recommended)
*   Microsoft Visual C++ Build Tools

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

### Frontend Access

1.  **Install in root directory:**
    ```bash
    npm install
    ```

2.  **Run the frontend:**
    *   For development:
        ```bash
        npm run dev
        ```
    *   For production:
        ```bash
        npm start
        ```
    The backend server will typically start on `http://localhost:5173`.
    Create an .env file and set `REACT_APP_API_BASE_URL` to your backend server address. Example is in .env.local.


## Potential Future Enhancements

*   **Real-time Collaboration:** Implement WebSockets for instant updates across all clients in a room (e.g., new rolls appear immediately for everyone).
*   **User Authentication:** A more robust user system instead of just a name.
*   **Room Management:** Features like deleting rooms or setting room passwords.
*   **Advanced Dice Mechanics:** Support for multiple dice rolls at once (e.g., "2d6"), modifiers, or custom dice.
