# Leenah Contribution Home

Leenah Contribution Home (LCH) is a Next.js and Supabase fintech workspace for contribution plans, wallets, role-aware member/admin dashboards, notifications, and admin operations.

## Project Docs

- Current project status: [`PROJECT_STATUS.md`](PROJECT_STATUS.md)
- Docs copy: [`src/docs/PROJECT_STATUS.md`](src/docs/PROJECT_STATUS.md)
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

## Paystack Test Setup

Set these environment variables locally and in the deployed host:

```env
PAYSTACK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx
NEXT_PUBLIC_APP_URL=https://your-deployed-domain.com
```

Apply `database-mile-12-paystack-wallet-deposits.sql` before testing wallet deposits.
Apply `database-mile-13-withdrawals-flexible-lock.sql` before testing wallet withdrawals or flexible/no-lock contribution plans.

In the Paystack dashboard, use:

```txt
Test Callback URL: https://your-deployed-domain.com/dashboard/wallet/deposit/callback
Test Webhook URL:   https://your-deployed-domain.com/api/paystack/webhook
```
