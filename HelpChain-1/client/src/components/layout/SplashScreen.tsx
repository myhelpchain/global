import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0C6B38 0%, #085c30 45%, #063f22 100%)" }}
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        className="absolute top-[-100px] right-[-100px] rounded-full pointer-events-none"
        style={{ width: 380, height: 380, background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)" }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-80px] left-[-80px] rounded-full pointer-events-none"
        style={{ width: 300, height: 300, background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 65%)" }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      <div className="relative flex items-center justify-center mb-9">
        {[96, 144, 200].map((size, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/15"
            style={{ width: size, height: size }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.85, 1.35, 1.35], opacity: [0, 0.45, 0] }}
            transition={{
              delay: 0.55 + i * 0.18,
              duration: 1.6,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 1.4,
            }}
          />
        ))}

        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative z-10 w-28 h-28 rounded-[32px] flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.16)",
            border: "1.5px solid rgba(255,255,255,0.28)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
            backdropFilter: "blur(12px)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.07, 1] }}
            transition={{ delay: 0.9, duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src="/images/helpchain-logo.png"
              alt="HelpChain"
              className="w-16 h-16 object-contain"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
                const parent = el.parentElement!;
                parent.innerHTML = `<span style="font-size:3rem;font-weight:900;color:white;letter-spacing:-2px;font-family:'Figtree',sans-serif">H</span>`;
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="text-center"
      >
        <motion.h1
          className="text-[2.4rem] font-bold text-white leading-none tracking-tight"
          style={{ fontFamily: "'Figtree', sans-serif", letterSpacing: "-0.03em" }}
        >
          HelpChain
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.5 }}
          className="text-white/50 text-[13px] mt-2 font-medium tracking-[0.06em] uppercase"
        >
          Nigeria's Task Marketplace
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 1.1, duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
        className="absolute bottom-16 overflow-hidden rounded-full"
        style={{ width: 48, height: 3, background: "rgba(255,255,255,0.15)", transformOrigin: "left" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "rgba(255,255,255,0.7)" }}
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ delay: 1.1, duration: 1.55, ease: [0.4, 0, 0.2, 1] }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.4 }}
        className="absolute bottom-8 flex items-center gap-1.5"
      >
        {[0, 0.18, 0.36].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-white/60"
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
