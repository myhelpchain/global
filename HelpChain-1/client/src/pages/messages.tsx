import { useState, useEffect, useRef } from "react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle, ChevronLeft, Search, Loader2 } from "lucide-react";
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
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#F8FAF8", fontFamily: "'Figtree', sans-serif" }}
      >
        {/* Chat Header */}
        <div
          className="flex items-center gap-3 px-4 h-14 sticky top-0 z-40 border-b"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(0,0,0,0.05)",
            paddingTop: "env(safe-area-inset-top, 0px)",
          }}
        >
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setSelectedConvId(null)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#F8FAF8" }}
          >
            <ChevronLeft className="w-5 h-5 text-[#0D0D0D]" />
          </motion.button>
          <Avatar className="h-9 w-9">
            <AvatarImage src={otherParticipant.avatar || undefined} />
            <AvatarFallback className="text-xs font-bold text-white" style={{ background: GREEN }}>
              {getInitials(otherParticipant.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-bold text-[#0D0D0D]">{otherParticipant.name}</p>
            {selectedConv.task?.title && (
              <p className="text-xs text-gray-400 truncate max-w-[180px]">{selectedConv.task.title}</p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
          {msgsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: GREEN }} />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-14">
              <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No messages yet. Say hi!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === (currentUserId || user.uid);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMine
                        ? "rounded-br-sm text-white"
                        : "rounded-bl-sm text-[#0D0D0D]"
                    }`}
                    style={{
                      background: isMine ? `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)` : "white",
                      boxShadow: isMine ? `0 2px 8px rgba(12,107,56,0.25)` : "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    <p>{msg.body}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-gray-400"}`}>
                      {formatMessageTime(msg.created_at)}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          className="fixed bottom-0 left-0 right-0 px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 h-11 rounded-2xl border-gray-200 bg-gray-50 text-sm"
            />
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleSend}
              disabled={!newMessage.trim() || sendPending}
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
              style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)` }}
            >
              {sendPending ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MobileLayout>
      <div style={{ background: "#F8FAF8" }}>
        {/* Header */}
        <div
          className="px-5 pt-14 pb-4 sticky top-0 z-40"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <h1 className="text-xl font-bold text-[#0D0D0D] mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-10 h-10 rounded-xl border-gray-200 bg-gray-50 text-sm"
            />
          </div>
        </div>

        <div className="px-4 pt-3">
          {convsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: GREEN }} />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "#F0FDF4" }}
              >
                <MessageCircle className="w-8 h-8" style={{ color: GREEN }} />
              </div>
              <p className="text-base font-semibold text-[#0D0D0D] mb-1">No conversations yet</p>
              <p className="text-sm text-gray-400">
                {searchQuery ? "No results found" : "Accept an offer to start chatting"}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredConvs.map((conv) => {
                const other = getOtherParticipant(conv, user.uid);
                return (
                  <motion.div
                    key={conv.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedConvId(conv.id)}
                    className="bg-white rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
                    style={{ border: "1px solid #F0F0F0" }}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={other.avatar || undefined} />
                        <AvatarFallback className="text-sm font-bold text-white" style={{ background: GREEN }}>
                          {getInitials(other.name)}
                        </AvatarFallback>
                      </Avatar>
                      {other.unread > 0 && (
                        <span
                          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                          style={{ background: "#EF4444" }}
                        >
                          {other.unread > 9 ? "9+" : other.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`text-sm truncate ${other.unread > 0 ? "font-bold text-[#0D0D0D]" : "font-semibold text-[#0D0D0D]"}`}>
                          {other.name}
                        </p>
                        <p className="text-xs text-gray-400 shrink-0 ml-2">{formatConvTime(conv.last_message_at)}</p>
                      </div>
                      {conv.task?.title && (
                        <p className="text-xs text-gray-400 truncate mb-0.5">{conv.task.title}</p>
                      )}
                      <p className={`text-xs truncate ${other.unread > 0 ? "text-[#0D0D0D] font-medium" : "text-gray-400"}`}>
                        {conv.last_message || "No messages yet"}
                      </p>
                    </div>
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
