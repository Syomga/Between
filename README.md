# Between

Between is a real-time messenger for cross-national communication where users always chat in their native language.  
Messages are translated by AI for the receiver, while cultural references are highlighted with inline explanations.

## Stack

- Client: React + TypeScript + Vite + Tailwind + Zustand + Socket.io client
- Server: Node.js + Express + TypeScript + Prisma + SQLite + JWT (httpOnly cookie)
- Realtime: Socket.io
- AI: AnyModel ([anymodel.org](https://anymodel.org/)) with model `cx/gpt-5.4`

## Features

- Registration with `username`, `password`, `country`, `nativeLang`
- JWT auth with httpOnly cookie (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)
- Dialogues list persists in DB and is available after re-login
- User search by username with 300ms debounce and country-preference filtering
- Random partner matching with:
  - preferred countries filter (or "all countries")
  - different native language constraint
- Message flow:
  - save original text
  - AI translation to receiver native language
  - AI cultural highlights in JSON
  - fallback to original text on AI errors
- Toggle `Показать оригинал` per message
- Real-time delivery via Socket.io:
  - `join-dialogues`
  - `new-dialogue`
  - `send-message`
  - `new-message`

## Project Structure

```text
server/
  src/
    index.ts
    prisma/schema.prisma
    routes/
    services/
    middleware/
    socket/
    types/
client/
  src/
    pages/
    components/
    store/
    hooks/
    api/
    utils/
    types/
```

## Setup

### 1) Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2) Configure environment

Create `server/.env`:

```env
ANYMODEL_API_KEY=your_anymodel_key
JWT_SECRET=super-secret
DATABASE_URL="file:./dev.db"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173"
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:4000
```

### 3) Prisma

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 4) Run app

In terminal 1:

```bash
cd server
npm run dev
```

In terminal 2:

```bash
cd client
npm run dev
```

Open `http://localhost:5173`.
