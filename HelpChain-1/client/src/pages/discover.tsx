import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Input } from "@/components/ui/input";
import {
  Search, MapPin, Clock, Filter, Globe, Users, X, Loader2,
  ChevronRight, SlidersHorizontal, Briefcase
} from "lucide-react";
import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useTasksApi, type TaskData } from "@/hooks/use-tasks-api";
import { useLocalizationStore } from "@/stores/localization-store";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";

const GREEN = "#0C6B38";

const CATEGORY_MAP: Record<string, string> = {
  physical_help: "Physical Help", errands: "Errands", tech_help: "Tech Help",
  guidance: "Guidance", transportation: "Transportation", home_repairs: "Home Repairs",
  childcare: "Childcare", pet_care: "Pet Care", tutoring: "Tutoring",
  digital_work: "Digital Work", design: "Design", writing: "Writing",
  programming: "Programming", marketing: "Marketing", research: "Research",
  education: "Education", translation: "Translation", consulting: "Consulting",
  home_services: "Home Services", photography: "Photography",
  event_planning: "Event Planning", fitness: "Fitness & Health",
  cooking: "Cooking & Catering", personal_shopping: "Personal Shopping",
  legal: "Legal & Finance", other: "Other",
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  tech_help:    { bg: "#EFF6FF", text: "#1D4ED8" },
  programming:  { bg: "#EFF6FF", text: "#1D4ED8" },
  design:       { bg: "#F5F3FF", text: "#6D28D9" },
  writing:      { bg: "#F0FDFA", text: "#0F766E" },
  marketing:    { bg: "#F0FDFA", text: "#0F766E" },
  home_services:{ bg: "#FFF7ED", text: "#C2410C" },
  home_repairs: { bg: "#FFF7ED", text: "#C2410C" },
  education:    { bg: "#EEF2FF", text: "#3730A3" },
  tutoring:     { bg: "#EEF2FF", text: "#3730A3" },
  transportation:{ bg: "#FEFCE8", text: "#A16207" },
  errands:      { bg: "#FEFCE8", text: "#A16207" },
  photography:  { bg: "#FAF5FF", text: "#7C3AED" },
  fitness:      { bg: "#F0FDF4", text: "#15803D" },
  cooking:      { bg: "#FEF2F2", text: "#DC2626" },
  event_planning:{ bg: "#FDF4FF", text: "#A21CAF" },
  other:        { bg: "#F9FAFB", text: "#6B7280" },
};

const FILTER_CATEGORIES = [
  "All", "Tech Help", "Design", "Writing", "Home Services",
  "Education", "Delivery", "Marketing", "Photography",
];

function TaskCard({ task, formatLocal, index }: { task: TaskData; formatLocal: (n: number) => string; index: number }) {
  const catColor = CATEGORY_COLORS[task.category] || { bg: "#F9FAFB", text: "#6B7280" };
  const catLabel = CATEGORY_MAP[task.category] || task.category;
  const daysAgo = Math.floor((Date.now() - new Date(task.created_at).getTime()) / 86400000);
  const timeLabel = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`;

  return (
    <Link href={`/request/${task.id}`}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.32 }}
        className="rounded-[22px] p-4.5 cursor-pointer"
        style={{
          background: "white",
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          padding: "18px",
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 inline-block"
              style={{ background: catColor.bg, color: catColor.text }}
            >
              {catLabel}
            </span>
            <h3
              className="text-[14px] font-bold text-[#0D0D0D] leading-snug line-clamp-2"
              style={{ letterSpacing: "-0.015em" }}
            >
              {task.title}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[15px] font-bold" style={{ color: GREEN }}>{formatLocal(task.budget)}</p>
            <p className="text-[10px] text-gray-400 font-medium">budget</p>
          </div>
        </div>

        {task.description && (
          <p className="text-[12px] text-gray-500 line-clamp-2 mb-3.5 leading-relaxed">{task.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {task.is_remote ? (
                <Globe className="w-3 h-3 text-gray-400" strokeWidth={1.8} />
              ) : (
                <MapPin className="w-3 h-3 text-gray-400" strokeWidth={1.8} />
              )}
              <span className="text-[11px] text-gray-400 font-medium">{task.is_remote ? "Remote" : "On-site"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-gray-400" strokeWidth={1.8} />
              <span className="text-[11px] text-gray-400 font-medium">{task.offers_count || 0} offers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-gray-400" strokeWidth={1.8} />
              <span className="text-[11px] text-gray-400 font-medium">{timeLabel}</span>
            </div>
          </div>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "#F5F7F5" }}
          >
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function DiscoverPage() {
  const searchParams = useSearch();
  const initialQuery = new URLSearchParams(searchParams).get("query") || "";
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "budget_high" | "budget_low" | "most_offers">("newest");

  const { openTasks, openTasksLoading } = useTasksApi();
  const { formatLocal } = useLocalizationStore();
  const { user } = useFirebaseAuth();

  const filtered = openTasks
    .filter((task) => {
      const q = searchInput.toLowerCase();
      const matchesSearch =
        !q ||
        task.title.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q) ||
        (CATEGORY_MAP[task.category] || "").toLowerCase().includes(q);
      const matchesCat =
        activeFilter === "All" ||
        (CATEGORY_MAP[task.category] || "").toLowerCase().includes(activeFilter.toLowerCase()) ||
        task.category.toLowerCase().includes(activeFilter.toLowerCase());
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === "budget_high") return b.budget - a.budget;
      if (sortBy === "budget_low") return a.budget - b.budget;
      if (sortBy === "most_offers") return (b.offers_count || 0) - (a.offers_count || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <MobileLayout>
      <div style={{ background: "#F5F7F5" }}>
        {/* Sticky Header */}
        <div
          className="sticky top-0 z-40 px-4 pt-14 pb-3"
          style={{
            background: "rgba(245,247,245,0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <h1
              className="text-[1.3rem] font-bold text-[#0D0D0D] flex-1"
              style={{ letterSpacing: "-0.02em" }}
            >
              Find Tasks
            </h1>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-[12px]"
              style={{
                background: showFilters ? GREEN : "white",
                color: showFilters ? "white" : "#6B7280",
                border: `1.5px solid ${showFilters ? GREEN : "rgba(0,0,0,0.08)"}`,
                boxShadow: showFilters ? `0 4px 12px rgba(12,107,56,0.2)` : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
            </motion.button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tasks, skills, categories..."
              className="pl-11 h-[46px] rounded-[14px] border-gray-200 bg-white text-sm font-medium"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            />
            <AnimatePresence>
              {searchInput && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchInput("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "#E5E7EB" }}
                >
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Sort filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="mt-3 overflow-hidden"
              >
                <div className="flex gap-2 flex-wrap">
                  {[
                    { id: "newest",      label: "Newest"      },
                    { id: "budget_high", label: "High Budget" },
                    { id: "budget_low",  label: "Low Budget"  },
                    { id: "most_offers", label: "Most Offers" },
                  ].map((opt) => (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setSortBy(opt.id as any)}
                      className="text-[11px] font-bold px-3.5 py-2 rounded-full"
                      style={{
                        background: sortBy === opt.id ? GREEN : "white",
                        color: sortBy === opt.id ? "white" : "#6B7280",
                        border: `1.5px solid ${sortBy === opt.id ? GREEN : "rgba(0,0,0,0.08)"}`,
                      }}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category chips */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-4 py-3 w-max">
            {FILTER_CATEGORIES.map((cat) => {
              const active = activeFilter === cat;
              return (
                <motion.button
                  key={cat}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setActiveFilter(cat)}
                  className="text-[11px] font-bold px-4 py-2 rounded-full whitespace-nowrap"
                  style={{
                    background: active ? GREEN : "white",
                    color: active ? "white" : "#6B7280",
                    border: `1.5px solid ${active ? GREEN : "rgba(0,0,0,0.07)"}`,
                    boxShadow: active ? `0 4px 12px rgba(12,107,56,0.2)` : "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  {cat}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 font-medium">
              {openTasksLoading ? "Loading..." : `${filtered.length} task${filtered.length !== 1 ? "s" : ""} available`}
            </p>
            {user && (
              <Link href="/create-request">
                <motion.span
                  whileTap={{ scale: 0.94 }}
                  className="text-xs font-bold flex items-center gap-1"
                  style={{ color: GREEN }}
                >
                  <span className="text-sm">+</span> Post Task
                </motion.span>
              </Link>
            )}
          </div>

          {openTasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-[22px] p-5 bg-white" style={{ border: "1px solid rgba(0,0,0,0.05)" }}>
                  <div className="space-y-3">
                    <div className="h-3 rounded-full shimmer w-1/4" />
                    <div className="h-4 rounded-full shimmer w-3/4" />
                    <div className="h-3 rounded-full shimmer w-full" />
                    <div className="h-3 rounded-full shimmer w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div
                className="w-16 h-16 rounded-[22px] mx-auto mb-4 flex items-center justify-center"
                style={{ background: "#F0FDF4" }}
              >
                <Briefcase className="w-7 h-7" style={{ color: GREEN, opacity: 0.5 }} />
              </div>
              <p className="text-[15px] font-bold text-[#0D0D0D] mb-1">No tasks found</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                {searchInput ? `No results for "${searchInput}"` : "No open tasks in this category yet"}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filtered.map((task, i) => (
                <TaskCard key={task.id} task={task} formatLocal={formatLocal} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
