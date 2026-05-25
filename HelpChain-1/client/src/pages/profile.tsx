import { useState, useEffect, useRef } from "react";
import { Link, Redirect } from "wouter";
import { motion } from "framer-motion";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useProfileApi } from "@/hooks/use-profile-api";
import { useWallet } from "@/hooks/use-wallet";
import { useLocalizationStore } from "@/stores/localization-store";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Camera, Edit2, ChevronRight, Wallet, Settings, HelpCircle,
  Shield, MapPin, LogOut, ClipboardList, Bell, Loader2, Star
} from "lucide-react";

const GREEN = "#0C6B38";

export default function ProfilePage() {
  const { user, logout } = useFirebaseAuth();
  const { profile, isLoading: profileLoading, updateProfile, updateProfilePending } = useProfileApi();
  const { availableBalance } = useWallet();
  const { formatLocal } = useLocalizationStore();
  const { toast } = useToast();

  // All useState calls MUST be before any conditional returns
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  // Sync edit fields when profile loads or changes
  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || "");
      setEditBio(profile.bio || "");
      setEditLocation(profile.location || "");
      setEditSkills((profile.skills || []).join(", "));
    } else if (user) {
      setEditName(user.displayName || "");
    }
  }, [profile, user]);

  useEffect(() => {
    const saved = localStorage.getItem("profilePicture");
    if (saved) setProfileImage(saved);
    const handler = () => setProfileImage(localStorage.getItem("profilePicture"));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Conditional return AFTER all hooks
  if (!user) return <Redirect to="/auth" />;

  const displayName = profile?.full_name || user.displayName || "User";
  const email = profile?.email || user.email || "";
  const bio = profile?.bio || "";
  const location = profile?.location || "";
  const skills = profile?.skills || [];
  const avatar = profileImage || profile?.avatar_url || user.photoURL || null;
  const initials = displayName.charAt(0).toUpperCase();

  const rating = profile?.rating ?? 5.0;
  const totalReviews = profile?.total_reviews ?? 0;
  const tasksPosted = profile?.total_tasks_posted ?? 0;
  const tasksDone = profile?.total_tasks_done ?? 0;
  const successRate = profile?.success_rate ?? 100;

  const handleOpenEdit = () => {
    setEditName(profile?.full_name || user.displayName || "");
    setEditBio(profile?.bio || "");
    setEditLocation(profile?.location || "");
    setEditSkills((profile?.skills || []).join(", "));
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      const skillsArr = editSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await updateProfile({
        fullName: editName || displayName,
        bio: editBio,
        location: editLocation,
        skills: skillsArr,
      });
      toast({ title: "Profile updated!" });
      setEditOpen(false);
    } catch (err: unknown) {
      toast({ title: "Failed to update", description: (err as Error).message, variant: "destructive" });
    }
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
        { label: "My Tasks",   href: "/discover",  icon: ClipboardList, sub: "View your activity",          color: "#3B82F6", bg: "#EFF6FF" },
        { label: "Wallet",     href: "/wallet",    icon: Wallet,        sub: formatLocal(availableBalance),  color: GREEN,    bg: "#F0FDF4"  },
        { label: "Messages",   href: "/messages",  icon: Bell,          sub: "View conversations",           color: "#8B5CF6", bg: "#F5F3FF" },
      ],
    },
    {
      section: "Settings",
      items: [
        { label: "Edit Profile", action: handleOpenEdit,  icon: Edit2,      sub: "Update your info",          color: "#F97316", bg: "#FFF7ED" },
        { label: "Settings",     href: "/settings",       icon: Settings,   sub: "Preferences & security",    color: "#6B7280", bg: "#F9FAFB" },
        { label: "Help Center",  href: "/help",           icon: HelpCircle, sub: "Get support",               color: "#0EA5E9", bg: "#F0F9FF" },
      ],
    },
  ];

  const stats = [
    { label: "Posted",  value: String(tasksPosted) },
    { label: "Done",    value: String(tasksDone)   },
    { label: "Rating",  value: rating > 0 ? rating.toFixed(1) : "—" },
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
                  style={{ background: "white", boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}
                >
                  <Camera className="w-4 h-4" style={{ color: GREEN }} />
                </motion.button>
                <input ref={profileImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>

              <h1 className="text-xl font-bold text-white mb-1" style={{ letterSpacing: "-0.02em" }}>
                {profileLoading ? "Loading…" : displayName}
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

              {/* Rating stars */}
              {totalReviews > 0 && (
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5"
                      fill={i < Math.round(rating) ? "rgba(255,255,255,0.9)" : "none"}
                      style={{ color: "rgba(255,255,255,0.9)" }}
                    />
                  ))}
                  <span className="text-white/60 text-xs ml-1">({totalReviews})</span>
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

              {/* Success rate badge */}
              {successRate > 0 && (
                <div
                  className="mt-3 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)" }}
                >
                  {successRate}% success rate
                </div>
              )}
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
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 px-1">
                {section.section}
              </p>
              <div
                className="rounded-[22px] overflow-hidden bg-white"
                style={{ border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
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
                        <Icon style={{ color: item.color, width: 18, height: 18 }} strokeWidth={1.8} />
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
            style={{
              background: "white",
              border: "1px solid rgba(239,68,68,0.15)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div className="w-10 h-10 rounded-[13px] flex items-center justify-center" style={{ background: "#FEF2F2" }}>
              <LogOut style={{ color: "#EF4444", width: 18, height: 18 }} strokeWidth={1.8} />
            </div>
            <span className="text-sm font-bold text-red-500">Log Out</span>
          </motion.button>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="rounded-[28px] mx-4 max-w-sm"
          style={{ border: "1px solid rgba(0,0,0,0.06)" }}
        >
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
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Skills</label>
              <Input
                value={editSkills}
                onChange={(e) => setEditSkills(e.target.value)}
                placeholder="e.g., React, Design, Writing"
                className="mt-2 h-[52px] rounded-[14px] border-gray-200 bg-gray-50 text-sm font-medium"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveProfile}
              disabled={updateProfilePending}
              className="w-full h-[52px] rounded-[16px] text-white font-bold text-sm flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`,
                boxShadow: `0 6px 20px rgba(12,107,56,0.3)`,
                opacity: updateProfilePending ? 0.7 : 1,
              }}
            >
              {updateProfilePending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
