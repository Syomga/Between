# Between

Between is a real-time messenger for cross-national communication where users always chat in their native language.  
Messages are translated by AI for the receiver, while cultural references are highlighted with inline explanations.

## Stack

- Client: React + TypeScript + Vite + Tailwind + Zustand + Socket.io client
- Server: Node.js + Express + TypeScript + Prisma + SQLite + JWT (httpOnly cookie)
- Realtime: Socket.io
- AI: AnyModel ([anymodel.org](https://anymodel.org/)) with model `cx/gpt-5.4`

## Features

- Registration with country and native language
- JWT auth with httpOnly cookie
- User search, random match, country preferences
- AI translation and cultural highlights
- File attachments, emoji picker, in-chat search
- Light/dark theme
- Mobile-friendly layout


