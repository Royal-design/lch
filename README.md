# Leenah Contribution Home

Leenah Contribution Home (LCH) is a Next.js and Supabase fintech workspace for contribution plans, wallets, role-aware member/admin dashboards, notifications, and admin operations.

## Project Docs

- Current project status: [`PROJECT_STATUS.md`](PROJECT_STATUS.md)
- Current role migration: [`database-mile-11-profile-roles-array.sql`](database-mile-11-profile-roles-array.sql)

## Current Stack

- Next.js App Router
- Supabase Auth, Postgres, RLS, and Realtime
- React Query
- Zustand
- shadcn-style local UI components

## Development

```bash
npm install
npm run dev
```

For normal checks, use:

```bash
npm.cmd run lint
```

`npm.cmd run build` is intentionally not part of the default check flow because it is slow in this project. Run it only when a production validation is specifically needed.

## Database Notes

Apply the SQL milestone files in order for a fresh database. The current role model stores assigned roles on `profiles.roles text[]`, with `active_role` representing the current selected mode.

After applying `database-mile-11-profile-roles-array.sql`, verify:

```sql
select id, email, role, active_role, roles
from public.profiles
order by created_at desc;
```
