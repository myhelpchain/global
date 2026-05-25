import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, DollarSign, Shield, Rocket } from "lucide-react";

const GREEN = "#0C6B38";

const SLIDES = [
  {
    icon: Zap,
    color: "#F97316",
    bg: "linear-gradient(135deg, #FFF7ED 0%, #FFF3E0 100%)",
    iconBg: "#F97316",
    title: "Get Help Fast",
    description: "Post any task and receive offers from verified helpers within minutes. From home repairs to design work.",
    dots: ["#F97316", "#FED7AA", "#FFEDD5"],
  },
  {
    icon: DollarSign,
    color: "#3B82F6",
    bg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
    iconBg: "#3B82F6",
    title: "Earn by Helping",
    description: "Turn your skills into real income. Browse open tasks near you and start earning money today.",
    dots: ["#3B82F6", "#BFDBFE", "#DBEAFE"],
  },
  {
    icon: Shield,
    color: GREEN,
    bg: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
    iconBg: GREEN,
    title: "Safe & Secure",
    description: "Every payment is held in escrow until you approve the work. Zero risk, total peace of mind.",
    dots: [GREEN, "#BBF7D0", "#DCFCE7"],
  },
  {
    icon: Rocket,
    color: "#8B5CF6",
    bg: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
    iconBg: "#8B5CF6",
    title: "Start Your Journey",
    description: "Join thousands of Nigerians already posting tasks and earning money on HelpChain.",
    dots: ["#8B5CF6", "#DDD6FE", "#EDE9FE"],
  },
];

function IllustrationScene({ slide, index }: { slide: typeof SLIDES[0]; index: number }) {
  const Icon = slide.icon;
  return (
    <div
      className="w-full rounded-3xl flex items-center justify-center relative overflow-hidden"
      style={{ height: 260, background: slide.bg }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.15, 0.22, 0.15] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute rounded-full"
          style={{
            width: 180, height: 180,
            background: `radial-gradient(circle, ${slide.iconBg}22 0%, transparent 70%)`,
            top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          }}
        />
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -12, 0],
              opacity: [0.25, 0.5, 0.25],
            }}
            transition={{
              duration: 2.5 + i * 0.4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
            className="absolute rounded-full"
            style={{
              width: 8 + i * 3,
              height: 8 + i * 3,
              background: slide.dots[i % 3],
              left: `${12 + i * 18}%`,
              top: `${20 + (i % 3) * 20}%`,
              opacity: 0.35,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${slide.iconBg} 0%, ${slide.iconBg}CC 100%)`,
            boxShadow: `0 12px 36px ${slide.iconBg}40`,
          }}
        >
          <Icon className="w-12 h-12 text-white" strokeWidth={1.8} />
        </motion.div>

        {index === 0 && (
          <motion.div
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white"
            style={{ background: "rgba(249,115,22,0.85)", backdropFilter: "blur(8px)" }}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            3 offers received!
          </motion.div>
        )}
        {index === 1 && (
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="px-4 py-2 rounded-full text-xs font-bold text-white"
            style={{ background: "rgba(59,130,246,0.85)" }}
          >
            ₦45,000 earned today
          </motion.div>
        )}
        {index === 2 && (
          <motion.div
            animate={{ scale: [0.95, 1, 0.95] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-4 py-2 rounded-full text-xs font-bold text-white"
            style={{ background: `rgba(12,107,56,0.85)` }}
          >
            ✓ Escrow protected
          </motion.div>
        )}
        {index === 3 && (
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-3xl"
          >
            🇳🇬
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function IntroOnboardingPage() {
  const [current, setCurrent] = useState(0);
  const [, setLocation] = useLocation();

  const isLast = current === SLIDES.length - 1;

  const handleSkip = () => {
    localStorage.setItem("hc-intro-seen", "true");
    setLocation("/auth");
  };

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem("hc-intro-seen", "true");
      setLocation("/auth");
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const slide = SLIDES[current];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#FAFAFA", fontFamily: "'Figtree', sans-serif" }}
    >
      <div className="flex items-center justify-between px-6 pt-14 pb-4">
        <div className="flex items-center gap-2">
          <img
            src="/images/helpchain-logo.png"
            alt="HelpChain"
            className="w-8 h-8 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className="font-bold text-base" style={{ color: GREEN }}>HelpChain</span>
        </div>
        <button
          onClick={handleSkip}
          className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors px-3 py-1.5"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col flex-1"
          >
            <IllustrationScene slide={slide} index={current} />

            <div className="mt-8 flex-1">
              <h1
                className="text-2xl font-bold text-[#0D0D0D] mb-3 leading-tight"
              >
                {slide.title}
              </h1>
              <p className="text-[15px] text-gray-500 leading-relaxed">
                {slide.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 space-y-5">
          <div className="flex items-center justify-center gap-2">
            {SLIDES.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setCurrent(i)}
                animate={{
                  width: i === current ? 24 : 8,
                  background: i === current ? GREEN : "#D1D5DB",
                }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            className="w-full h-14 rounded-2xl text-white text-base font-bold flex items-center justify-center gap-2 transition-all"
            style={{
              background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`,
              boxShadow: `0 6px 24px rgba(12,107,56,0.35)`,
            }}
          >
            {isLast ? "Get Started" : "Next"}
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          {isLast && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                localStorage.setItem("hc-intro-seen", "true");
                setLocation("/auth?mode=login");
              }}
              className="w-full text-sm text-gray-500 font-medium py-2"
            >
              Already have an account? <span style={{ color: GREEN }}>Sign in</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
