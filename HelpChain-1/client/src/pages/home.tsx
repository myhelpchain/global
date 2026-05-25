import { useEffect } from "react";
import { useLocation } from "wouter";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, loading } = useFirebaseAuth();

  useEffect(() => {
    if (loading) return;
    if (user) {
      const onboardingDone = localStorage.getItem("hc-onboarding-done");
      const onboardingSkipped = localStorage.getItem("hc-onboarding-skipped");
      setLocation((onboardingDone || onboardingSkipped) ? "/dashboard" : "/onboarding");
    } else {
      const introSeen = localStorage.getItem("hc-intro-seen");
      setLocation(introSeen ? "/auth" : "/intro");
    }
  }, [user, loading, setLocation]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0C6B38 0%, #0a5a30 100%)" }}
    >
      <Loader2 className="w-8 h-8 text-white animate-spin" />
    </div>
  );
}
