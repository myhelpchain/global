import { Link, useLocation } from "wouter";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { motion } from "framer-motion";
import { useConversations } from "@/hooks/use-messaging";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";

type TabItem = { href: string; icon: React.ElementType; label: string } | null;

const TABS: TabItem[] = [
  { href: "/dashboard", icon: Home,          label: "Home"    },
  { href: "/discover",  icon: Search,        label: "Tasks"   },
  null,
  { href: "/messages",  icon: MessageCircle, label: "Chat"    },
  { href: "/profile",   icon: User,          label: "Profile" },
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
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-3"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)" }}
    >
      <div
        className="flex items-end justify-around w-full"
        style={{
          maxWidth: 480,
          height: 72,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: 28,
          marginBottom: 8,
          boxShadow:
            "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
      >
        {TABS.map((tab, idx) => {
          if (tab === null) {
            return (
              <Link key="fab" href="/create-request">
                <motion.div
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.88, rotate: 6 }}
                  className="flex flex-col items-center justify-center"
                  style={{ marginBottom: 22 }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 20,
                      background: "linear-gradient(140deg, #0C6B38 0%, #1a9a50 100%)",
                      boxShadow:
                        "0 8px 20px rgba(12,107,56,0.38), 0 0 0 2px rgba(255,255,255,0.20)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Plus
                      strokeWidth={3}
                      style={{ width: 26, height: 26, color: "white" }}
                    />
                  </div>
                </motion.div>
              </Link>
            );
          }

          const active = isActive(tab.href);
          const badge =
            tab.href === "/messages" && unreadMessages > 0 ? unreadMessages : 0;

          return (
            <Link key={tab.href} href={tab.href}>
              <motion.div
                whileTap={{ scale: 0.82 }}
                className="relative flex flex-col items-center justify-end gap-1"
                style={{ minWidth: 56, paddingBottom: 10, paddingTop: 10 }}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active-bg"
                    style={{
                      position: "absolute",
                      inset: 4,
                      borderRadius: 14,
                      background: "rgba(12,107,56,0.09)",
                    }}
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}

                <div className="relative z-10">
                  <tab.icon
                    strokeWidth={active ? 2.6 : 1.8}
                    style={{
                      width: 23,
                      height: 23,
                      color: active ? "#0C6B38" : "#B0B8C1",
                      transition: "color 0.2s, stroke-width 0.2s",
                    }}
                  />
                  {badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-red-500 rounded-full text-white flex items-center justify-center border-2 border-white"
                      style={{ fontSize: 8, fontWeight: 900 }}
                    >
                      {badge > 9 ? "9+" : badge}
                    </motion.span>
                  )}
                </div>

                <span
                  className="relative z-10 leading-none"
                  style={{
                    fontSize: 10,
                    fontWeight: active ? 800 : 500,
                    color: active ? "#0C6B38" : "#B0B8C1",
                    transition: "color 0.2s, font-weight 0.2s",
                    letterSpacing: active ? "-0.01em" : "0.01em",
                  }}
                >
                  {tab.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
