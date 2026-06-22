import { cn } from "@/lib/utils";

interface HelpChainLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "mark";
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

const sizeMap = {
  xs: "h-5 w-[1.75rem]",
  sm: "h-7 w-10",
  md: "h-9 w-[3.25rem]",
  lg: "h-12 w-[4.4rem]",
  xl: "h-16 w-24",
  mark: "h-full w-full",
};

export function HelpChainLogo({
  size = "md",
  className,
  showWordmark = false,
  wordmarkClassName,
}: HelpChainLogoProps) {
  const mark = (
    <svg
      viewBox="0 0 148 116"
      fill="none"
      role="img"
      aria-label="HelpChain"
      className={cn(sizeMap[size], "shrink-0 overflow-visible", className)}
    >
      <path
        d="M48 54C39.2 54 32 61.2 32 70C32 78.8 39.2 86 48 86H66"
        stroke="#0B5F34"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M100 62C108.8 62 116 54.8 116 46C116 37.2 108.8 30 100 30H82"
        stroke="#0B5F34"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M58 58H90"
        stroke="#2BCB7F"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <circle cx="98" cy="82" r="10" fill="#F7FBF7" stroke="#081C15" strokeWidth="4" />
      <path d="M74 58L94 78" stroke="#081C15" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );

  if (!showWordmark) return mark;

  return (
    <span className="inline-flex items-center gap-2">
      {mark}
      <span className={cn("font-black tracking-normal text-[#081C15]", wordmarkClassName)}>
        HelpChain
      </span>
    </span>
  );
}
