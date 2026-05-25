import { useState, useEffect } from "react";
import { Link, Redirect, useLocation } from "wouter";
import { motion } from "framer-motion";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  Bell, Eye, EyeOff, Plus, Search, Wallet, MessageCircle,
  ChevronRight, ClipboardList, CheckCircle, Activity, TrendingUp,
  Loader2, Star
} from "lucide-react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useTasksApi } from "@/hooks/use-tasks-api";
import { useLocalizationStore } from "@/stores/localization-store";
import { useNotifications } from "@/hooks/use-notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GREEN = "#0C6B38";

const STATUS_COLORS: Record<string, string> = {
  open:        "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  completed:   "bg-green-50 text-green-700",
  cancelled:   "bg-red-50 text-red-700",
  published:   "bg-blue-50 text-blue-700",
  accepted:    "bg-indigo-50 text-indigo-700",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open", in_progress: "In Progress", completed: "Completed",
  cancelled: "Cancelled", published: "Open", accepted: "Assigned",
};

export default function Dashboard() {
  const { user } = useFirebaseAuth();
  const { availableBalance, escrowBalance } = useWallet();
  const { formatLocal } = useLocalizationStore();
  const { myTasks, tasksLoading } = useTasksApi();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [hideBalance, setHideBalance] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("profilePicture");
    if (saved) setProfileImage(saved);
    const handler = () => setProfileImage(localStorage.getItem("profilePicture"));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  if (!user) return <Redirect to="/auth" />;

  const displayName = user.displayName || "User";
  const firstName = displayName.split(" ")[0];
  const avatar = user.photoURL || profileImage || null;
  const initials = displayName.charAt(0).toUpperCase();

  const myPostedTasks = myTasks.filter((t) => t.requester_id === user.uid);
  const myHelperTasks = myTasks.filter((t) => t.helper_id === user.uid);
  const activeTasks = myPostedTasks.filter((t) => ["open", "in_progress"].includes(t.status));
  const completedTasks = myPostedTasks.filter((t) => t.status === "completed");
  const activeHelping = myHelperTasks.filter((t) => t.status === "in_progress");

  const recentTasks = [...myPostedTasks, ...myHelperTasks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  const quickActions = [
    { label: "Post Task",  href: "/create-request", icon: Plus,          color: GREEN,      bg: "#F0FDF4" },
    { label: "Find Tasks", href: "/discover",        icon: Search,        color: "#3B82F6",  bg: "#EFF6FF" },
    { label: "Wallet",     href: "/wallet",          icon: Wallet,        color: "#F97316",  bg: "#FFF7ED" },
    { label: "Messages",   href: "/messages",        icon: MessageCircle, color: "#8B5CF6",  bg: "#F5F3FF" },
  ];

  return (
    <MobileLayout>
      <div className="min-h-full" style={{ background: "#F8FAF8" }}>

        {/* Header */}
        <div
          className="px-5 pt-14 pb-5"
          style={{ background: `linear-gradient(155deg, ${GREEN} 0%, #0a5a30 60%, #084a27 100%)` }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border-2 border-white/30">
                <AvatarImage src={avatar || undefined} alt={displayName} />
                <AvatarFallback
                  className="text-white text-base font-bold"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white/60 text-xs font-medium">Welcome back</p>
                <h1 className="text-white font-bold text-lg leading-tight">
                  Hey, {firstName} 👋
                </h1>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                  style={{ background: "#EF4444" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </motion.button>
          </div>

          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 pointer-events-none" style={{ background: "white", transform: "translate(30%,-30%)" }} />
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-white/60 text-xs font-medium">Available Balance</p>
                  <button onClick={() => setHideBalance(!hideBalance)} className="text-white/50 hover:text-white/80">
                    {hideBalance ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                <p className="text-3xl font-bold text-white tracking-tight">
                  {hideBalance ? "₦ ••••••" : formatLocal(availableBalance)}
                </p>
                {escrowBalance > 0 && (
                  <p className="text-white/40 text-xs mt-1">
                    In escrow: {hideBalance ? "••••••" : formatLocal(escrowBalance)}
                  </p>
                )}
              </div>
              <Link href="/wallet">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl text-white"
                  style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <Wallet size={13} /> Wallet
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Notifications drawer */}
        {showNotifs && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-3 rounded-2xl bg-white overflow-hidden"
            style={{ border: "1px solid #F0F0F0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <span className="text-sm font-bold text-[#0D0D0D]">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={() => markAllRead()} className="text-xs font-semibold" style={{ color: GREEN }}>
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              <div className="max-h-52 overflow-y-auto">
                {notifications.slice(0, 6).map((n) => (
                  <div key={n.id} className={`px-4 py-3 border-b border-gray-50 last:border-0 ${!n.is_read ? "bg-green-50/40" : ""}`}>
                    <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <div className="px-4 pt-5 pb-4 space-y-5">

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-bold text-[#0D0D0D] mb-3">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-2">
              {quickActions.map((action, i) => (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer"
                    style={{ background: "white", border: "1px solid #F0F0F0" }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: action.bg }}>
                      <action.icon className="w-5 h-5" style={{ color: action.color }} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight">{action.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Active",    value: activeTasks.length,    icon: Activity,      color: GREEN    },
              { label: "Posted",    value: myPostedTasks.length,  icon: ClipboardList, color: "#1D4ED8" },
              { label: "Completed", value: completedTasks.length, icon: CheckCircle,   color: "#059669" },
              { label: "Helping",   value: activeHelping.length,  icon: TrendingUp,    color: "#D97706" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className="bg-white rounded-2xl p-4"
                style={{ border: "1px solid #F0F0F0" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                    <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-[#0D0D0D]">
                  {tasksLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-200" /> : stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Recent Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#0D0D0D]">Recent Tasks</h2>
              <Link href="/discover">
                <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: GREEN }}>
                  Browse <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>

            {tasksLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-gray-200" />
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center" style={{ border: "1px solid #F0F0F0" }}>
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "#F8FAF8" }}>
                  <ClipboardList className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400 mb-4">No tasks yet</p>
                <Link href="/create-request">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="text-xs font-bold px-5 py-2.5 rounded-xl text-white"
                    style={{ background: GREEN }}
                  >
                    Post Your First Task
                  </motion.button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentTasks.map((task, i) => {
                  const statusClass = STATUS_COLORS[task.status] || "bg-gray-50 text-gray-600";
                  const isHelper = task.helper_id === user.uid;
                  return (
                    <Link key={task.id} href={`/request/${task.id}`}>
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
                        style={{ border: "1px solid #F0F0F0" }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#F0FDF4" }}>
                          <ClipboardList className="w-4.5 h-4.5" style={{ color: GREEN }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0D0D0D] truncate">{task.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {isHelper ? "You're helping" : "Posted by you"}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${statusClass}`}>
                          {STATUS_LABELS[task.status] || task.status}
                        </span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Profile prompt */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)` }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 pointer-events-none" style={{ background: "white", transform: "translate(30%,-30%)" }} />
            <Star className="w-6 h-6 text-white/50 mb-2" />
            <h3 className="text-sm font-bold text-white mb-1">Complete your profile</h3>
            <p className="text-xs text-white/60 mb-3 leading-relaxed">
              Workers with complete profiles get 3× more task offers.
            </p>
            <Link href="/profile">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="text-xs font-bold px-4 py-2 rounded-xl text-white flex items-center gap-1.5"
                style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                Edit Profile <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            </Link>
          </motion.div>

        </div>
      </div>
    </MobileLayout>
  );
}
