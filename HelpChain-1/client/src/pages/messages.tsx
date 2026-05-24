import { useState, useEffect, useRef } from "react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Navbar } from "@/components/layout/navbar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle, ChevronLeft, Search, UserCircle, Loader2 } from "lucide-react";
import { Redirect, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useConversations, useMessages, type ConversationData } from "@/hooks/use-messaging";
import { format, isToday, isYesterday } from "date-fns";

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

  const filteredConvs = conversations.filter(
    (c: ConversationData) => {
      if (!searchQuery) return true;
      const other = getOtherParticipant(c, user.uid);
      return other.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.last_message || "").toLowerCase().includes(searchQuery.toLowerCase());
    }
  );

  const selectedConv = conversations.find((c: ConversationData) => c.id === selectedConvId) || null;
  const otherPerson = selectedConv ? getOtherParticipant(selectedConv, user.uid) : null;

  const handleSelectConv = (convId: string) => {
    setSelectedConvId(convId);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvId || sendPending) return;
    const msgText = newMessage.trim();
    setNewMessage("");
    try {
      await sendMessage(msgText);
    } catch {
      setNewMessage(msgText);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid #F0F0F0", height: "calc(100vh - 140px)", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
        >
          <div className="flex h-full">

            {/* Conversation List */}
            <div
              className={`border-r flex flex-col ${selectedConvId ? "hidden md:flex" : "flex"}`}
              style={{ width: "300px", minWidth: "300px", borderColor: "#F0F0F0" }}
            >
              <div className="p-4" style={{ borderBottom: "1px solid #F5F5F5" }}>
                <h2 className="text-base font-bold text-[#0D0D0D] mb-3">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#F8FAF8] border-0 text-sm rounded-xl h-9"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {convsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                  </div>
                ) : filteredConvs.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm font-medium text-gray-500 mb-1">No conversations yet</p>
                    <p className="text-xs text-gray-400">Conversations start when you accept or submit an offer on a task.</p>
                  </div>
                ) : (
                  filteredConvs.map((conv: ConversationData) => {
                    const other = getOtherParticipant(conv, user.uid);
                    const isSelected = selectedConvId === conv.id;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConv(conv.id)}
                        className={`w-full p-4 flex items-center gap-3 transition-colors text-left ${isSelected ? "bg-[#F8FAF8]" : "hover:bg-[#FAFAFA]"}`}
                        style={{ borderBottom: "1px solid #F5F5F5" }}
                      >
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarImage src={other.avatar || undefined} />
                          <AvatarFallback className="bg-[#0C6B38]/10 text-[#0C6B38] font-semibold text-sm">
                            {other.name[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="font-semibold text-sm text-[#0D0D0D] truncate">{other.name}</p>
                            <span className="text-xs text-gray-400 shrink-0 ml-1">{formatConvTime(conv.last_message_at)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs text-gray-400 truncate flex-1">
                              {conv.task?.title ? `Re: ${conv.task.title}` : (conv.last_message || "No messages yet")}
                            </p>
                            {other.unread > 0 && (
                              <span className="h-5 w-5 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0" style={{ background: "#0C6B38" }}>
                                {other.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedConvId ? "hidden md:flex" : "flex"}`}>
              {!selectedConvId ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#F8FAF8] flex items-center justify-center mb-4" style={{ border: "1px solid #F0F0F0" }}>
                    <MessageCircle className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="font-semibold text-[#0D0D0D] mb-1">Select a conversation</p>
                  <p className="text-sm text-gray-400 max-w-xs">Choose a conversation from the list to start messaging</p>
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid #F5F5F5" }}>
                    <button
                      onClick={() => setSelectedConvId(null)}
                      className="md:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarImage src={otherPerson?.avatar || undefined} />
                      <AvatarFallback className="bg-[#0C6B38]/10 text-[#0C6B38] font-semibold text-sm">
                        {otherPerson?.name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-[#0D0D0D]">{otherPerson?.name}</p>
                      {selectedConv?.task?.title && (
                        <p className="text-xs text-gray-400 truncate">Re: {selectedConv.task.title}</p>
                      )}
                    </div>
                    <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
                      <UserCircle className="w-3.5 h-3.5" /> Profile
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {msgsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <MessageCircle className="w-10 h-10 text-gray-200 mb-3" />
                        <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg) => {
                          const isMe = msg.sender_id === currentUserId;
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                              {!isMe && (
                                <Avatar className="w-7 h-7 shrink-0 mr-2 mt-auto">
                                  <AvatarImage src={msg.sender?.avatar_url || undefined} />
                                  <AvatarFallback className="bg-[#0C6B38]/10 text-[#0C6B38] font-semibold text-xs">
                                    {msg.sender?.full_name?.[0] || "?"}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className="max-w-[75%]">
                                <div
                                  className={`rounded-2xl px-4 py-2.5 ${
                                    isMe
                                      ? "text-white rounded-br-md"
                                      : "bg-[#F8FAF8] text-[#0D0D0D] rounded-bl-md"
                                  }`}
                                  style={isMe ? { background: "#0C6B38" } : { border: "1px solid #F0F0F0" }}
                                >
                                  <p className="text-sm leading-relaxed">{msg.body}</p>
                                </div>
                                <p className={`text-[10px] mt-1 ${isMe ? "text-right text-gray-400" : "text-gray-400"}`}>
                                  {formatMessageTime(msg.created_at)}
                                  {isMe && msg.read_at && <span className="ml-1 text-[#0C6B38]">✓✓</span>}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message input */}
                  <form onSubmit={handleSend} className="p-4 flex gap-2" style={{ borderTop: "1px solid #F5F5F5" }}>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-[#F8FAF8] border-0 rounded-xl text-sm"
                      disabled={sendPending}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendPending}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all shrink-0"
                      style={{ background: "#0C6B38" }}
                    >
                      {sendPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
