# الجود للسياحة والسفر | Al Jood Travel & Tourism

A full-stack luxury tourism website with bilingual (Arabic/English) support, dark gold theme, customer-facing pages, and a secure admin panel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/aljood-tourism run dev` — run the frontend (port 25491)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — admin session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + TanStack Query + Framer Motion + Tailwind v4
- API: Express 5 with pino logging
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for API contract
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks (do not edit manually)
- `lib/db/src/schema/` — Drizzle DB schema (destinations, hotels, packages, pricing_settings, admins)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/pricing.ts` — pricing formula (hidden from client)
- `artifacts/aljood-tourism/src/pages/` — customer pages (home, destinations, destination-detail)
- `artifacts/aljood-tourism/src/pages/admin/` — admin pages (login, dashboard, destinations, hotels, packages, settings)

## Architecture decisions

- Pricing formula runs server-side only; clients never see base USD prices or internal multipliers
- Session-based auth with SHA-256 password hashing (salt: `aljood_salt_2024`)
- API contract-first: OpenAPI spec → Orval codegen → typed hooks
- `numeric` Drizzle columns return strings; always `parseFloat(x as unknown as string)` when reading, `String(value)` when writing
- Admin routes guarded by session middleware; `AdminGuard` component redirects to `/admin/login` if unauthenticated

## Product

- Customer site: hero section, 13+ destination cards with pricing, filterable package listing per destination, WhatsApp booking inquiry flow
- Admin panel: dashboard stats, full CRUD for destinations/hotels/packages, pricing settings management
- WhatsApp: +962777066001

## Admin Credentials

- Username: `admin`
- Password: `admin2024`
- URL: `/admin/login`

## Gotchas

- Run `pnpm run typecheck:libs` before `api-server` typecheck if DB schema changed
- Admin package list returns `Package` type (no `finalPriceJod`); customer packages endpoint returns `PackageResult` (with computed price)
- `ListAdminPackagesParams` uses `destinationId` (number), not `destinationSlug`
- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
