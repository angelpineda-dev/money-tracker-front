# CLAUDE.md

Frontend for the Money Tracker API (backend repo: `~/Code/nodejs/money-tracker`). UI text is Spanish.

## Commands

- `npm run dev` · `npm run build` · `npm run typecheck` · `npm run lint` · `npm test`
- `npm run gen:api` after every copy of `api/openapi.yaml` from the backend.

## Rules

- Server state goes through TanStack Query only. Zustand holds client-only state: the auth session (`authStore`)
  and UI prefs (`uiStore`). Never put API data in Zustand.
- Never hand-write DTO types or enums. Derive them from `src/api/schema.d.ts` in `src/api/types.ts`.
- All HTTP goes through `src/api/client.ts` (axios, fetch adapter). Don't create other axios instances.
- Numeric fields can arrive as strings (Prisma Decimal, notably `/api/transactions`). Coerce them in the api layer
  with `src/api/mappers.ts`, never in components.
- Show the backend `message` to the user (`errorMessage()` from `src/api/errors.ts`). 422 messages come comma-joined.
- Never add MXN and USD amounts together. Format with `src/lib/format.ts`.
- Query keys come from `src/api/queryKeys.ts`.
- Route guards are layout routes in `src/routes/guards.tsx`; pages are lazy-loaded in `src/routes/router.tsx`.
- Style: Biome, 4 spaces, single quotes, semicolons, 120 columns. Run `npm run format` before committing.

## Structure

```
api/openapi.yaml        backend contract (copied)
src/api/                client, generated schema, types, mappers, queryKeys, endpoint modules
src/app/                providers, theme, queryClient, AuthBootstrap
src/stores/             zustand stores
src/routes/             router + guards
src/layouts/            AppLayout (AppBar + Drawer), AuthLayout
src/features/<name>/    feature-specific schemas/components/hooks
src/pages/              route components (default export, lazy-loaded)
src/components/         shared UI
src/hooks/  src/lib/    shared hooks and helpers
src/test/               vitest setup + MSW server
```

## Commits

Conventional Commits: `type(scope)?: subject` with types feat, fix, docs, style, refactor, perf, test, build, ci,
chore, revert. Imperative lowercase subject, max 72 chars. Breaking changes use `!` and a `BREAKING CHANGE:` footer.

## Known backend gaps

- No `GET /api/users`, and `/me` has no `id`: the role-change screen waits on both.
- openapi.yaml says the access token lasts 4h; the backend actually uses 15m.
- `/me` doesn't say whether Telegram is linked, so Settings always offers "Desvincular".
- `operatedAt` comes back as a full ISO datetime; `mapTransaction` trims it to `YYYY-MM-DD` so time zones can't shift it.
