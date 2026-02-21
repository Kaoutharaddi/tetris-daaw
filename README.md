# Tetris DAAW

A full-stack multiplayer Tetris project built with:

- **Frontend:** React + Vite + Firebase Realtime Database
- **Backend:** Spring Boot + JPA + H2 (in-memory) for historical ranking

The app supports real-time multiplayer sessions (lobby, shared game state, attacks, last match results) and persists top scores through a REST API.

## Features

- Multiplayer lobby with connected players list
- Real-time synchronization through Firebase Realtime Database
- Match controls: start, pause, resume, game over handling
- Attack system (garbage lines) between players
- Historical ranking (Top 10) stored through Spring Boot API
- Keyboard controls for classic Tetris gameplay

## Project Structure

```text
tetris-daaw/
├─ tetris-frontend/    # React + Vite client
└─ tetris-backend/     # Spring Boot REST API for ranking
```

## Tech Stack

### Frontend (`tetris-frontend`)

- React 19
- Vite 7
- Firebase 12 (Realtime Database)
- React Router DOM

### Backend (`tetris-backend`)

- Java 17
- Spring Boot 4
- Spring Web MVC
- Spring Data JPA
- H2 Database

## Prerequisites

Make sure you have installed:

- **Node.js** (recommended LTS)
- **npm**
- **Java 17**
- **Maven** (or use the included Maven Wrapper `mvnw` / `mvnw.cmd`)

## Running the Project Locally

Run backend and frontend in two separate terminals.

### 1) Start Backend

From the repository root:

```bash
cd tetris-backend
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
cd tetris-backend
.\mvnw.cmd spring-boot:run
```

Backend default URL: `http://localhost:8080`

Optional H2 console:

- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:tetrisdb`
- User: `sa`
- Password: *(empty)*

### 2) Start Frontend

From the repository root:

```bash
cd tetris-frontend
npm install
npm run dev
```

Frontend runs with Vite (typically on `http://localhost:5173`).

## Frontend Environment Configuration

The frontend reads the backend base URL from:

- `VITE_API_BASE_URL` (optional)

If not provided, it defaults to:

- `http://localhost:8080`

Example `.env` file in `tetris-frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## REST API (Ranking)

Base URL: `http://localhost:8080`

### `GET /ranking`

Returns Top 10 scores ordered by cleared lines descending.

### `POST /ranking`

Creates a score entry.

Request body example:

```json
{
  "nombre": "Alice",
  "nivel": 4,
  "lineas": 27
}
```

Example with `curl`:

```bash
curl -X POST http://localhost:8080/ranking \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Alice","nivel":4,"lineas":27}'
```

## Gameplay Controls

- `←` / `→`: Move piece
- `↑`: Rotate piece
- `↓`: Soft drop
- `Space`: Hard drop
- `P`: Pause / resume
- `Enter`: Start a new match from lobby

## Useful Scripts

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Backend

```bash
./mvnw test
./mvnw spring-boot:run
```

Windows equivalents:

```powershell
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

## Notes

- CORS is currently configured to allow all origins in backend (`allowedOriginPatterns("*")`).
- Ranking data is stored in an in-memory H2 database, so it resets when backend restarts.
- Multiplayer state is stored in Firebase Realtime Database.

## License

This project is for educational purposes.
