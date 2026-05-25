import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0a5a30 0%, #0C6B38 40%, #0d7d42 80%, #0a6b35 100%)" }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Morphing blob background */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 500, height: 500,
          background: "radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%)",
          top: "50%", left: "50%", x: "-50%", y: "-50%",
        }}
        animate={{ scale: [1, 1.15, 0.95, 1], rotate: [0, 15, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating orbs */}
      {[
        { size: 280, x: -20, y: -30, opacity: 0.07, delay: 0 },
        { size: 200, x: 60, y: 60, opacity: 0.05, delay: 0.6 },
        { size: 160, x: -50, y: 55, opacity: 0.06, delay: 1.2 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size, height: orb.size,
            background: "rgba(255,255,255,1)",
            filter: "blur(40px)",
            right: `${orb.x}%`,
            top: `${orb.y}%`,
            opacity: orb.opacity,
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [orb.opacity, orb.opacity * 1.5, orb.opacity] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
        />
      ))}

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Center content */}
      <div className="relative flex flex-col items-center">
        {/* Pulse rings */}
        {[120, 180, 240].map((size, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/10"
            style={{ width: size, height: size }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.8, 1.4], opacity: [0.4, 0] }}
            transition={{
              delay: 0.8 + i * 0.2,
              duration: 1.8,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 1.2,
            }}
          />
        ))}

        {/* Logo container */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1], delay: 0.15 }}
          className="relative z-10 mb-7"
        >
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ delay: 1.2, duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-32 rounded-[36px] flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.14)",
              border: "1.5px solid rgba(255,255,255,0.25)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)",
              backdropFilter: "blur(16px)",
            }}
          >
            <img
              src="/images/helpchain-logo.png"
              alt="HelpChain"
              className="w-18 h-18 object-contain"
              style={{ width: 72, height: 72 }}
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
                const parent = el.parentElement!;
                parent.innerHTML = `<span style="font-size:3.2rem;font-weight:900;color:white;letter-spacing:-3px;font-family:'Figtree',sans-serif;line-height:1">H</span>`;
              }}
            />
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="text-center"
        >
          <h1
            className="text-[2.6rem] font-bold text-white leading-none"
            style={{ letterSpacing: "-0.04em", fontFamily: "'Figtree', sans-serif" }}
          >
            HelpChain
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="text-white/45 text-[11px] font-semibold tracking-[0.18em] uppercase mt-2.5"
          >
            Nigeria's Task Marketplace
          </motion.p>
        </motion.div>
      </div>

      {/* Loading bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="absolute bottom-20 flex flex-col items-center gap-4"
      >
        <div
          className="rounded-full overflow-hidden"
          style={{ width: 52, height: 2.5, background: "rgba(255,255,255,0.12)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "rgba(255,255,255,0.75)" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 1.2, duration: 1.7, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>

        <div className="flex items-center gap-1.5">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.25, 0.9, 0.25], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.1, repeat: Infinity, delay, ease: "easeInOut" }}
              className="w-1.5 h-1.5 rounded-full bg-white/55"
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
