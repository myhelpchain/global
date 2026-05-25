import { useState, useEffect, useRef } from "react";
import { Link, Redirect } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useProfileStore } from "@/stores/profile-store";
import { useWallet } from "@/hooks/use-wallet";
import { useLocalizationStore } from "@/stores/localization-store";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Camera, Edit2, ChevronRight, Wallet, Settings, HelpCircle,
  Shield, Star, MapPin, LogOut, ClipboardList, Bell, User,
  CheckCircle, Sparkles
} from "lucide-react";

const GREEN = "#0C6B38";

function ProfilePageContent() {
  const [editOpen, setEditOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, logout } = useFirebaseAuth();
  const { getCurrentProfile, updateProfile, createProfile, setCurrentUser } = useProfileStore();
  const { availableBalance } = useWallet();
  const { formatLocal } = useLocalizationStore();

  useEffect(() => {
    if (user) {
      setCurrentUser(user.uid);
      const existing = useProfileStore.getState().getProfileByUserId(user.uid);
      if (!existing) {
        createProfile({
          id: `prof-${user.uid}`, userId: user.uid,
          fullName: user.displayName || "User", email: user.email || "",
          bio: "", avatarUrl: user.photoURL, location: "", country: "NG",
          baseCurrency: "NGN", rating: 0, ratingCount: 0, reputationScore: 100,
          verificationTier: 1, helpsGiven: 0, helpsReceived: 0,
          successRate: 0, onTimeRate: 0, responseTime: "N/A",
          joinedAt: new Date().toISOString().split("T")[0], skills: [], isFeatured: false,
        });
      }
    }
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem("profilePicture");
    if (saved) setProfileImage(saved);
    const handler = () => setProfileImage(localStorage.getItem("profilePicture"));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  if (!user) return <Redirect to="/auth" />;

  const profile = getCurrentProfile();
  const displayName = profile?.fullName || user.displayName || "User";
  const email = user.email || "";
  const bio = profile?.bio || "";
  const location = profile?.location || "";
  const skills = profile?.skills || [];
  const avatar = user.photoURL || profileImage || null;
  const initials = displayName.charAt(0).toUpperCase();

  const [editName, setEditName] = useState(displayName);
  const [editBio, setEditBio] = useState(bio);
  const [editLocation, setEditLocation] = useState(location);

  const handleSaveProfile = () => {
    if (profile) {
      updateProfile(profile.id, {
        fullName: editName || displayName,
        bio: editBio,
        location: editLocation,
      });
    }
    toast({ title: "Profile updated!" });
    setEditOpen(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setProfileImage(result);
      localStorage.setItem("profilePicture", result);
      window.dispatchEvent(new Event("storage"));
      toast({ title: "Profile photo updated!" });
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    try { await logout(); } catch {}
  };

  const menuSections = [
    {
      section: "Account",
      items: [
        { label: "My Tasks",   href: "/discover",  icon: ClipboardList, sub: "View your activity",       color: "#3B82F6", bg: "#EFF6FF" },
        { label: "Wallet",     href: "/wallet",    icon: Wallet,        sub: formatLocal(availableBalance), color: GREEN,    bg: "#F0FDF4" },
        { label: "Messages",   href: "/messages",  icon: Bell,          sub: "View conversations",        color: "#8B5CF6", bg: "#F5F3FF" },
      ],
    },
    {
      section: "Settings",
      items: [
        { label: "Edit Profile", action: () => { setEditName(displayName); setEditBio(bio); setEditLocation(location); setEditOpen(true); }, icon: Edit2,       sub: "Update your info",         color: "#F97316", bg: "#FFF7ED" },
        { label: "Settings",     href: "/settings",  icon: Settings,  sub: "Preferences & security",   color: "#6B7280", bg: "#F9FAFB"  },
        { label: "Help Center",  href: "/help",       icon: HelpCircle, sub: "Get support",             color: "#0EA5E9", bg: "#F0F9FF"  },
      ],
    },
  ];

  const stats = [
    { label: "Tasks", value: "0" },
    { label: "Rating", value: "5.0" },
    { label: "Success", value: "100%" },
  ];

  return (
    <MobileLayout>
      <div style={{ background: "#F5F7F5" }}>

        {/* Profile Hero */}
        <div
          className="relative overflow-hidden pb-8"
          style={{ background: "linear-gradient(150deg, #0C6B38 0%, #085c30 55%, #063f22 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 right-0 rounded-full opacity-10"
              style={{ width: 280, height: 280, background: "white", transform: "translate(40%, -40%)" }}
            />
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative px-5 pt-14">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-5">
                <div
                  className="p-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.2)" }}
                >
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatar || undefined} alt={displayName} />
                    <AvatarFallback
                      className="text-2xl font-bold text-white"
                      style={{ background: "rgba(255,255,255,0.2)" }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => profileImageInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center shadow-xl"
                  style={{
                    background: "white",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                  }}
                >
                  <Camera className="w-4 h-4" style={{ color: GREEN }} />
                </motion.button>
                <input ref={profileImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>

              <h1 className="text-xl font-bold text-white mb-1" style={{ letterSpacing: "-0.02em" }}>
                {displayName}
              </h1>
              <p className="text-white/50 text-sm mb-4 font-medium">{email}</p>

              {(bio || location) && (
                <div className="space-y-1.5 mb-4">
                  {bio && <p className="text-white/65 text-[13px] leading-relaxed max-w-xs">{bio}</p>}
                  {location && (
                    <div className="flex items-center justify-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-white/45" />
                      <span className="text-white/45 text-xs font-medium">{location}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Stats row */}
              <div
                className="flex items-center gap-0 rounded-[18px] px-4 py-3 mt-1"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.14)" }}
              >
                {stats.map((stat, i) => (
                  <div key={stat.label} className="flex items-center">
                    {i > 0 && <div className="w-px h-8 bg-white/15 mx-5" />}
                    <div className="text-center px-2">
                      <p className="text-white font-bold text-lg leading-none">{stat.value}</p>
                      <p className="text-white/45 text-[11px] mt-1 font-medium">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="px-4 py-4">
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 6).map((skill) => (
                <span
                  key={skill}
                  className="text-xs font-bold px-3.5 py-1.5 rounded-full"
                  style={{ background: "#F0FDF4", color: GREEN, border: "1px solid #BBF7D0" }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Menu sections */}
        <div className="px-4 pb-6 space-y-5 mt-3">
          {menuSections.map((section) => (
            <div key={section.section}>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 px-1">{section.section}</p>
              <div className="rounded-[22px] overflow-hidden bg-white" style={{ border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                {section.items.map((item, i) => {
                  const Icon = item.icon;
                  const isLast = i === section.items.length - 1;
                  const content = (
                    <motion.div
                      whileTap={{ scale: 0.99, backgroundColor: "#F5F7F5" }}
                      className="flex items-center gap-4 px-4 py-4 cursor-pointer"
                      style={{ borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.04)" }}
                      onClick={"action" in item ? item.action : undefined}
                    >
                      <div
                        className="w-10 h-10 rounded-[13px] flex items-center justify-center shrink-0"
                        style={{ background: item.bg }}
                      >
                        <Icon className="w-4.5 h-4.5" style={{ color: item.color, width: 18, height: 18 }} strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#0D0D0D]">{item.label}</p>
                        {"sub" in item && item.sub && (
                          <p className="text-xs text-gray-400 mt-0.5 font-medium">{item.sub}</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </motion.div>
                  );
                  return "href" in item ? (
                    <Link key={item.label} href={item.href!}>
                      {content}
                    </Link>
                  ) : (
                    <div key={item.label}>{content}</div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Logout */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-[22px] cursor-pointer"
            style={{ background: "white", border: "1px solid rgba(239,68,68,0.15)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <div className="w-10 h-10 rounded-[13px] flex items-center justify-center" style={{ background: "#FEF2F2" }}>
              <LogOut className="w-4.5 h-4.5 text-red-500" strokeWidth={1.8} style={{ width: 18, height: 18 }} />
            </div>
            <span className="text-sm font-bold text-red-500">Log Out</span>
          </motion.button>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-[28px] mx-4 max-w-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                className="mt-2 h-[52px] rounded-[14px] border-gray-200 bg-gray-50 text-sm font-medium"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Bio</label>
              <Textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell others about yourself"
                className="mt-2 rounded-[14px] border-gray-200 bg-gray-50 resize-none text-sm font-medium"
                rows={3}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Location</label>
              <Input
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="e.g., Lagos, Nigeria"
                className="mt-2 h-[52px] rounded-[14px] border-gray-200 bg-gray-50 text-sm font-medium"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveProfile}
              className="w-full h-[52px] rounded-[16px] text-white font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`, boxShadow: `0 6px 20px rgba(12,107,56,0.3)` }}
            >
              Save Changes
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}

export default function ProfilePage() {
  return <ProfilePageContent />;
}
