import { Link, useLocation } from "wouter";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { motion } from "framer-motion";
import { useConversations } from "@/hooks/use-messaging";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";

const tabs = [
  { href: "/dashboard", icon: Home,          label: "Home"     },
  { href: "/discover",  icon: Search,        label: "Tasks"    },
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
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-end justify-around px-2 pt-1 pb-2">

        {tabs.slice(0, 2).map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link key={tab.href} href={tab.href}>
              <motion.div
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl cursor-pointer min-w-[56px]"
                style={{ background: active ? "rgba(12,107,56,0.08)" : "transparent" }}
              >
                <tab.icon
                  className="w-[22px] h-[22px] transition-colors"
                  style={{ color: active ? "#0C6B38" : "#9CA3AF", strokeWidth: active ? 2.2 : 1.8 }}
                />
                <span
                  className="text-[10px] font-semibold transition-colors"
                  style={{ color: active ? "#0C6B38" : "#9CA3AF" }}
                >
                  {tab.label}
                </span>
              </motion.div>
            </Link>
          );
        })}

        <Link href="/create-request">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-0.5 cursor-pointer -mt-4"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, #0C6B38 0%, #16A34A 100%)",
                boxShadow: "0 6px 20px rgba(12,107,56,0.4)",
              }}
            >
              <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
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
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl cursor-pointer min-w-[56px] relative"
                style={{ background: active ? "rgba(12,107,56,0.08)" : "transparent" }}
              >
                <div className="relative">
                  <tab.icon
                    className="w-[22px] h-[22px] transition-colors"
                    style={{ color: active ? "#0C6B38" : "#9CA3AF", strokeWidth: active ? 2.2 : 1.8 }}
                  />
                  {badge > 0 && (
                    <span
                      className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] px-0.5 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                      style={{ background: "#EF4444" }}
                    >
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>
                <span
                  className="text-[10px] font-semibold transition-colors"
                  style={{ color: active ? "#0C6B38" : "#9CA3AF" }}
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
