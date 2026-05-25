import { useState, useEffect, useRef } from "react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle, ChevronLeft, Search, Loader2, Smile } from "lucide-react";
import { Redirect } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useConversations, useMessages, type ConversationData } from "@/hooks/use-messaging";
import { format, isToday, isYesterday } from "date-fns";

const GREEN = "#0C6B38";

function formatMessageTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

function formatConvTime(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

function getOtherParticipant(conv: ConversationData, myUid: string) {
  const isA = conv.participant_a === myUid;
  return {
    name: isA ? (conv.other_b?.full_name || "Unknown") : (conv.other_a?.full_name || "Unknown"),
    avatar: isA ? (conv.other_b?.avatar_url || null) : (conv.other_a?.avatar_url || null),
    unread: isA ? (conv.unread_a || 0) : (conv.unread_b || 0),
  };
}

export default function MessagesPage() {
  const { user } = useFirebaseAuth();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { conversations, isLoading: convsLoading } = useConversations();
  const { messages, isLoading: msgsLoading, sendMessage, sendPending, currentUserId } = useMessages(selectedConvId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return <Redirect to="/auth" />;

  const filteredConvs = conversations.filter((c: ConversationData) => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(c, user.uid);
    return other.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.last_message || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConv = selectedConvId ? conversations.find((c) => c.id === selectedConvId) : null;
  const otherParticipant = selectedConv ? getOtherParticipant(selectedConv, user.uid) : null;

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvId) return;
    try {
      await sendMessage(newMessage.trim());
      setNewMessage("");
    } catch {}
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  if (selectedConv && otherParticipant) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.25 }}
        className="min-h-screen flex flex-col"
        style={{ background: "#F5F7F5", fontFamily: "'Figtree', sans-serif" }}
      >
        {/* Chat Header */}
        <div
          className="flex items-center gap-3 px-4 sticky top-0 z-40"
          style={{
            height: 64,
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            paddingTop: "env(safe-area-inset-top, 0px)",
          }}
        >
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setSelectedConvId(null)}
            className="w-10 h-10 rounded-[13px] flex items-center justify-center"
            style={{ background: "#F5F7F5" }}
          >
            <ChevronLeft className="w-5 h-5 text-[#0D0D0D]" strokeWidth={2.2} />
          </motion.button>
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={otherParticipant.avatar || undefined} />
            <AvatarFallback
              className="text-xs font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)` }}
            >
              {getInitials(otherParticipant.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#0D0D0D] truncate">{otherParticipant.name}</p>
            {selectedConv.task?.title && (
              <p className="text-xs text-gray-400 truncate">{selectedConv.task.title}</p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-28">
          {msgsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: GREEN }} />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-14">
              <div
                className="w-14 h-14 rounded-[18px] mx-auto mb-3 flex items-center justify-center"
                style={{ background: "#F0FDF4" }}
              >
                <MessageCircle className="w-7 h-7" style={{ color: GREEN, opacity: 0.5 }} />
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Start the conversation</p>
              <p className="text-xs text-gray-400">Say hello to get things going!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMine = msg.sender_id === (currentUserId || user.uid);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.2), duration: 0.25 }}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-3 text-sm leading-relaxed ${
                      isMine ? "rounded-[18px] rounded-br-[6px]" : "rounded-[18px] rounded-bl-[6px]"
                    }`}
                    style={{
                      background: isMine
                        ? `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`
                        : "white",
                      color: isMine ? "white" : "#0D0D0D",
                      boxShadow: isMine
                        ? `0 4px 16px rgba(12,107,56,0.25), 0 1px 4px rgba(12,107,56,0.15)`
                        : "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    <p className="font-medium">{msg.body}</p>
                    <p className={`text-[10px] mt-1.5 ${isMine ? "text-white/55" : "text-gray-400"}`}>
                      {formatMessageTime(msg.created_at)}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div
          className="fixed bottom-0 left-0 right-0 px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="flex items-center gap-2.5">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 h-[46px] rounded-[14px] border-gray-200 bg-gray-50 text-sm font-medium"
            />
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleSend}
              disabled={!newMessage.trim() || sendPending}
              className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center shrink-0 disabled:opacity-40"
              style={{
                background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`,
                boxShadow: `0 4px 14px rgba(12,107,56,0.35)`,
              }}
            >
              {sendPending ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" strokeWidth={2} />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <MobileLayout>
      <div style={{ background: "#F5F7F5" }}>
        {/* Header */}
        <div
          className="px-5 pt-14 pb-4 sticky top-0 z-40"
          style={{
            background: "rgba(245,247,245,0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          <h1
            className="text-[1.3rem] font-bold text-[#0D0D0D] mb-3"
            style={{ letterSpacing: "-0.02em" }}
          >
            Messages
          </h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-11 h-[44px] rounded-[14px] border-gray-200 bg-white text-sm font-medium"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            />
          </div>
        </div>

        <div className="px-4 pt-3">
          {convsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-[20px] p-4 bg-white flex items-center gap-3" style={{ border: "1px solid rgba(0,0,0,0.05)" }}>
                  <div className="w-12 h-12 rounded-full shimmer shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 rounded-full shimmer w-1/2" />
                    <div className="h-3 rounded-full shimmer w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConvs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div
                className="w-16 h-16 rounded-[22px] mx-auto mb-4 flex items-center justify-center"
                style={{ background: "#F0FDF4" }}
              >
                <MessageCircle className="w-7 h-7" style={{ color: GREEN, opacity: 0.5 }} />
              </div>
              <p className="text-[15px] font-bold text-[#0D0D0D] mb-1">No conversations yet</p>
              <p className="text-sm text-gray-400">
                {searchQuery ? "No results found" : "Accept an offer to start chatting"}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2.5">
              {filteredConvs.map((conv, i) => {
                const other = getOtherParticipant(conv, user.uid);
                return (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedConvId(conv.id)}
                    className="rounded-[20px] p-4 flex items-center gap-3.5 cursor-pointer"
                    style={{
                      background: "white",
                      border: "1px solid rgba(0,0,0,0.05)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-[50px] w-[50px]">
                        <AvatarImage src={other.avatar || undefined} />
                        <AvatarFallback
                          className="text-sm font-bold text-white"
                          style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)` }}
                        >
                          {getInitials(other.name)}
                        </AvatarFallback>
                      </Avatar>
                      <AnimatePresence>
                        {other.unread > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                            style={{ background: "#EF4444" }}
                          >
                            {other.unread > 9 ? "9+" : other.unread}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`text-sm truncate ${other.unread > 0 ? "font-bold text-[#0D0D0D]" : "font-semibold text-[#0D0D0D]"}`}>
                          {other.name}
                        </p>
                        <p className="text-[11px] text-gray-400 shrink-0 ml-2 font-medium">{formatConvTime(conv.last_message_at)}</p>
                      </div>
                      {conv.task?.title && (
                        <p className="text-[11px] text-gray-400 truncate mb-0.5">{conv.task.title}</p>
                      )}
                      <p className={`text-xs truncate ${other.unread > 0 ? "text-[#0D0D0D] font-semibold" : "text-gray-400"}`}>
                        {conv.last_message || "No messages yet"}
                      </p>
                    </div>
                    {other.unread > 0 && (
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: GREEN }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
