# LCH Project Status

Last updated: May 21, 2026

## Current Product Shape

Leenah Contribution Home is a Next.js fintech workspace for members and admins. The app currently supports authentication, profile management, wallet/contribution views, admin operations, notifications, role switching, and Supabase-backed data APIs.

The project is using:

- Next.js App Router
- Supabase Auth, Postgres, RLS, and Realtime
- React Query for client data fetching/invalidation
- Zustand for auth/profile state
- shadcn-style local UI components

## Implemented So Far

### Public/Auth

- Landing page and auth redirects.
- Email/password login, signup, forgot password, reset password, and auth callback handling.
- Suspended account blocking.
- Auth profile hydration through `/api/auth/me`.
- Role-aware routing between `/dashboard` and `/admin`.

### Role System

- Multi-role account support in the UI.
- Active role switching through the navbar role switcher.
- Admin user role assignment now supports multiple selected roles.
- Current direction: assigned roles live on `profiles.roles text[]`.
- `active_role` remains the current mode.
- Legacy `role` remains as a compatibility/current-role fallback.
- `user_roles` is no longer needed by the app after the `profiles.roles` migration is applied.

### Member Dashboard

- Dashboard overview with wallet, locked balance, contribution plans, and recent transactions.
- Create contribution plans.
- Add contribution records to plans.
- Contribution history.
- Contribution leaderboard.
- Wallet page and withdrawal request form UI.
- Profile dialog and account deletion flow.
- Notifications page and realtime notification sync.

### Admin

- Admin shell with sidebar/mobile nav, topbar, profile dialog, theme toggle, and role switcher.
- Admin overview with KPIs and charts.
- Users table with search, status filter, role filter, balances, status actions, delete action, and multi-role assignment.
- Roles CRUD page.
- Transactions page with filters.
- Contributions page with summaries and records.
- Contribution plans management.
- Ajo types management.
- Leaderboard page.
- Analytics page.
- Notifications page for announcements.
- Settings page is present but mostly static/config placeholder.

### Database/Backend

- Base schema for profiles, wallets, transactions, contribution plans, and notifications.
- RLS policies for member/admin access patterns.
- Server route protection via `requireActiveUser` and `requireAdmin`.
- Admin service client usage for trusted operations.
- Contribution RPC/milestone patches.
- Notification creation and email hooks.
- Realtime publication patches for notifications, contribution sync, and profile role sync.

## Recent Important Decisions

### Roles

We are moving away from `public.user_roles` as the active role assignment store.

Current intended model:

- `profiles.roles`: all roles assigned to a user, for example `{'user','admin'}`.
- `profiles.active_role`: the currently selected role/mode.
- `profiles.role`: legacy/current fallback, kept in sync with `active_role`.

Run `database-mile-11-profile-roles-array.sql` after previous migrations. Once `profiles.roles` is confirmed correct for all users, `public.user_roles` can be dropped.

### Build Checks

Do not run `npm.cmd run build` by default because it is slow in this project. Use `npm.cmd run lint` for normal edits. Run build only when explicitly requested or when a risky routing/server change needs production validation.

## Migration Files To Know

- `database-setup.sql`: base schema and policies.
- `database-auth-miles-1-2.sql`: auth/admin access updates.
- `database-miles-3-4.sql`: earlier role/status updates.
- `database-mile-6-contributions.sql`: contribution plan/funding backend.
- `database-mile-7-notifications.sql`: notifications and realtime setup.
- `database-mile-8-realtime-contribution-sync.sql`: realtime for contribution/admin sync.
- `database-mile-9-multi-role-active-role.sql`: first multi-role support using `user_roles`.
- `database-mile-10-realtime-role-sync.sql`: realtime profile role sync.
- `database-mile-11-profile-roles-array.sql`: current preferred roles model on `profiles.roles`.
- `database-mile-12-paystack-wallet-deposits.sql`: Paystack wallet deposit fields and atomic wallet crediting.
- `database-mile-13-withdrawals-flexible-lock.sql`: withdrawal request/reserve/approve/reject functions and flexible plan withdrawal access.

## Remaining Work

### High Priority

- Apply and verify `database-mile-11-profile-roles-array.sql` in Supabase.
- Confirm every profile has the expected `roles` array.
- Drop `public.user_roles` after verification if rollback/audit is not needed.
- Update any remaining database policies or helper functions that assume only `role`/`active_role`.
- Confirm `public.is_admin` still matches the desired authorization model.

### Payments/Wallets

- Paystack wallet deposit initialization, verification, webhook handling, and wallet crediting are now wired in code.
- Apply `database-mile-12-paystack-wallet-deposits.sql` before testing deposits.
- Configure Paystack callback URL as `/dashboard/wallet/deposit/callback`.
- Configure Paystack webhook URL as `/api/paystack/webhook`.
- Withdrawal request backend and admin approval/rejection workflow are now wired.
- Apply `database-mile-13-withdrawals-flexible-lock.sql` before testing withdrawals.
- Paystack Transfers or another payout rail still needs to be wired later for automatic bank payouts.
- Add transaction references and reconciliation rules for withdrawal payout callbacks when transfer automation is added.
- Add wallet ledger integrity checks so balance changes are auditable.

### Contribution/Ajo Product

- Finish Ajo group lifecycle beyond admin-created type templates.
- Implement group membership rules, member limits, payout order, maturity handling, and owner-controlled withdrawals.
- Flexible/no-lock plans can now be created with `withdrawal_access = 'anytime'`.
- Add better validation for contribution frequency and maturity-only lock rules.
- Add plan close/cancel flows with wallet impact.

### Admin Operations

- Make settings page functional.
- Add admin audit logs for sensitive actions: role changes, suspensions, deletions, wallet adjustments, plan locks.
- Add safer delete/suspend rules for admin accounts.
- Add export/download for users, transactions, contributions, and statements.
- Add richer filters and pagination consistency across admin pages.

### Security/Compliance

- Review all RLS policies after the `profiles.roles` migration.
- Ensure no client can directly mutate privileged fields such as `roles`, `role`, `active_role`, `status`, or balances.
- Add rate limiting or abuse protection for auth and password reset routes.
- Confirm email templates do not leak sensitive details.
- Consider session revocation behavior for deleted/suspended users.

### UX/Polish

- Replace remaining placeholder/static dashboard data where present.
- Improve empty states and loading states across admin/member pages.
- Confirm mobile layout for admin tables and role dialogs.
- Add clearer role labels/descriptions in role assignment UI.
- Add confirmation copy for risky admin actions.

### Testing

- Add route handler tests for auth, role switching, admin role updates, status updates, and contribution funding.
- Add component tests for role switcher and admin users role dialog.
- Add migration verification SQL snippets.
- Add end-to-end smoke flow: signup, login, create plan, add contribution, admin role change, switch role.

## Suggested Next Steps

1. Apply `database-mile-11-profile-roles-array.sql`.
2. Verify profile roles:

```sql
select id, email, role, active_role, roles
from public.profiles
order by created_at desc;
```

3. Test admin role assignment from `/admin/users`.
4. Test navbar role switcher without refreshing.
5. If all good, drop `public.user_roles` with a small cleanup migration.
