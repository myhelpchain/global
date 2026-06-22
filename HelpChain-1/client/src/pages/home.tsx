import { useEffect } from "react";
import { useLocation } from "wouter";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { HelpChainLogo } from "@/components/ui/helpchain-logo";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, loading } = useFirebaseAuth();

  useEffect(() => {
    if (loading) return;

    if (user) {
      const onboardingDone = localStorage.getItem("hc-onboarding-done") === "true";
      setLocation(onboardingDone ? "/dashboard" : "/onboarding");
      return;
    }

    const introSeen = localStorage.getItem("hc-intro-seen") === "true";
    setLocation(introSeen ? "/auth" : "/intro");
  }, [user, loading, setLocation]);

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center"
      style={{ background: "#F7FBF7" }}
    >
      <div className="flex flex-col items-center gap-6">
        <HelpChainLogo size="xl" />
        <div
          className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: "#0C6B38 transparent transparent transparent" }}
        />
      </div>
    </div>
  );
}
