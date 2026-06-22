import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

const brand = {
  green: "#0B5F34",
  mint: "#2BCB7F",
  ink: "#081C15",
  paper: "#F7FBF7",
};

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(onComplete, reduceMotion ? 900 : 2600);
    return () => clearTimeout(timer);
  }, [onComplete, reduceMotion]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: brand.paper }}
      exit={{ opacity: 0, scale: 1.01 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,#E9F7EF_0%,rgba(247,251,247,0)_100%)]" />

      <motion.div
        className="relative flex flex-col items-center px-8"
        initial={reduceMotion ? false : { y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.svg
          width="148"
          height="116"
          viewBox="0 0 148 116"
          fill="none"
          role="img"
          aria-label="HelpChain"
        >
          <motion.path
            d="M48 54C39.2 54 32 61.2 32 70C32 78.8 39.2 86 48 86H66"
            stroke={brand.green}
            strokeWidth="12"
            strokeLinecap="round"
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.72, ease: "easeInOut" }}
          />
          <motion.path
            d="M100 62C108.8 62 116 54.8 116 46C116 37.2 108.8 30 100 30H82"
            stroke={brand.green}
            strokeWidth="12"
            strokeLinecap="round"
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.72, delay: 0.18, ease: "easeInOut" }}
          />
          <motion.path
            d="M58 58H90"
            stroke={brand.mint}
            strokeWidth="12"
            strokeLinecap="round"
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.44, delay: 0.74, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.circle
            cx="74"
            cy="58"
            r="8"
            fill={brand.mint}
            initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.18, 1], opacity: 1 }}
            transition={{ duration: 0.44, delay: 1.06, ease: [0.34, 1.56, 0.64, 1] }}
          />
          <motion.path
            d="M74 58L94 78"
            stroke={brand.ink}
            strokeWidth="4"
            strokeLinecap="round"
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.34, delay: 1.25 }}
          />
          <motion.circle
            cx="98"
            cy="82"
            r="10"
            fill="white"
            stroke={brand.ink}
            strokeWidth="4"
            initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.34, delay: 1.45, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </motion.svg>

        <div className="mt-1 overflow-hidden">
          <motion.h1
            className="text-[2rem] font-black leading-none"
            style={{ color: brand.ink, letterSpacing: 0 }}
            initial={reduceMotion ? false : { y: 34 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            HelpChain
          </motion.h1>
        </div>

        <motion.p
          className="mt-3 text-center text-sm font-semibold"
          style={{ color: "#5B6F64", letterSpacing: 0 }}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 1.42 }}
        >
          Get help anywhere, anytime.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
