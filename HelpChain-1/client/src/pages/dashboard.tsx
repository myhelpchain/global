import { useState, useEffect } from "react";
import { Link, Redirect } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  Bell, Eye, EyeOff, Plus, Search, Wallet, MessageCircle,
  ChevronRight, ClipboardList, CheckCircle, Activity, TrendingUp,
  Loader2, Star, Zap, ArrowUpRight, Sparkles
} from "lucide-react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useTasksApi } from "@/hooks/use-tasks-api";
import { useLocalizationStore } from "@/stores/localization-store";
import { useNotifications } from "@/hooks/use-notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GREEN = "#0C6B38";
const DARK_GREEN = "#085c30";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open:        { bg: "#EFF6FF", text: "#1D4ED8" },
  in_progress: { bg: "#FFFBEB", text: "#B45309" },
  completed:   { bg: "#F0FDF4", text: "#15803D" },
  cancelled:   { bg: "#FEF2F2", text: "#DC2626" },
  published:   { bg: "#EFF6FF", text: "#1D4ED8" },
  accepted:    { bg: "#F0F9FF", text: "#0369A1" },
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open", in_progress: "In Progress", completed: "Done",
  cancelled: "Cancelled", published: "Open", accepted: "Assigned",
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
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

  const stats = [
    { label: "Active",    value: activeTasks.length,    icon: Activity,      color: GREEN,      bg: "#F0FDF4"  },
    { label: "Posted",    value: myPostedTasks.length,  icon: ClipboardList, color: "#2563EB",  bg: "#EFF6FF"  },
    { label: "Done",      value: completedTasks.length, icon: CheckCircle,   color: "#059669",  bg: "#ECFDF5"  },
    { label: "Helping",   value: activeHelping.length,  icon: TrendingUp,    color: "#D97706",  bg: "#FFFBEB"  },
  ];

  return (
    <MobileLayout>
      <div className="min-h-full" style={{ background: "#F5F7F5" }}>

        {/* Hero Header */}
        <div
          className="relative overflow-hidden"
          style={{ background: `linear-gradient(150deg, #0C6B38 0%, #085c30 55%, #063f22 100%)` }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 right-0 rounded-full"
              style={{ width: 320, height: 320, background: "rgba(255,255,255,0.04)", transform: "translate(40%, -40%)", filter: "blur(1px)" }}
            />
            <div
              className="absolute bottom-0 left-0 rounded-full"
              style={{ width: 200, height: 200, background: "rgba(255,255,255,0.03)", transform: "translate(-40%, 40%)" }}
            />
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative px-5 pt-14 pb-6">
            {/* Top row */}
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-white/25 shadow-lg">
                    <AvatarImage src={avatar || undefined} alt={displayName} />
                    <AvatarFallback
                      className="text-white text-base font-bold"
                      style={{ background: "rgba(255,255,255,0.18)" }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                    style={{ background: "#22C55E" }}
                  />
                </div>
                <div>
                  <p className="text-white/55 text-xs font-medium mb-0.5">Good day</p>
                  <h1 className="text-white font-bold text-[17px] leading-tight tracking-tight">
                    {firstName} 👋
                  </h1>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative w-11 h-11 rounded-[14px] flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <Bell className="w-5 h-5 text-white" strokeWidth={1.8} />
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                      style={{ background: "#EF4444" }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
              className="rounded-[22px] p-5 relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.16)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.05)", transform: "translate(40%, -40%)" }} />
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-white/50 text-xs font-medium">Available Balance</p>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setHideBalance(!hideBalance)}
                      className="text-white/40 hover:text-white/70 transition-colors"
                    >
                      {hideBalance ? <EyeOff size={12} /> : <Eye size={12} />}
                    </motion.button>
                  </div>
                  <motion.p
                    key={hideBalance ? "hidden" : "shown"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[2rem] font-bold text-white tracking-tight leading-none"
                  >
                    {hideBalance ? "₦ ••••••" : formatLocal(availableBalance)}
                  </motion.p>
                  {escrowBalance > 0 && (
                    <p className="text-white/35 text-xs mt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/60 inline-block" />
                      Escrow: {hideBalance ? "••••••" : formatLocal(escrowBalance)}
                    </p>
                  )}
                </div>
                <Link href="/wallet">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-[12px] text-white"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.18)" }}
                  >
                    <Wallet size={12} />
                    Wallet
                    <ArrowUpRight size={11} />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Notifications drawer */}
        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              className="mx-4 mt-3 rounded-[20px] bg-white overflow-hidden"
              style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
            >
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50/80">
                <span className="text-sm font-bold text-[#0D0D0D]">Notifications</span>
                {unreadCount > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => markAllRead()}
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ color: GREEN, background: "#F0FDF4" }}
                  >
                    Mark all read
                  </motion.button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No notifications yet</p>
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto">
                  {notifications.slice(0, 6).map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`px-4 py-3.5 border-b border-gray-50 last:border-0 ${!n.is_read ? "bg-green-50/40" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: !n.is_read ? GREEN : "#D1D5DB" }} />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{n.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 pt-5 pb-4 space-y-6">

          {/* Quick Actions */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-2.5">
              {quickActions.map((action, i) => (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    whileTap={{ scale: 0.88 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                    className="flex flex-col items-center gap-2.5 p-3 rounded-[18px] cursor-pointer"
                    style={{ background: "white", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                  >
                    <div
                      className="w-11 h-11 rounded-[13px] flex items-center justify-center"
                      style={{ background: action.bg }}
                    >
                      <action.icon className="w-5 h-5" style={{ color: action.color }} strokeWidth={1.8} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500 text-center leading-tight">{action.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
            <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3">Your Activity</h2>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.05 }}
                  className="rounded-[20px] p-4"
                  style={{ background: "white", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-[11px] flex items-center justify-center" style={{ background: stat.bg }}>
                      <stat.icon className="w-4 h-4" style={{ color: stat.color }} strokeWidth={1.8} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                  </div>
                  <p className="text-3xl font-bold text-[#0D0D0D] leading-none">
                    {tasksLoading ? (
                      <span className="inline-block w-8 h-7 rounded-lg shimmer" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Tasks */}
          <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">Recent Tasks</h2>
              <Link href="/discover">
                <motion.span
                  whileTap={{ scale: 0.95 }}
                  className="text-xs font-bold flex items-center gap-0.5"
                  style={{ color: GREEN }}
                >
                  Browse <ChevronRight className="w-3.5 h-3.5" />
                </motion.span>
              </Link>
            </div>

            {tasksLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-[20px] p-4 bg-white" style={{ border: "1px solid rgba(0,0,0,0.05)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[13px] shimmer shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 rounded-full shimmer w-3/4" />
                        <div className="h-3 rounded-full shimmer w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-[20px] p-7 text-center"
                style={{ background: "white", border: "1px solid rgba(0,0,0,0.05)" }}
              >
                <div className="w-14 h-14 rounded-[18px] mx-auto mb-3 flex items-center justify-center" style={{ background: "#F0FDF4" }}>
                  <ClipboardList className="w-6 h-6" style={{ color: GREEN, opacity: 0.6 }} />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">No tasks yet</p>
                <p className="text-xs text-gray-400 mb-4">Post your first task and get help fast</p>
                <Link href="/create-request">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="text-xs font-bold px-5 py-2.5 rounded-xl text-white"
                    style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)` }}
                  >
                    Post a Task
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-2.5">
                {recentTasks.map((task, i) => {
                  const st = STATUS_COLORS[task.status] || { bg: "#F9FAFB", text: "#6B7280" };
                  const isHelper = task.helper_id === user.uid;
                  return (
                    <Link key={task.id} href={`/request/${task.id}`}>
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.05 }}
                        className="rounded-[20px] p-4 flex items-center gap-3.5 cursor-pointer"
                        style={{ background: "white", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}
                      >
                        <div className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0" style={{ background: "#F0FDF4" }}>
                          <ClipboardList className="w-5 h-5" style={{ color: GREEN }} strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#0D0D0D] truncate leading-snug">{task.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {isHelper ? "You're helping" : "Posted by you"}
                          </p>
                        </div>
                        <span
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0"
                          style={{ background: st.bg, color: st.text }}
                        >
                          {STATUS_LABELS[task.status] || task.status}
                        </span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Profile CTA */}
          <motion.div
            custom={3}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-[24px] p-5 relative overflow-hidden"
            style={{ background: `linear-gradient(140deg, ${GREEN} 0%, #16A34A 100%)` }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.06)", transform: "translate(35%, -35%)" }} />
            <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.04)", transform: "translate(-30%, 30%)" }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-white/70" strokeWidth={1.8} />
                <span className="text-white/70 text-xs font-semibold">Pro Tip</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">Complete your profile</h3>
              <p className="text-xs text-white/60 mb-4 leading-relaxed">
                Workers with complete profiles get 3× more task offers on HelpChain.
              </p>
              <Link href="/profile">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="text-xs font-bold px-4 py-2.5 rounded-[12px] text-white flex items-center gap-2"
                  style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.22)" }}
                >
                  Edit Profile
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </MobileLayout>
  );
}
