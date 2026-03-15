# Oh Shit! - Card Game Companion

## Project Overview
A mobile-first web app for keeping score during an in-person card game called "Oh Shit!". 
Replaces pen and paper when playing at bars/casual settings. Game plan and rules can be found in
[GAME_PLAY_AND_RULES.md](./GAME_PLAY_AND_RULES.md)

## Tech Stack
- Runtime: Bun
- Build: Vite
- UI: React + Tailwind CSS
- Auth: Clerk (social login via Google, Apple, Facebook)
- Backend/DB: Convex (real-time document database + serverless functions)

## Development
- `bun dev` — starts Vite dev server on port 5173 with --host 0.0.0.0 (accessible on local network)
- `bunx convex dev` — starts Convex sync watcher (run in separate terminal)
- Both must be running simultaneously during development