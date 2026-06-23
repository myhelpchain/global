import { useState, useEffect, useRef } from "react";
import { Link, Redirect } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
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
  Shield, MapPin, LogOut, Loader2, Star,
  Award, ShieldCheck, Zap, Share2, CheckCircle, AlertCircle
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useFirebaseAuth();
  const { profile, isLoading: profileLoading, updateProfile, updateProfilePending } = useProfileApi();
  const { availableBalance } = useWallet();
  const { formatLocal } = useLocalizationStore();
  const { toast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || "");
      setEditBio(profile.bio || "");
      setEditLocation(profile.location || "");
      setEditSkills((profile.skills || []).join(", "));
    }
  }, [profile]);

  if (!user) return <Redirect to="/auth" />;

  const displayName = profile?.full_name || user.displayName || "User";
  const bio = profile?.bio || "";
  const location = profile?.location || "Nigeria";
  const skills = profile?.skills || [];
  const avatar = profile?.avatar_url || user.photoURL;

  const completionItems = [
    { done: !!profile?.full_name, label: "Display name set" },
    { done: !!profile?.bio && profile.bio.length > 10, label: "Bio added" },
    { done: (profile?.skills || []).length > 0, label: "Skills added" },
    { done: !!profile?.location, label: "Location set" },
    { done: !!profile?.id_verified, label: "Identity verified" },
  ];
  const completionCount = completionItems.filter((i) => i.done).length;
  const completionPct = Math.round((completionCount / completionItems.length) * 100);
  const isComplete = completionPct === 100;

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        fullName: editName,
        bio: editBio,
        location: editLocation,
        skills: editSkills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      toast({ title: "Profile updated!" });
      setEditOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    try { await logout(); } catch {}
  };

  return (
    <MobileLayout>
      <div className="min-h-full bg-[#F8FAF9] pb-24">

        {/* ── Premium Header ── */}
        <div className="relative h-[290px] w-full overflow-hidden bg-gray-900 rounded-b-[56px] shadow-xl">
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 8, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, #0C6B38 0%, transparent 50%), radial-gradient(circle at 80% 80%, #15A34A 0%, transparent 50%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "18px 18px",
            }}
          />

          <div className="relative z-10 px-6 pt-[calc(env(safe-area-inset-top,0px)+1rem)] h-full flex flex-col items-center justify-center text-center">
            <div className="absolute top-[calc(env(safe-area-inset-top,0px)+0.75rem)] left-0 right-0 px-6 flex justify-between">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <LogOut size={18} className="text-white/60" />
              </motion.button>
              <Link href="/settings">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <Settings size={18} className="text-white/80" />
                </motion.button>
              </Link>
            </div>

            <div className="relative mb-3 group">
              <motion.div
                whileHover={{ scale: 1.04 }}
                className="p-1 rounded-[38px]"
                style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.18)" }}
              >
                <Avatar className="h-[88px] w-[88px] rounded-[34px]">
                  <AvatarImage src={avatar || undefined} className="object-cover" />
                  <AvatarFallback
                    className="text-white text-[28px] font-black rounded-[34px]"
                    style={{ background: "linear-gradient(135deg, #0C6B38, #15A34A)" }}
                  >
                    {displayName[0]}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => profileImageInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-9 h-9 bg-white rounded-[13px] flex items-center justify-center shadow-lg text-gray-900"
              >
                <Camera size={16} strokeWidth={2.5} />
              </motion.button>
              <input ref={profileImageInputRef} type="file" className="hidden" />
            </div>

            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-white text-[22px] font-black tracking-tight">{displayName}</h1>
              {profile?.id_verified && <ShieldCheck size={18} className="text-green-400" />}
            </div>
            <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-black uppercase tracking-widest">
              <MapPin size={11} />
              {location}
            </div>
            {bio && (
              <p className="text-white/40 text-xs mt-2 max-w-[240px] leading-relaxed line-clamp-2">{bio}</p>
            )}
          </div>
        </div>

        {/* ── Reputation Card ── */}
        <div className="px-5 -mt-10 relative z-20">
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-[36px] px-7 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-around"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Award className="text-amber-400" size={20} />
                <span className="text-[26px] font-black text-gray-900 tracking-tight">{profile?.reputation_score || 0}</span>
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Reputation</span>
            </div>

            <div className="w-px h-10 bg-gray-100" />

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="text-green-500" size={18} />
                <span className="text-[26px] font-black text-gray-900 tracking-tight">{profile?.total_tasks_done || 0}</span>
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tasks Done</span>
            </div>

            <div className="w-px h-10 bg-gray-100" />

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Zap className="text-blue-500" size={18} fill="#3B82F620" />
                <span className="text-[26px] font-black text-gray-900 tracking-tight">{profile?.success_rate || 100}%</span>
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Success</span>
            </div>
          </motion.div>
        </div>

        <div className="px-5 mt-5 space-y-5">

          {/* ── Profile Completion Card ── */}
          <AnimatePresence>
            {!isComplete && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-[28px] p-5 border"
                style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[12px] bg-amber-100 flex items-center justify-center">
                      <Star size={16} className="text-amber-500" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">Complete your profile</p>
                      <p className="text-[10px] text-gray-500 font-semibold">{completionCount}/{completionItems.length} steps done · {completionPct}%</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-600">{completionPct}%</span>
                </div>

                <div className="h-1.5 bg-amber-100 rounded-full mb-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full bg-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {completionItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? "bg-green-500" : "bg-amber-100 border border-amber-200"}`}
                      >
                        {item.done && <CheckCircle size={11} className="text-white" strokeWidth={3} />}
                      </div>
                      <span
                        className={`text-xs font-semibold ${item.done ? "text-gray-300 line-through" : "text-gray-700"}`}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setEditOpen(true)}
                  className="mt-4 w-full py-2.5 rounded-[14px] text-xs font-black text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors"
                >
                  Complete Profile
                </motion.button>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── Wallet Widget ── */}
          <section>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Financials</p>
            <Link href="/wallet">
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="rounded-[24px] p-5 flex items-center justify-between border cursor-pointer"
                style={{ background: "rgba(12,107,56,0.04)", borderColor: "rgba(12,107,56,0.12)" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 text-white rounded-xl flex items-center justify-center shadow-sm"
                    style={{ background: "#0C6B38" }}
                  >
                    <Wallet size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-[#0C6B38] uppercase tracking-widest">Wallet Balance</p>
                    <h4 className="text-[20px] font-black text-gray-900 tracking-tight">{formatLocal(availableBalance)}</h4>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#0C6B38]/30" />
              </motion.div>
            </Link>
          </section>

          {/* ── Skills ── */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Expertise</p>
              <button onClick={() => setEditOpen(true)} className="text-gray-300 hover:text-gray-500">
                <Edit2 size={13} />
              </button>
            </div>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="px-4 py-2 bg-white rounded-[14px] border border-gray-100 shadow-sm text-xs font-black text-gray-700"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-2 text-xs text-gray-400 font-semibold px-4 py-3 rounded-[16px] border border-dashed border-gray-200 w-full hover:border-gray-300 transition-colors"
              >
                <AlertCircle size={14} className="text-gray-300" />
                Add your skills to stand out
              </button>
            )}
          </section>

          {/* ── Trust & Reviews Placeholder ── */}
          <section>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Trust & Reviews</p>
            <div className="bg-white rounded-[24px] p-5 border border-gray-100">
              {profile?.total_reviews && profile.total_reviews > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star size={18} className="text-amber-400" fill="#FBBF24" />
                    <span className="text-xl font-black text-gray-900">{profile.rating?.toFixed(1) || "—"}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-semibold">{profile.total_reviews} review{profile.total_reviews !== 1 ? "s" : ""}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[14px] bg-gray-50 flex items-center justify-center">
                    <Star size={18} className="text-gray-200" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-700">No reviews yet</p>
                    <p className="text-[10px] text-gray-400 font-medium">Complete tasks to earn reviews</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Action Menu ── */}
          <section className="space-y-2.5 pb-4">
            {[
              { label: "Edit Profile",     icon: Edit2,       action: () => setEditOpen(true), color: "text-blue-500",   bg: "bg-blue-50"   },
              { label: "Security & Trust", icon: Shield,      href: "/settings",               color: "text-green-600",  bg: "bg-green-50"  },
              { label: "Help & Support",   icon: HelpCircle,  href: "/help",                   color: "text-amber-500",  bg: "bg-amber-50"  },
            ].map((item) => (
              <Link key={item.label} href={item.href || "#"}>
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={item.action}
                  className="bg-white p-4 rounded-[20px] border border-gray-50 shadow-sm flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-[13px] flex items-center justify-center`}>
                      <item.icon size={18} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-black text-gray-700 group-hover:text-gray-900">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-200" />
                </motion.div>
              </Link>
            ))}
          </section>
        </div>
      </div>

      {/* ── Edit Profile Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-[36px] p-7 border-none shadow-[0_24px_64px_rgba(0,0,0,0.14)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div>
              <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-2">Display Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-13 rounded-[16px] bg-gray-50 border-none font-bold" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-2">Location</label>
              <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="e.g. Lagos, Nigeria" className="h-13 rounded-[16px] bg-gray-50 border-none font-bold" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-2">Short Bio</label>
              <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="min-h-[90px] rounded-[20px] bg-gray-50 border-none font-medium text-sm" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-2">Skills (comma-separated)</label>
              <Input value={editSkills} onChange={(e) => setEditSkills(e.target.value)} placeholder="e.g. Cleaning, Delivery, Tech" className="h-13 rounded-[16px] bg-gray-50 border-none font-bold" />
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleSaveProfile}
              disabled={updateProfilePending}
              className="w-full text-white h-14 rounded-[20px] font-black flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #0C6B38 0%, #15A34A 100%)" }}
            >
              {updateProfilePending ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
