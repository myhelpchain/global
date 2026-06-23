import { useState } from "react";
import { Link, Redirect } from "wouter";
import { motion, type Variants } from "framer-motion";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  Bell, Eye, EyeOff, Plus, Search, ArrowUpRight,
  ChevronRight, ClipboardList, CheckCircle, Activity,
  Loader2, Sparkles, ArrowRight, Wallet, MessageCircle, Zap
} from "lucide-react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useTasksApi } from "@/hooks/use-tasks-api";
import { useLocalizationStore } from "@/stores/localization-store";
import { useNotifications } from "@/hooks/use-notifications";
import { useConversations } from "@/hooks/use-messaging";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GREEN = "#0C6B38";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 22 },
  },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useFirebaseAuth();
  const { availableBalance, escrowBalance } = useWallet();
  const { formatLocal } = useLocalizationStore();
  const { myTasks, tasksLoading } = useTasksApi();
  const { unreadCount } = useNotifications();
  const { conversations } = useConversations();
  const [hideBalance, setHideBalance] = useState(false);

  if (!user) return <Redirect to="/auth" />;

  const displayName = user.displayName || "User";
  const firstName = displayName.split(" ")[0];
  const avatar = user.photoURL;

  const myPostedTasks = myTasks.filter((t) => t.creatorId === user.uid);
  const activeTasks  = myPostedTasks.filter((t) => ["published", "in_progress"].includes(t.status));
  const completedTasks = myPostedTasks.filter((t) => t.status === "completed");

  const unreadMessages = conversations.reduce((sum, c) => {
    const isA = c.participant_a === user.uid;
    return sum + (isA ? (c.unread_a || 0) : (c.unread_b || 0));
  }, 0);

  const recentTasks = [...myTasks]
    .sort((a, b) => {
      const tA = a.createdAt?.toMillis?.() ?? new Date(a.createdAt).getTime() ?? 0;
      const tB = b.createdAt?.toMillis?.() ?? new Date(b.createdAt).getTime() ?? 0;
      return tB - tA;
    })
    .slice(0, 3);

  return (
    <MobileLayout>
      <div className="min-h-full bg-[#F8FAF9] pb-10">

        {/* ── Header ── */}
        <header className="px-6 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] pb-7 bg-white border-b border-gray-100/80 rounded-b-[44px] shadow-sm">

          {/* Top row: avatar + brand + bell */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3.5">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="relative">
                <Avatar className="h-[50px] w-[50px] ring-[3px] ring-[#0C6B38]/10">
                  <AvatarImage src={avatar || undefined} />
                  <AvatarFallback
                    className="text-white font-black text-lg"
                    style={{ background: "linear-gradient(135deg, #0C6B38 0%, #15A34A 100%)" }}
                  >
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              </motion.div>

              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div
                    className="w-4 h-4 rounded-[5px] flex items-center justify-center"
                    style={{ background: GREEN }}
                  >
                    <Zap size={9} className="text-white" strokeWidth={3} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">HelpChain</p>
                </div>
                <h1 className="text-[22px] font-black text-[#0D0D0D] tracking-tight leading-tight">
                  {getGreeting()}, {firstName}
                </h1>
              </div>
            </div>

            <Link href="/settings">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="relative w-11 h-11 rounded-[16px] bg-gray-50 flex items-center justify-center border border-gray-100"
              >
                <Bell className="w-5 h-5 text-gray-700" strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-[1.5px] border-white" />
                )}
              </motion.button>
            </Link>
          </div>

          {/* Balance Card */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="p-5 rounded-[28px] relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0C6B38 0%, #17a84a 100%)" }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.07]"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: "20px 20px",
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/70 text-[10px] font-black uppercase tracking-wider">Available Balance</span>
                <motion.button onClick={() => setHideBalance(!hideBalance)} className="text-white/50 hover:text-white/80">
                  {hideBalance ? <EyeOff size={15} /> : <Eye size={15} />}
                </motion.button>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-white/60 text-base font-bold">₦</span>
                <h2 className="text-[36px] font-black text-white tracking-tighter leading-none">
                  {hideBalance ? "••••••" : availableBalance.toLocaleString()}
                </h2>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="bg-white/10 px-3 py-1.5 rounded-full">
                  <p className="text-white/70 text-[9px] font-black uppercase tracking-wider">
                    Escrow: {hideBalance ? "•••" : formatLocal(escrowBalance)}
                  </p>
                </div>
                <Link href="/wallet">
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    className="bg-white text-[#0C6B38] px-4 py-2 rounded-[14px] text-xs font-black flex items-center gap-1.5 shadow-sm"
                  >
                    Top Up <ArrowUpRight size={13} strokeWidth={3} />
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-5 mt-7 space-y-7"
        >

          {/* ── Quick Actions ── */}
          <motion.section variants={itemVariants}>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] mb-3 px-1">Quick Actions</p>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/create-request">
                <motion.div
                  whileTap={{ scale: 0.96 }}
                  className="rounded-[24px] p-5 relative overflow-hidden cursor-pointer"
                  style={{ background: "linear-gradient(140deg, #0C6B38 0%, #1a9a50 100%)" }}
                >
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
                  <div
                    className="w-9 h-9 rounded-[12px] flex items-center justify-center mb-3.5"
                    style={{ background: "rgba(255,255,255,0.18)" }}
                  >
                    <Plus className="text-white w-4.5 h-4.5" strokeWidth={3} size={18} />
                  </div>
                  <p className="text-white font-black text-sm leading-tight">Request Help</p>
                  <p className="text-white/55 text-[10px] font-bold mt-0.5">Post a task</p>
                </motion.div>
              </Link>

              <Link href="/discover">
                <motion.div
                  whileTap={{ scale: 0.96 }}
                  className="rounded-[24px] p-5 bg-[#111827] relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/5 rounded-full" />
                  <div className="w-9 h-9 rounded-[12px] bg-white/10 flex items-center justify-center mb-3.5">
                    <Search className="text-white w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <p className="text-white font-black text-sm leading-tight">Find Tasks</p>
                  <p className="text-white/40 text-[10px] font-bold mt-0.5">Browse & earn</p>
                </motion.div>
              </Link>
            </div>
          </motion.section>

          {/* ── Summary Cards ── */}
          <motion.section variants={itemVariants}>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] mb-3 px-1">Overview</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm">
                <ClipboardList className="text-blue-500 w-5 h-5 mb-2" strokeWidth={2} />
                <p className="text-[20px] font-black text-gray-900">{myPostedTasks.length}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Tasks</p>
              </div>

              <div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm">
                <CheckCircle className="text-green-500 w-5 h-5 mb-2" strokeWidth={2} />
                <p className="text-[20px] font-black text-gray-900">{completedTasks.length}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Done</p>
              </div>

              <Link href="/messages">
                <div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm relative cursor-pointer">
                  <MessageCircle className="text-purple-500 w-5 h-5 mb-2" strokeWidth={2} />
                  <p className="text-[20px] font-black text-gray-900">{unreadMessages}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Chats</p>
                  {unreadMessages > 0 && (
                    <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
                </div>
              </Link>
            </div>
          </motion.section>

          {/* ── Active Tasks ── */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-gray-900">Your Activities</h2>
              <Link href="/discover">
                <span className="text-[#0C6B38] text-xs font-black flex items-center gap-1">
                  View all <ChevronRight size={14} strokeWidth={3} />
                </span>
              </Link>
            </div>

            {tasksLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-7 h-7 animate-spin text-[#0C6B38]" />
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="bg-white rounded-[28px] p-8 text-center border border-dashed border-gray-200">
                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="text-gray-300 w-7 h-7" />
                </div>
                <h4 className="text-gray-900 font-black text-sm">No recent activity</h4>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">Post your first help request to get started.</p>
                <Link href="/create-request">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="mt-5 px-6 py-2.5 rounded-2xl text-white text-xs font-black"
                    style={{ background: GREEN }}
                  >
                    Post a Request
                  </motion.button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <Link key={task.id} href={`/request/${task.id}`}>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className="bg-white p-4 rounded-[22px] border border-gray-50 shadow-sm flex items-center gap-4 group"
                    >
                      <div className="w-11 h-11 bg-[#F0FDF4] rounded-xl flex items-center justify-center shrink-0">
                        <Activity className="text-[#0C6B38] w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-gray-900 truncate group-hover:text-[#0C6B38] transition-colors">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-black uppercase">
                            {task.status.replace("_", " ")}
                          </span>
                          <span className="text-[9px] text-gray-300 font-bold">
                            {new Date(task.createdAt?.toDate?.() || task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-gray-200 group-hover:text-[#0C6B38] transition-colors shrink-0" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </motion.section>

          {/* ── Explore Promo ── */}
          <motion.div
            variants={itemVariants}
            className="rounded-[28px] overflow-hidden relative bg-gray-900 p-6"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#0C6B38]/25 rounded-full blur-3xl" />
            <div className="relative z-10">
              <span className="text-green-400 text-[9px] font-black uppercase tracking-widest">Marketplace</span>
              <h3 className="text-white text-[18px] font-black mt-1 leading-snug">Discover tasks near you</h3>
              <p className="text-white/50 text-xs mt-1 leading-relaxed">Help others and earn instantly.</p>
              <Link href="/discover">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="mt-5 px-6 py-2.5 rounded-[14px] text-white text-xs font-black"
                  style={{ background: GREEN }}
                >
                  Explore Now
                </motion.button>
              </Link>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </MobileLayout>
  );
}
