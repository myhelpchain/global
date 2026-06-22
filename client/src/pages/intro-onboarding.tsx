import { useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, HandHeart, ShieldCheck } from "lucide-react";
import { HelpChainLogo } from "@/components/ui/helpchain-logo";

const brand = {
  ink: "#081C15",
  green: "#0B5F34",
  mint: "#2BCB7F",
  lime: "#A7F264",
  gold: "#F6B94B",
  paper: "#F7FBF7",
};

const slides = [
  {
    label: "Request",
    title: "Post what you need. HelpChain organizes the rest.",
    body: "Describe the task, budget, location, and urgency. The app turns that into a clear request helpers can trust.",
    icon: BriefcaseBusiness,
  },
  {
    label: "Match",
    title: "The right helpers move closer to the work.",
    body: "Skills, location, availability, and profile strength help the best people surface faster.",
    icon: HandHeart,
  },
  {
    label: "Protect",
    title: "Escrow keeps both sides serious.",
    body: "Money stays protected until the work is accepted, reviewed, and completed properly.",
    icon: ShieldCheck,
  },
];

function MotionScene({ active }: { active: number }) {
  const reduceMotion = useReducedMotion();
  const isMatch = active === 1;
  const isProtect = active === 2;

  return (
    <div className="relative h-[330px] overflow-hidden rounded-[30px] border border-[#DDECE2] bg-[#ECF8F0]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(43,203,127,0.24),transparent_32%),radial-gradient(circle_at_80%_72%,rgba(246,185,75,0.18),transparent_34%)]" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 330" fill="none">
        <motion.path
          d="M54 226C92 120 144 110 178 168C216 232 275 226 310 104"
          stroke={brand.green}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="10 12"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.28 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />

        <motion.path
          d="M86 96H138C158 96 174 112 174 132C174 152 158 168 138 168H102"
          stroke={brand.green}
          strokeWidth="13"
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />
        <motion.path
          d="M274 220H222C202 220 186 204 186 184C186 164 202 148 222 148H258"
          stroke={brand.green}
          strokeWidth="13"
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, delay: 0.12, ease: "easeInOut" }}
        />
        <motion.path
          d="M137 158H224"
          stroke={brand.mint}
          strokeWidth="13"
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>

      <motion.div
        className="absolute left-9 top-16 h-16 w-16 rounded-2xl bg-white shadow-[0_18px_50px_rgba(8,28,21,0.12)]"
        animate={reduceMotion ? {} : { y: active === 0 ? [0, -6, 0] : 0, scale: active === 0 ? 1.05 : 1 }}
        transition={{ duration: 2, repeat: active === 0 ? Infinity : 0, ease: "easeInOut" }}
      >
        <div className="flex h-full w-full items-center justify-center">
          <BriefcaseBusiness className="h-7 w-7" color={brand.green} />
        </div>
      </motion.div>

      <motion.div
        className="absolute right-9 bottom-16 h-16 w-16 rounded-2xl bg-white shadow-[0_18px_50px_rgba(8,28,21,0.12)]"
        animate={reduceMotion ? {} : { y: isMatch ? [0, -7, 0] : 0, scale: isMatch ? 1.06 : 1 }}
        transition={{ duration: 1.8, repeat: isMatch ? Infinity : 0, ease: "easeInOut" }}
      >
        <div className="flex h-full w-full items-center justify-center">
          <HandHeart className="h-7 w-7" color={brand.green} />
        </div>
      </motion.div>

      <motion.div
        className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[28px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(11,95,52,0.18)] backdrop-blur-xl"
        animate={reduceMotion ? {} : { scale: isProtect ? [1, 1.08, 1] : 1 }}
        transition={{ duration: 1.5, repeat: isProtect ? Infinity : 0 }}
      >
        <ShieldCheck className="h-11 w-11" color={isProtect ? brand.gold : brand.green} />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/70 bg-white/82 p-4 shadow-[0_16px_45px_rgba(8,28,21,0.10)] backdrop-blur-xl"
          initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.28 }}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: active === 2 ? brand.gold : brand.mint }} />
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5E7167]">{slides[active].label}</p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="h-2 flex-1 rounded-full bg-[#DDECE2]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: brand.green }}
                initial={{ width: "18%" }}
                animate={{ width: `${34 + active * 30}%` }}
              />
            </div>
            <span className="text-xs font-black text-[#5E7167]">{active + 1}/3</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function IntroOnboardingPage() {
  const [active, setActive] = useState(0);
  const [, setLocation] = useLocation();
  const CurrentIcon = slides[active].icon;
  const isLast = active === slides.length - 1;

  const continueFlow = () => {
    if (!isLast) {
      setActive((value) => value + 1);
      return;
    }
    localStorage.setItem("hc-intro-seen", "true");
    setLocation("/auth?mode=signup");
  };

  return (
    <main className="min-h-[100dvh] overflow-hidden px-5 pb-6 pt-[calc(env(safe-area-inset-top,0px)+1rem)]" style={{ background: brand.paper }}>
      <header className="mx-auto flex w-full max-w-md items-center justify-between">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 rounded-full border border-[#DDECE2] bg-white px-3 py-2 text-sm font-black text-[#173D2A]"
        >
          <HelpChainLogo size="xs" />
          HelpChain
        </button>
        <button
          onClick={() => setLocation("/auth?mode=login")}
          className="rounded-full px-4 py-2 text-sm font-bold text-[#5E7167]"
        >
          Sign in
        </button>
      </header>

      <section className="mx-auto mt-6 flex w-full max-w-md flex-col">
        <MotionScene active={active} />

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="mt-8"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.26 }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_10px_30px_rgba(8,28,21,0.08)]">
              <CurrentIcon className="h-6 w-6" color={brand.green} />
            </div>
            <h1 className="text-[2rem] font-black leading-[1.04] text-[#081C15]" style={{ letterSpacing: 0 }}>
              {slides[active].title}
            </h1>
            <p className="mt-4 text-[15px] font-medium leading-7 text-[#5E7167]">
              {slides[active].body}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.label}
              onClick={() => setActive(index)}
              aria-label={`Show ${slide.label}`}
              className="h-2 rounded-full transition-all"
              style={{
                width: index === active ? 34 : 9,
                background: index === active ? brand.green : "#CFE1D5",
              }}
            />
          ))}
        </div>

        <div className="mt-7 grid grid-cols-[1fr_auto] gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={continueFlow}
            className="h-14 rounded-2xl text-sm font-black text-white shadow-[0_16px_36px_rgba(11,95,52,0.26)]"
            style={{ background: `linear-gradient(135deg, ${brand.green}, #159653)` }}
          >
            {isLast ? "Create your account" : "Continue"}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={continueFlow}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#081C15] text-white"
            aria-label="Continue"
          >
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </div>
      </section>
    </main>
  );
}
