import { Link, useLocation } from "wouter";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useConversations } from "@/hooks/use-messaging";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";

const tabs = [
  { href: "/dashboard", icon: Home,          label: "Home"     },
  { href: "/discover",  icon: Search,        label: "Explore"  },
  { href: "/messages",  icon: MessageCircle, label: "Messages" },
  { href: "/profile",   icon: User,          label: "Profile"  },
];

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useFirebaseAuth();
  const { conversations } = useConversations();

  const unreadMessages = user
    ? conversations.reduce((sum, c) => {
        const isA = c.participant_a === user.uid;
        return sum + (isA ? (c.unread_a || 0) : (c.unread_b || 0));
      }, 0)
    : 0;

  const isActive = (href: string) => {
    if (href === "/dashboard") return location === "/dashboard" || location === "/";
    return location.startsWith(href);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.06), 0 -1px 0 rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-end justify-around px-2 pt-2 pb-2.5">

        {tabs.slice(0, 2).map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link key={tab.href} href={tab.href}>
              <motion.div
                whileTap={{ scale: 0.86 }}
                className="flex flex-col items-center gap-1 px-5 py-1.5 rounded-2xl cursor-pointer relative"
              >
                <AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: "rgba(12,107,56,0.09)" }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    />
                  )}
                </AnimatePresence>
                <motion.div
                  animate={{ y: active ? -1 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <tab.icon
                    className="w-[22px] h-[22px] transition-all duration-200"
                    style={{
                      color: active ? "#0C6B38" : "#9CA3AF",
                      strokeWidth: active ? 2.3 : 1.7,
                    }}
                  />
                </motion.div>
                <motion.span
                  className="text-[10px] font-semibold relative z-10 transition-all duration-200"
                  animate={{ color: active ? "#0C6B38" : "#9CA3AF" }}
                >
                  {tab.label}
                </motion.span>
              </motion.div>
            </Link>
          );
        })}

        {/* Create FAB */}
        <Link href="/create-request">
          <motion.div
            whileTap={{ scale: 0.88 }}
            className="flex flex-col items-center gap-1 cursor-pointer -mt-5"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-[58px] h-[58px] rounded-[20px] flex items-center justify-center"
              style={{
                background: "linear-gradient(140deg, #0C6B38 0%, #15A34A 100%)",
                boxShadow: "0 8px 24px rgba(12,107,56,0.45), 0 2px 8px rgba(12,107,56,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
            </motion.div>
            <span className="text-[10px] font-semibold mt-0.5" style={{ color: "#9CA3AF" }}>
              Create
            </span>
          </motion.div>
        </Link>

        {tabs.slice(2).map((tab) => {
          const active = isActive(tab.href);
          const badge = tab.href === "/messages" && unreadMessages > 0 ? unreadMessages : 0;
          return (
            <Link key={tab.href} href={tab.href}>
              <motion.div
                whileTap={{ scale: 0.86 }}
                className="flex flex-col items-center gap-1 px-5 py-1.5 rounded-2xl cursor-pointer relative"
              >
                <AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId={`navPill-${tab.href}`}
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: "rgba(12,107,56,0.09)" }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    />
                  )}
                </AnimatePresence>
                <div className="relative">
                  <motion.div
                    animate={{ y: active ? -1 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <tab.icon
                      className="w-[22px] h-[22px] transition-all duration-200"
                      style={{
                        color: active ? "#0C6B38" : "#9CA3AF",
                        strokeWidth: active ? 2.3 : 1.7,
                      }}
                    />
                  </motion.div>
                  <AnimatePresence>
                    {badge > 0 && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-0.5 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                        style={{ background: "#EF4444" }}
                      >
                        {badge > 9 ? "9+" : badge}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <motion.span
                  className="text-[10px] font-semibold relative z-10 transition-all duration-200"
                  animate={{ color: active ? "#0C6B38" : "#9CA3AF" }}
                >
                  {tab.label}
                </motion.span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
