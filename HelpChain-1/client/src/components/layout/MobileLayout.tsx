import { BottomNav } from "./BottomNav";

interface MobileLayoutProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
  className?: string;
}

export function MobileLayout({ children, hideBottomNav, className }: MobileLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F8FAF8", fontFamily: "'Figtree', sans-serif" }}
    >
      <div className={`flex-1 pb-20 ${className || ""}`} style={{ paddingBottom: hideBottomNav ? "0" : "calc(80px + env(safe-area-inset-bottom, 0px))" }}>
        {children}
      </div>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
