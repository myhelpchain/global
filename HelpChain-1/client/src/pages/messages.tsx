import { useState } from "react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle, ChevronLeft, Search, UserCircle, Construction } from "lucide-react";
import { Redirect, Link } from "wouter";
import { motion } from "framer-motion";

interface MockConversation {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface MockMessage {
  id: string;
  senderId: string;
  content: string;
  time: string;
}

const initialConversations: MockConversation[] = [
  { id: "c1", userId: "user-sarah-1", name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?u=sarah", lastMessage: "I can start the project tomorrow!", time: "2m ago", unread: 2 },
  { id: "c2", userId: "user-emeka-2", name: "Emeka Nwankwo", avatar: "https://i.pravatar.cc/150?u=emeka", lastMessage: "The move is scheduled for Saturday", time: "1h ago", unread: 0 },
  { id: "c3", userId: "user-priya-3", name: "Priya Sharma", avatar: "https://i.pravatar.cc/150?u=priya", lastMessage: "Thanks for the great review!", time: "3h ago", unread: 0 },
];

const mockMessages: Record<string, MockMessage[]> = {
  c1: [
    { id: "m1", senderId: "other", content: "Hi! I saw your task posting for web development. I'd love to help.", time: "10:30 AM" },
    { id: "m2", senderId: "me", content: "Great! Can you share some examples of your previous work?", time: "10:32 AM" },
    { id: "m3", senderId: "other", content: "Of course! Here's my portfolio. I've built 20+ React projects.", time: "10:35 AM" },
    { id: "m4", senderId: "me", content: "Impressive work. What's your timeline for this project?", time: "10:38 AM" },
    { id: "m5", senderId: "other", content: "I can start the project tomorrow!", time: "10:40 AM" },
  ],
  c2: [
    { id: "m6", senderId: "other", content: "Hello, I'm interested in helping with the office move.", time: "9:00 AM" },
    { id: "m7", senderId: "me", content: "Great! Are you available this Saturday morning?", time: "9:15 AM" },
    { id: "m8", senderId: "other", content: "The move is scheduled for Saturday", time: "9:20 AM" },
  ],
  c3: [
    { id: "m9", senderId: "other", content: "Thanks for the great review!", time: "Yesterday" },
  ],
};

export default function MessagesPage() {
  const { user } = useFirebaseAuth();
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [localMessages, setLocalMessages] = useState(mockMessages);
  const [conversations, setConversations] = useState(initialConversations);

  if (!user) return <Redirect to="/auth" />;

  const filteredConvs = conversations.filter(
    (c) => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConv = conversations.find((c) => c.id === selectedConv);
  const messages = selectedConv ? localMessages[selectedConv] || [] : [];

  const handleSelectConv = (convId: string) => {
    setSelectedConv(convId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unread: 0 } : c))
    );
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;
    const msg: MockMessage = {
      id: `m-${Date.now()}`,
      senderId: "me",
      content: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setLocalMessages((prev) => ({
      ...prev,
      [selectedConv]: [...(prev[selectedConv] || []), msg],
    }));
    setConversations((prev) =>
      prev.map((c) => c.id === selectedConv ? { ...c, lastMessage: newMessage.trim(), time: "Just now" } : c)
    );
    setNewMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8]">
      <Navbar />

      {/* Preview banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center gap-2.5 text-sm text-amber-800">
          <Construction className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            <span className="font-semibold">Preview mode</span> — This is a demo of the messaging interface. Real-time messaging with full backend support is coming soon.
          </span>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid #F0F0F0", height: "calc(100vh - 180px)", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
        >
          <div className="flex h-full">
            {/* Conversation List */}
            <div
              className={`border-r flex flex-col ${selectedConv ? "hidden md:flex" : "flex"}`}
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
                {filteredConvs.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm text-gray-400">No conversations yet</p>
                  </div>
                ) : (
                  filteredConvs.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConv(conv.id)}
                      className={`w-full p-4 flex items-center gap-3 transition-colors text-left ${selectedConv === conv.id ? "bg-[#F8FAF8]" : "hover:bg-[#FAFAFA]"}`}
                      style={{ borderBottom: "1px solid #F5F5F5" }}
                    >
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarImage src={conv.avatar} />
                        <AvatarFallback className="bg-[#0C6B38]/10 text-[#0C6B38] font-semibold">{conv.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-semibold text-sm text-[#0D0D0D] truncate">{conv.name}</p>
                          <span className="text-xs text-gray-400 shrink-0">{conv.time}</span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                      </div>
                      {conv.unread > 0 && (
                        <span className="h-5 w-5 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0" style={{ background: "#0C6B38" }}>
                          {conv.unread}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedConv ? "hidden md:flex" : "flex"}`}>
              {!selectedConv ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#F8FAF8] flex items-center justify-center mb-4" style={{ border: "1px solid #F0F0F0" }}>
                    <MessageCircle className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="font-semibold text-[#0D0D0D] mb-1">Select a conversation</p>
                  <p className="text-sm text-gray-400 max-w-xs">Choose a conversation from the list to start messaging</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid #F5F5F5" }}>
                    <button onClick={() => setSelectedConv(null)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarImage src={currentConv?.avatar} />
                      <AvatarFallback className="bg-[#0C6B38]/10 text-[#0C6B38] font-semibold">{currentConv?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-[#0D0D0D]">{currentConv?.name}</p>
                      <p className="text-xs text-gray-400">Demo preview</p>
                    </div>
                    <Link href={`/public-profile/${currentConv?.userId}`}>
                      <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
                        <UserCircle className="w-3.5 h-3.5" /> View Profile
                      </button>
                    </Link>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.senderId === "me" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            msg.senderId === "me"
                              ? "text-white rounded-br-md"
                              : "bg-[#F8FAF8] text-[#0D0D0D] rounded-bl-md"
                          }`}
                          style={msg.senderId === "me" ? { background: "#0C6B38" } : { border: "1px solid #F0F0F0" }}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.senderId === "me" ? "text-white/60" : "text-gray-400"}`}>{msg.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <form onSubmit={handleSend} className="p-4 flex gap-2" style={{ borderTop: "1px solid #F5F5F5" }}>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-[#F8FAF8] border-0 rounded-xl text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all shrink-0"
                      style={{ background: "#0C6B38" }}
                    >
                      <Send className="w-4 h-4" />
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
