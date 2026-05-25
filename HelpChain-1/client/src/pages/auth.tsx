import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useSearch } from "wouter";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Loader2, ArrowLeft } from "lucide-react";

const GREEN = "#0C6B38";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const initialMode = new URLSearchParams(search).get("mode") || "login";

  const { user, signIn, signUp, signInWithGoogle, resetPassword, loading } = useFirebaseAuth();
  const { sendWelcomeNotification } = useNotifications();
  const { toast } = useToast();

  const [mode, setMode] = useState<"login" | "signup" | "reset">(
    initialMode === "signup" ? "signup" : initialMode === "reset" ? "reset" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (user) {
      const onboardingDone = localStorage.getItem("hc-onboarding-done");
      const onboardingSkipped = localStorage.getItem("hc-onboarding-skipped");
      setLocation((onboardingDone || onboardingSkipped) ? "/dashboard" : "/onboarding");
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        toast({ title: "Welcome back!" });
        setLocation("/dashboard");
      } else if (mode === "signup") {
        if (password !== confirmPassword) {
          toast({ title: "Passwords don't match", variant: "destructive" });
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
          setIsSubmitting(false);
          return;
        }
        await signUp(email, password, displayName);
        setTimeout(() => sendWelcomeNotification(displayName), 2000);
        toast({ title: "Account created! 🎉", description: "Welcome to HelpChain!" });
        setLocation("/onboarding");
      } else {
        await resetPassword(email);
        toast({ title: "Reset email sent", description: "Check your inbox." });
        setMode("login");
      }
    } catch (error: any) {
      let message = error.message || "An error occurred";
      if (message.includes("auth/invalid-credential")) message = "Invalid email or password";
      else if (message.includes("auth/email-already-in-use")) message = "Email already in use";
      else if (message.includes("auth/weak-password")) message = "Password too weak";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      const onboardingDone = localStorage.getItem("hc-onboarding-done");
      const onboardingSkipped = localStorage.getItem("hc-onboarding-skipped");
      setTimeout(() => sendWelcomeNotification(user?.displayName || undefined), 2000);
      toast({ title: "Welcome!" });
      setLocation((onboardingDone || onboardingSkipped) ? "/dashboard" : "/onboarding");
    } catch (error: any) {
      if (error?.message?.includes("cancelled") || error?.code === "auth/popup-closed-by-user") return;
      toast({ title: "Error", description: error.message || "Failed to sign in", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAF8" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: GREEN }} />
      </div>
    );
  }

  const modeTitle = mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password";
  const modeSub = mode === "login" ? "Sign in to your account" : mode === "signup" ? "Join HelpChain today" : "Enter your email below";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#FAFAFA", fontFamily: "'Figtree', sans-serif" }}
    >
      <div
        className="h-52 relative overflow-hidden flex-shrink-0"
        style={{ background: `linear-gradient(145deg, ${GREEN} 0%, #0a5a30 55%, #084a27 100%)` }}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: "white", transform: "translate(30%,-30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5 pointer-events-none"
          style={{ background: "white", transform: "translate(-30%,30%)" }}
        />

        <div className="flex items-center justify-between px-5 pt-14 pb-0">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const introSeen = localStorage.getItem("hc-intro-seen");
              setLocation(introSeen ? "/intro" : "/intro");
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <div className="flex items-center gap-2">
            <img
              src="/images/helpchain-logo.png"
              alt="HelpChain"
              className="w-7 h-7 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span className="text-white font-bold text-base">HelpChain</span>
          </div>
          <div className="w-9" />
        </div>

        <div className="px-6 pt-5">
          <motion.h1
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white"
          >
            {modeTitle}
          </motion.h1>
          <p className="text-white/60 text-sm mt-1">{modeSub}</p>
        </div>
      </div>

      <div className="flex-1 px-5 -mt-5 pb-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-6" style={{ border: "1px solid rgba(0,0,0,0.04)" }}>

          {mode !== "reset" && (
            <>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                className="w-full h-12 rounded-2xl flex items-center justify-center gap-3 text-sm font-semibold transition-all mb-5"
                style={{ background: "#F8F9FA", border: "1.5px solid #E5E7EB", color: "#374151" }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </motion.button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Full name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-gray-200 text-sm"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 rounded-xl border-gray-200 text-sm"
                required
              />
            </div>

            {mode !== "reset" && (
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-11 h-12 rounded-xl border-gray-200 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-gray-200 text-sm"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {mode === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-xs font-medium"
                  style={{ color: GREEN }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full h-13 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              style={{
                height: 52,
                background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`,
                boxShadow: `0 6px 20px rgba(12,107,56,0.32)`,
              }}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === "login" && "Sign In"}
                  {mode === "signup" && "Create Account"}
                  {mode === "reset" && "Send Reset Link"}
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            {mode === "login" && (
              <p>
                New to HelpChain?{" "}
                <button onClick={() => setMode("signup")} className="font-semibold" style={{ color: GREEN }}>
                  Create account
                </button>
              </p>
            )}
            {mode === "signup" && (
              <p>
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="font-semibold" style={{ color: GREEN }}>
                  Sign in
                </button>
              </p>
            )}
            {mode === "reset" && (
              <p>
                <button onClick={() => setMode("login")} className="font-semibold" style={{ color: GREEN }}>
                  Back to sign in
                </button>
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed px-4">
          By continuing, you agree to HelpChain's{" "}
          <span style={{ color: GREEN }}>Terms of Service</span> and{" "}
          <span style={{ color: GREEN }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
