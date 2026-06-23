import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function LoadingScreen() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: "#F8FAF8" }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-4 animate-spin"
          style={{ borderColor: "#0C6B38 transparent transparent transparent" }}
        />
        <p className="text-sm text-gray-400 font-medium">Loading…</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useFirebaseAuth();
  const [, setLocation] = useLocation();

  const onboardingDone =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("hc-onboarding-done") === "true"
      : false;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setLocation("/auth");
      return;
    }
    if (!onboardingDone) {
      setLocation("/onboarding");
    }
  }, [user, loading, onboardingDone, setLocation]);

  // Always show spinner while auth is resolving or redirect is pending
  if (loading) return <LoadingScreen />;
  if (!user) return <LoadingScreen />;
  if (!onboardingDone) return <LoadingScreen />;

  return <>{children}</>;
}
