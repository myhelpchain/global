import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, Filter, Globe, Users, X, Loader2, ChevronRight } from "lucide-react";
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

function TaskCard({ task, formatLocal }: { task: TaskData; formatLocal: (n: number) => string }) {
  const catColor = CATEGORY_COLORS[task.category] || { bg: "#F9FAFB", text: "#6B7280" };
  const catLabel = CATEGORY_MAP[task.category] || task.category;
  const daysAgo = Math.floor((Date.now() - new Date(task.created_at).getTime()) / 86400000);
  const timeLabel = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`;

  return (
    <Link href={`/request/${task.id}`}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 cursor-pointer"
        style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full mb-2 inline-block"
              style={{ background: catColor.bg, color: catColor.text }}
            >
              {catLabel}
            </span>
            <h3 className="text-sm font-bold text-[#0D0D0D] leading-snug line-clamp-2">{task.title}</h3>
          </div>
          <div
            className="shrink-0 text-right"
          >
            <p className="text-base font-bold" style={{ color: GREEN }}>{formatLocal(task.budget)}</p>
            <p className="text-xs text-gray-400">budget</p>
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {task.is_remote ? (
                <Globe className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span className="text-xs text-gray-400">{task.is_remote ? "Remote" : "On-site"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-400">{task.offers_count || 0} offers</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-400">{timeLabel}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
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
      <div style={{ background: "#F8FAF8" }}>

        {/* Header */}
        <div
          className="sticky top-0 z-40 px-4 pt-14 pb-3"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <h1 className="text-xl font-bold text-[#0D0D0D] flex-1">Find Tasks</h1>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
              style={{
                background: showFilters ? GREEN : "#F8FAF8",
                color: showFilters ? "white" : "#6B7280",
                border: `1px solid ${showFilters ? GREEN : "#E5E7EB"}`,
              }}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
            </motion.button>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tasks, categories..."
              className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50 text-sm"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <p className="text-xs font-semibold text-gray-400 mb-2">Sort by</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { id: "newest",      label: "Newest"       },
                    { id: "budget_high", label: "High Budget"  },
                    { id: "budget_low",  label: "Low Budget"   },
                    { id: "most_offers", label: "Most Offers"  },
                  ].map((opt) => (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSortBy(opt.id as any)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{
                        background: sortBy === opt.id ? GREEN : "#F8FAF8",
                        color: sortBy === opt.id ? "white" : "#6B7280",
                        border: `1px solid ${sortBy === opt.id ? GREEN : "#E5E7EB"}`,
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

        {/* Category Chips */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-4 py-3 w-max">
            {FILTER_CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.93 }}
                onClick={() => setActiveFilter(cat)}
                className="text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-all"
                style={{
                  background: activeFilter === cat ? GREEN : "white",
                  color: activeFilter === cat ? "white" : "#6B7280",
                  border: `1.5px solid ${activeFilter === cat ? GREEN : "#E5E7EB"}`,
                }}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 font-medium">
              {openTasksLoading ? "Loading..." : `${filtered.length} task${filtered.length !== 1 ? "s" : ""} found`}
            </p>
            {user && (
              <Link href="/create-request">
                <span className="text-xs font-bold" style={{ color: GREEN }}>+ Post Task</span>
              </Link>
            )}
          </div>

          {openTasksLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin" style={{ color: GREEN }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "#F0FDF4" }}
              >
                <Search className="w-8 h-8" style={{ color: GREEN, opacity: 0.5 }} />
              </div>
              <p className="text-base font-semibold text-[#0D0D0D] mb-1">No tasks found</p>
              <p className="text-sm text-gray-400">
                {searchInput ? `No results for "${searchInput}"` : "No open tasks in this category yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((task) => (
                <TaskCard key={task.id} task={task} formatLocal={formatLocal} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
