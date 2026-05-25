import { useEffect } from "react";
import { motion } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center z-[9999] overflow-hidden"
      style={{ background: "linear-gradient(145deg, #0C6B38 0%, #0a5a30 55%, #084a27 100%)" }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="pointer-events-none absolute"
        style={{ top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute"
        style={{ bottom: "-60px", left: "-60px", width: "260px", height: "260px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col items-center gap-5"
      >
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ delay: 0.7, duration: 0.6, ease: "easeInOut" }}
          className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
        >
          <img
            src="/images/helpchain-logo.png"
            alt="HelpChain"
            className="w-20 h-20 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.innerHTML =
                '<span style="color:white;font-size:2.5rem;font-weight:900">H</span>';
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.45 }}
          className="text-center"
        >
          <h1
            className="text-[2.2rem] font-bold text-white tracking-tight leading-none"
            style={{ fontFamily: "'Figtree', sans-serif" }}
          >
            HelpChain
          </h1>
          <p className="text-white/55 text-sm mt-2 font-medium tracking-wide">Nigeria's task marketplace</p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.5 }}
        className="absolute bottom-14 flex items-center gap-2"
      >
        {[0, 150, 300].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: delay / 1000 }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.45)" }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
