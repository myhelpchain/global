import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

interface MobileHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  transparent?: boolean;
}

export function MobileHeader({ title, onBack, right, transparent }: MobileHeaderProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div
      className="sticky top-0 z-40 flex items-center justify-between px-4 h-14"
      style={{
        background: transparent ? "transparent" : "rgba(255,255,255,0.97)",
        backdropFilter: transparent ? "none" : "blur(20px)",
        borderBottom: transparent ? "none" : "1px solid rgba(0,0,0,0.05)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={handleBack}
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: transparent ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.04)" }}
      >
        <ChevronLeft className="w-5 h-5" style={{ color: transparent ? "white" : "#0D0D0D" }} />
      </motion.button>

      <h1
        className="text-base font-bold absolute left-1/2 -translate-x-1/2"
        style={{ color: transparent ? "white" : "#0D0D0D", fontFamily: "'Figtree', sans-serif" }}
      >
        {title}
      </h1>

      <div className="w-9 h-9 flex items-center justify-center">
        {right || null}
      </div>
    </div>
  );
}
