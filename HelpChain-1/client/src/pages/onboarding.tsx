import { useState } from "react";
import { useLocation, Redirect } from "wouter";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useProfileApi } from "@/hooks/use-profile-api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Loader2, ChevronRight, ChevronLeft,
  Sparkles, User, Briefcase, Check, Navigation,
  ArrowRight
} from "lucide-react";

const SKILL_OPTIONS = [
  "Web Development", "Mobile Apps", "Design", "Writing", "Marketing",
  "Data Entry", "Translation", "Video Editing", "Photography", "Tutoring",
  "Cleaning", "Moving", "Delivery", "Handyman", "Cooking",
  "Pet Care", "Gardening", "Errands", "Research", "Consulting",
];

const GREEN = "#0C6B38";

const STEPS = [
  { icon: Sparkles, label: "Welcome" },
  { icon: User,     label: "Profile" },
  { icon: Briefcase,label: "Skills" },
];

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading, updateUserProfile } = useFirebaseAuth();
  const { updateProfile } = useProfileApi();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [fullName, setFullName] = useState(user?.displayName || "");
  const [bio, setBio] = useState("");
  const [location, setLocationVal] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", variant: "destructive" });
      setGettingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          const country = data.address?.country || "";
          setLocationVal(city ? `${city}, ${country}` : country || `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`);
        } catch {
          setLocationVal(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        }
        setGettingLocation(false);
      },
      (err) => {
        toast({ title: "Location access denied", description: err.message, variant: "destructive" });
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await updateProfile({
        fullName: fullName || user?.displayName || "User",
        bio,
        location,
        skills: selectedSkills,
        email: user?.email || undefined,
      });
      if (fullName && fullName !== user?.displayName) {
        await updateUserProfile({ displayName: fullName });
      }
      localStorage.setItem("hc-onboarding-done", "true");
      toast({ title: "You're all set!", description: "Welcome to HelpChain. Let's find you some great tasks." });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAF8" }}>
        <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${GREEN} transparent transparent transparent` }} />
      </div>
    );
  }

  if (!user) return <Redirect to="/auth" />;

  const progress = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #F0FDF4 0%, #F8FAF8 50%, #EFF6FF 100%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <img src="/images/helpchain-logo.png" alt="HelpChain" className="h-7 w-auto" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span className="font-bold text-lg" style={{ color: GREEN }}>HelpChain</span>
        </div>
        {step < STEPS.length - 1 && (
          <button
            onClick={() => setLocation("/dashboard")}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center rounded-full transition-all duration-300"
                    style={{
                      width: active ? 36 : 32,
                      height: active ? 36 : 32,
                      background: done ? GREEN : active ? GREEN : "#E5E7EB",
                      boxShadow: active ? `0 0 0 4px ${GREEN}20` : "none",
                    }}
                  >
                    {done ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <s.icon className="w-4 h-4 transition-colors" style={{ color: active ? "white" : "#9CA3AF" }} />
                    )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className="h-0.5 w-8 rounded-full transition-all duration-500"
                      style={{ background: done ? GREEN : "#E5E7EB" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-100 rounded-full mb-8 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: GREEN }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 0: WELCOME ── */}
            {step === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="rounded-3xl p-8 text-center"
                  style={{ background: "white", border: "1px solid #E9F0E9", boxShadow: "0 4px 24px rgba(12,107,56,0.06), 0 1px 4px rgba(0,0,0,0.04)" }}
                >
                  {/* Icon */}
                  <div className="relative inline-block mb-6">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
                      style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`, boxShadow: `0 8px 24px ${GREEN}40` }}
                    >
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                      <span className="text-xs font-bold text-yellow-900">✦</span>
                    </div>
                  </div>

                  <h1 className="text-2xl font-bold text-[#0D0D0D] mb-2">
                    Welcome{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}!
                  </h1>
                  <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-xs mx-auto">
                    Let's set up your profile so you can start posting tasks or helping others. Takes less than 2 minutes.
                  </p>

                  {/* Feature bullets */}
                  <div className="space-y-3 mb-8 text-left">
                    {[
                      "Post tasks and get offers fast",
                      "Earn money helping people nearby",
                      "Escrow-protected payments always",
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#F0FDF4", border: `1px solid #BBF7D0` }}>
                          <Check className="w-3 h-3" style={{ color: GREEN }} />
                        </div>
                        <span className="text-sm text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep(1)}
                    className="w-full h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`, boxShadow: `0 4px 16px ${GREEN}40` }}
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 1: PROFILE ── */}
            {step === 1 && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="rounded-3xl p-8"
                  style={{ background: "white", border: "1px solid #E9F0E9", boxShadow: "0 4px 24px rgba(12,107,56,0.06), 0 1px 4px rgba(0,0,0,0.04)" }}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#0D0D0D]">Tell us about yourself</h2>
                    <p className="text-sm text-gray-400 mt-1">This helps others find and trust you on the platform</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g., Adaeze Okonkwo"
                        className="h-12 rounded-xl border-gray-200 focus:border-[#0C6B38] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Short Bio</label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="What do you do? What are you good at? (optional)"
                        className="rounded-xl border-gray-200 focus:border-[#0C6B38] text-sm min-h-[90px] resize-none"
                        maxLength={300}
                      />
                      <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/300</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Location</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            value={location}
                            onChange={(e) => setLocationVal(e.target.value)}
                            placeholder="e.g., Lagos, Nigeria"
                            className="h-12 pl-10 rounded-xl border-gray-200 focus:border-[#0C6B38] text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          disabled={gettingLocation}
                          className="h-12 px-4 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all hover:bg-gray-50 disabled:opacity-50"
                          style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
                        >
                          {gettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                          Detect
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep(0)}
                      className="flex-1 h-12 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all hover:bg-gray-50"
                      style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      disabled={!fullName.trim()}
                      className="flex-1 h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                      style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)` }}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: SKILLS ── */}
            {step === 2 && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="rounded-3xl p-8"
                  style={{ background: "white", border: "1px solid #E9F0E9", boxShadow: "0 4px 24px rgba(12,107,56,0.06), 0 1px 4px rgba(0,0,0,0.04)" }}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#0D0D0D]">What are your skills?</h2>
                    <p className="text-sm text-gray-400 mt-1">Select all that apply — this is optional and can be changed later</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {SKILL_OPTIONS.map((skill) => {
                      const selected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150"
                          style={{
                            background: selected ? GREEN : "white",
                            color: selected ? "white" : "#4B5563",
                            borderColor: selected ? GREEN : "#E5E7EB",
                            boxShadow: selected ? `0 2px 8px ${GREEN}30` : "none",
                          }}
                        >
                          {selected && <Check className="w-3 h-3" />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>

                  {selectedSkills.length > 0 && (
                    <p className="text-xs mb-4 font-medium" style={{ color: GREEN }}>
                      {selectedSkills.length} skill{selectedSkills.length !== 1 ? "s" : ""} selected
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all hover:bg-gray-50"
                      style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={handleComplete}
                      disabled={saving}
                      className="flex-1 h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60"
                      style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`, boxShadow: `0 4px 16px ${GREEN}40` }}
                    >
                      {saving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> Complete Setup</>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* step label */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Step {step + 1} of {STEPS.length} — {STEPS[step].label}
          </p>
        </div>
      </div>
    </div>
  );
}
