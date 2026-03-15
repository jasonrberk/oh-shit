# Oh Shit! - Card Game Companion

## Project Overview
A mobile-first web app for the "Oh Shit!" card game.
- allows a player to create and manage a scorecard used during an in-person session.
- allows the other players to view the scorecard from their phones (read only via invite)
- allows a group to play Oh Shit! online asynchronously

Game plan and rules can be found in [GAME_PLAY_AND_RULES.md](./GAME_PLAY_AND_RULES.md)

## Tech Stack
- Runtime: Bun
- Build: Vite
- UI: React + Tailwind CSS
- Auth: Clerk (social login via Google, Apple, Facebook)
  - At no point should this software maintain any form of user credential
- Backend/DB: Convex (real-time document database + serverless functions)

## Development
- `bun dev` — starts Vite dev server on port 5173 with --host 0.0.0.0 (accessible on local network)
- `bunx convex dev` — starts Convex sync watcher (run in separate terminal)
- Both must be running simultaneously during development
- please read and follow [convex_rules.txt](./convex_rules.txt) any time you are working on convex components.