import {
  Activity,
  Bell,
  ChartNoAxesCombined,
  CircleDollarSign,
  CreditCard,
  Landmark,
  Settings,
  ShieldAlert,
  Trophy,
  Users,
  Wallet,
} from "lucide-react"

export const adminNavItems = [
  { href: "/admin", label: "Overview", icon: ChartNoAxesCombined },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/transactions", label: "Transactions", icon: CreditCard },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
  { href: "/admin/contribution-plans", label: "Contribution Plans", icon: Landmark },
  { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/admin/analytics", label: "Analytics", icon: Activity },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export const kpis = [
  { icon: Users, label: "Total Users", value: "18,420", trend: "+12.8%" },
  { icon: CircleDollarSign, label: "Total Deposits", value: "NGN 148.2M", trend: "+18.4%" },
  { icon: Wallet, label: "Total Withdrawals", value: "NGN 42.8M", trend: "-3.1%" },
  { icon: Landmark, label: "Active Plans", value: "5,284", trend: "+9.6%" },
  { icon: ShieldAlert, label: "Locked Funds", value: "NGN 91.7M", trend: "+14.2%" },
  { icon: CreditCard, label: "Pending Withdrawals", value: "34", trend: "+6 today" },
]

export const flowData = [
  { day: "Mon", deposits: 12.4, withdrawals: 4.1, users: 1200, contributions: 8.2 },
  { day: "Tue", deposits: 15.2, withdrawals: 5.3, users: 1320, contributions: 9.1 },
  { day: "Wed", deposits: 14.1, withdrawals: 3.8, users: 1410, contributions: 10.7 },
  { day: "Thu", deposits: 18.7, withdrawals: 6.2, users: 1560, contributions: 12.9 },
  { day: "Fri", deposits: 22.3, withdrawals: 7.1, users: 1725, contributions: 15.4 },
  { day: "Sat", deposits: 19.8, withdrawals: 4.9, users: 1884, contributions: 14.3 },
  { day: "Sun", deposits: 25.1, withdrawals: 8.6, users: 2070, contributions: 17.8 },
]

export const alerts = [
  ["High", "Withdrawal spike detected", "24 requests in the last hour", "2 min ago"],
  ["Medium", "Failed transfer cluster", "7 card deposits failed from one issuer", "18 min ago"],
  ["Low", "KYC review queue", "14 users awaiting manual review", "1 hr ago"],
  ["Medium", "Large wallet movement", "NGN 2.8M deposit flagged for review", "3 hrs ago"],
]

export const users = [
  ["Amina Yusuf", "amina@lch.app", "+234 801 224 1820", "NGN 842,500", "NGN 320,000", "Active", "Jan 12, 2026"],
  ["Tunde Bello", "tunde@lch.app", "+234 803 551 9002", "NGN 455,200", "NGN 180,000", "Active", "Feb 4, 2026"],
  ["Ifeoma Okeke", "ifeoma@lch.app", "+234 806 742 3910", "NGN 112,000", "NGN 0", "Suspended", "Mar 18, 2026"],
  ["Leenah Admin", "admin@lch.app", "+234 809 110 2000", "NGN 1,320,000", "NGN 920,000", "Active", "Dec 8, 2025"],
]

export const transactions = [
  ["Amina Yusuf", "Deposit", "NGN 50,000", "Successful", "LCH-TX-90231", "May 18, 2026"],
  ["Tunde Bello", "Withdrawal", "NGN 18,500", "Processing", "LCH-TX-90211", "May 17, 2026"],
  ["Ifeoma Okeke", "Contribution", "NGN 25,000", "Successful", "LCH-TX-90188", "May 16, 2026"],
  ["Leenah Admin", "Deposit", "NGN 2,800,000", "Flagged", "LCH-TX-90102", "May 15, 2026"],
]

export const withdrawals = [
  ["Amina Yusuf", "NGN 80,000", "May 18, 2026", "Pending", "NGN 522,500", "Flexible"],
  ["Tunde Bello", "NGN 18,500", "May 17, 2026", "Pending", "NGN 455,200", "Owner controlled"],
  ["Ifeoma Okeke", "NGN 45,000", "May 16, 2026", "Rejected", "NGN 112,000", "Locked"],
  ["Leenah Admin", "NGN 120,000", "May 15, 2026", "Approved", "NGN 1,320,000", "Maturity only"],
]

export const plans = [
  ["Family Ajo Circle", "Amina Yusuf", "NGN 600,000", "NGN 420,000", "Owner controlled", "70%", "Active"],
  ["Rent Savings", "Tunde Bello", "NGN 800,000", "NGN 275,000", "10 months", "34%", "Locked"],
  ["Business Capital", "Ifeoma Okeke", "NGN 500,000", "NGN 150,000", "Anytime", "30%", "Active"],
  ["School Fees", "Leenah Admin", "NGN 1,200,000", "NGN 1,200,000", "Completed", "100%", "Completed"],
]

export const leaderboard = [
  ["1", "Amina Yusuf", "NGN 1,820,000", "6", "98"],
  ["2", "Leenah Admin", "NGN 1,540,000", "5", "94"],
  ["3", "Tunde Bello", "NGN 1,110,000", "4", "88"],
  ["4", "Ifeoma Okeke", "NGN 780,000", "3", "79"],
]

export const notifications = [
  ["System update", "New withdrawal review policy is ready for admins.", "Delivered", "May 18, 2026"],
  ["Broadcast", "Contribution streak reminder sent to 1,284 users.", "Delivered", "May 17, 2026"],
  ["Alert", "Suspicious activity notice sent to compliance.", "Queued", "May 17, 2026"],
]

export async function getAdminData() {
  await new Promise((resolve) => setTimeout(resolve, 120))
  return {
    kpis,
    flowData,
    alerts,
    users,
    transactions,
    withdrawals,
    plans,
    leaderboard,
    notifications,
  }
}
