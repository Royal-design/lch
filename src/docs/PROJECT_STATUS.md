# LCH Project Status

Last updated: May 21, 2026

## Current Product Shape

Leenah Contribution Home is a Next.js fintech workspace for members and admins. The app currently supports authentication, profile management, wallet/contribution views, admin operations, notifications, role switching, Paystack wallet deposits, and Supabase-backed data APIs.

## Implemented So Far

- Public landing page and auth redirects.
- Email/password signup, login, forgot password, reset password, and auth callback handling.
- Suspended account blocking.
- Role-aware member/admin routing.
- Multi-role account UI with active role switching.
- Admin user multi-role assignment.
- Member dashboard with wallet, contribution plans, recent transactions, notifications, and profile flows.
- Admin overview, users, roles, transactions, contributions, plans, Ajo types, leaderboard, analytics, notifications, and settings shell.
- Paystack wallet deposit initialization, callback verification, webhook handling, and atomic wallet crediting.
- Supabase schema, RLS policies, server route guards, admin service client usage, contribution RPCs, notification hooks, and realtime sync patches.

## Current Role Model

- `profiles.roles`: all assigned roles.
- `profiles.active_role`: current selected mode.
- `profiles.role`: legacy/current fallback kept in sync with `active_role`.
- `public.user_roles` is no longer needed after `database-mile-11-profile-roles-array.sql` is applied and verified.

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

## Paystack Setup

Required env vars:

```env
PAYSTACK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx
NEXT_PUBLIC_APP_URL=https://your-deployed-domain.com
```

Paystack dashboard URLs:

```txt
Test Callback URL: https://your-deployed-domain.com/dashboard/wallet/deposit/callback
Test Webhook URL:   https://your-deployed-domain.com/api/paystack/webhook
```

Rotate the test secret key if it has been pasted into chat or committed anywhere.

## Remaining Work

### High Priority

- Apply and verify `database-mile-11-profile-roles-array.sql`.
- Apply and verify `database-mile-12-paystack-wallet-deposits.sql`.
- Apply and verify `database-mile-13-withdrawals-flexible-lock.sql`.
- Confirm every profile has the expected `roles` array.
- Drop `public.user_roles` after verification if rollback/audit is not needed.
- Confirm `public.is_admin` still matches the desired authorization model.

### Payments/Wallets

- Test Paystack deposit flow end to end in test mode.
- Configure deployed callback and webhook URLs in Paystack.
- Test withdrawal request, reserved balance, admin approval, and admin rejection.
- Add Paystack Transfers or another payout rail later for automatic bank payouts.
- Add wallet ledger integrity/audit checks.

### Contribution/Ajo Product

- Finish Ajo group lifecycle beyond admin-created templates.
- Implement group membership rules, member limits, payout order, maturity handling, and owner-controlled withdrawals.
- Add plan close/cancel flows with wallet impact.

### Admin Operations

- Make settings page functional.
- Add admin audit logs for sensitive actions.
- Add export/download for users, transactions, contributions, and statements.
- Improve filters and pagination consistency across admin pages.

### Security/Compliance

- Review RLS policies after the `profiles.roles` migration.
- Ensure clients cannot directly mutate privileged fields or balances.
- Add rate limiting or abuse protection for auth and payment routes.
- Confirm session handling for deleted/suspended users.

### Testing

- Add route handler tests for auth, role switching, admin role updates, status updates, contribution funding, and Paystack deposits.
- Add component tests for role switcher, admin users role dialog, and deposit form.
- Add end-to-end smoke flow: signup, login, deposit wallet, create plan, add contribution, admin role change, switch role.
