# Money Tracker — Web

React SPA for the [Money Tracker API](../../nodejs/money-tracker). UI in Spanish.

## Stack

Vite 8 · React 19 · TypeScript 7 (strict) · React Router 8 (data mode) · MUI 9 + MUI X Charts / Date Pickers ·
TanStack Query 5 · Zustand 5 · React Hook Form + zod 4 · axios · notistack · Biome · Vitest + Testing Library + MSW.

## Requirements

- Node 22+ (tested on 23.11)
- The backend running at `http://localhost:3000` with `http://localhost:5173` in its `ALLOWED_ORIGINS`.

## Setup

```bash
npm install
cp .env.example .env          # VITE_API_URL, defaults to http://localhost:3000
npm run gen:api               # generates src/api/schema.d.ts from api/openapi.yaml
npm run dev                   # http://localhost:5173
```

Seed user: `demo@example.com` / `Demo12345`.

## Scripts

| Script | What it does |
| --- | --- |
| `dev` | Vite dev server on port 5173 |
| `build` | Typecheck and build to `dist/` |
| `preview` | Serve the production build |
| `typecheck` | `tsc -b` |
| `lint` / `format` | Biome check / check with fixes |
| `test` / `test:watch` | Vitest |
| `gen:api` | Regenerate API types from the contract |

## API contract

`api/openapi.yaml` is a copy of the backend contract. Whenever the backend changes it, copy it again and run
`npm run gen:api`. All DTO types and enums come from the generated file (`src/api/types.ts`).

`gen:api` runs openapi-typescript through `npx` with TypeScript 5, because TypeScript 7 no longer ships the JS
compiler API that openapi-typescript uses.

## Auth model

- Access token (15 min) lives in memory; the refresh token is persisted in `localStorage`.
- A 401 on a non-auth endpoint triggers one shared refresh (single-flight, since the backend rotates refresh tokens)
  and the request is retried once. If refresh fails, the session is cleared and the app goes to `/login`.
- On boot, a stored refresh token is exchanged and `/me` is loaded before routes render.

> Security note: a refresh token in `localStorage` is readable by any injected script. The stronger setup is an
> httpOnly cookie set by the backend.
