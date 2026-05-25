import { useState, useEffect, useRef } from "react";
import { Link, Redirect } from "wouter";
import { motion } from "framer-motion";
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
  ShieldCheck, CheckCircle
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
    try {
      await logout();
    } catch {}
  };

  const menuItems = [
    {
      section: "Account",
      items: [
        { label: "My Tasks",   href: "/discover",  icon: ClipboardList, sub: "View your activity" },
        { label: "Wallet",     href: "/wallet",    icon: Wallet,        sub: formatLocal(availableBalance), color: GREEN },
        { label: "Messages",   href: "/messages",  icon: Bell,          sub: "View conversations" },
      ],
    },
    {
      section: "Settings",
      items: [
        { label: "Edit Profile", action: () => { setEditName(displayName); setEditBio(bio); setEditLocation(location); setEditOpen(true); }, icon: Edit2,       sub: "Update your info" },
        { label: "Settings",     href: "/settings",  icon: Settings,      sub: "Preferences & security" },
        { label: "Help Center",  href: "/help",       icon: HelpCircle,    sub: "Get support" },
      ],
    },
  ];

  return (
    <MobileLayout>
      <div style={{ background: "#F8FAF8" }}>

        {/* Profile Header */}
        <div
          className="px-5 pb-8 pt-14 relative overflow-hidden"
          style={{ background: `linear-gradient(155deg, ${GREEN} 0%, #0a5a30 60%, #084a27 100%)` }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ background: "white", transform: "translate(30%,-30%)" }} />

          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24 border-4 border-white/30">
                <AvatarImage src={avatar || undefined} alt={displayName} />
                <AvatarFallback
                  className="text-2xl font-bold text-white"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => profileImageInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: "white" }}
              >
                <Camera className="w-4 h-4" style={{ color: GREEN }} />
              </motion.button>
              <input ref={profileImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <h1 className="text-xl font-bold text-white mb-1">{displayName}</h1>
            <p className="text-white/60 text-sm mb-3">{email}</p>

            {(bio || location) && (
              <div className="space-y-1.5">
                {bio && <p className="text-white/70 text-xs leading-relaxed max-w-xs">{bio}</p>}
                {location && (
                  <div className="flex items-center justify-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-white/50" />
                    <span className="text-white/50 text-xs">{location}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 mt-4">
              <div className="text-center">
                <p className="text-white font-bold text-lg">0</p>
                <p className="text-white/50 text-xs">Tasks</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-white font-bold text-lg">5.0</p>
                <p className="text-white/50 text-xs">Rating</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-white font-bold text-lg">100%</p>
                <p className="text-white/50 text-xs">Success</p>
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
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: "#F0FDF4", color: GREEN, border: `1px solid #BBF7D0` }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Menu sections */}
        <div className="px-4 pb-6 space-y-5 mt-1">
          {menuItems.map((section) => (
            <div key={section.section}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{section.section}</p>
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #F0F0F0" }}>
                {section.items.map((item, i) => {
                  const Icon = item.icon;
                  const isLast = i === section.items.length - 1;
                  const content = (
                    <motion.div
                      whileTap={{ scale: 0.99, background: "#F8FAF8" }}
                      className="flex items-center gap-4 px-4 py-3.5 cursor-pointer"
                      style={{ borderBottom: isLast ? "none" : "1px solid #F5F5F5" }}
                      onClick={"action" in item ? item.action : undefined}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#F8FAF8" }}>
                        <Icon className="w-4 h-4" style={{ color: "color" in item && item.color ? item.color : "#6B7280" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0D0D0D]">{item.label}</p>
                        {"sub" in item && item.sub && (
                          <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
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
            className="w-full flex items-center gap-4 px-4 py-3.5 bg-white rounded-2xl cursor-pointer"
            style={{ border: "1px solid #FEE2E2" }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50">
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-sm font-semibold text-red-500">Log Out</span>
          </motion.button>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-3xl mx-4 max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                className="mt-1.5 h-12 rounded-xl border-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bio</label>
              <Textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell others about yourself"
                className="mt-1.5 rounded-xl border-gray-200 resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</label>
              <Input
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="e.g., Lagos, Nigeria"
                className="mt-1.5 h-12 rounded-xl border-gray-200"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSaveProfile}
              className="w-full h-12 rounded-xl text-white font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)` }}
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
