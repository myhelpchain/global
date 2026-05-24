import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin, Clock, Search, Filter, ArrowRight, Globe, Users, Grid3X3, List, X, Loader2
} from "lucide-react";
import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useTasksApi, type TaskData } from "@/hooks/use-tasks-api";
import { useLocalizationStore } from "@/stores/localization-store";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";

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

const CATEGORY_COLORS: Record<string, string> = {
  physical_help: "bg-orange-50 text-orange-700 border-orange-200",
  errands: "bg-amber-50 text-amber-700 border-amber-200",
  home_repairs: "bg-orange-50 text-orange-700 border-orange-200",
  home_services: "bg-amber-50 text-amber-700 border-amber-200",
  tech_help: "bg-blue-50 text-blue-700 border-blue-200",
  programming: "bg-blue-50 text-blue-700 border-blue-200",
  digital_work: "bg-sky-50 text-sky-700 border-sky-200",
  design: "bg-violet-50 text-violet-700 border-violet-200",
  writing: "bg-teal-50 text-teal-700 border-teal-200",
  marketing: "bg-teal-50 text-teal-700 border-teal-200",
  research: "bg-cyan-50 text-cyan-700 border-cyan-200",
  education: "bg-indigo-50 text-indigo-700 border-indigo-200",
  tutoring: "bg-indigo-50 text-indigo-700 border-indigo-200",
  guidance: "bg-indigo-50 text-indigo-700 border-indigo-200",
  transportation: "bg-yellow-50 text-yellow-700 border-yellow-200",
  translation: "bg-rose-50 text-rose-700 border-rose-200",
  consulting: "bg-pink-50 text-pink-700 border-pink-200",
  childcare: "bg-pink-50 text-pink-700 border-pink-200",
  pet_care: "bg-green-50 text-green-700 border-green-200",
  photography: "bg-purple-50 text-purple-700 border-purple-200",
  event_planning: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  fitness: "bg-lime-50 text-lime-700 border-lime-200",
  cooking: "bg-red-50 text-red-700 border-red-200",
  personal_shopping: "bg-amber-50 text-amber-700 border-amber-200",
  legal: "bg-slate-50 text-slate-700 border-slate-200",
  other: "bg-gray-50 text-gray-600 border-gray-200",
};

const CATEGORY_IMAGES: Record<string, string> = {
  design: "https://picsum.photos/seed/design-creative/800/400",
  writing: "https://picsum.photos/seed/writing-desk/800/400",
  programming: "https://picsum.photos/seed/code-laptop/800/400",
  digital_work: "https://picsum.photos/seed/digital-laptop/800/400",
  marketing: "https://picsum.photos/seed/marketing-team/800/400",
  research: "https://picsum.photos/seed/research-books/800/400",
  translation: "https://picsum.photos/seed/language-books/800/400",
  consulting: "https://picsum.photos/seed/business-meeting/800/400",
  education: "https://picsum.photos/seed/study-classroom/800/400",
  tutoring: "https://picsum.photos/seed/tutoring-student/800/400",
  guidance: "https://picsum.photos/seed/guidance-coach/800/400",
  tech_help: "https://picsum.photos/seed/tech-support/800/400",
  physical_help: "https://picsum.photos/seed/moving-help/800/400",
  home_repairs: "https://picsum.photos/seed/home-repair/800/400",
  home_services: "https://picsum.photos/seed/home-cleaning/800/400",
  errands: "https://picsum.photos/seed/errands-shopping/800/400",
  transportation: "https://picsum.photos/seed/delivery-transport/800/400",
  childcare: "https://picsum.photos/seed/childcare-kids/800/400",
  pet_care: "https://picsum.photos/seed/pet-dog/800/400",
  photography: "https://picsum.photos/seed/photography-camera/800/400",
  event_planning: "https://picsum.photos/seed/event-party/800/400",
  fitness: "https://picsum.photos/seed/fitness-gym/800/400",
  cooking: "https://picsum.photos/seed/cooking-chef/800/400",
  personal_shopping: "https://picsum.photos/seed/shopping-bags/800/400",
  legal: "https://picsum.photos/seed/legal-office/800/400",
  other: "https://picsum.photos/seed/task-general/800/400",
};

const getTaskImage = (category: string, id: string) =>
  CATEGORY_IMAGES[category] || `https://picsum.photos/seed/${id}/800/400`;

const getTimeAgo = (dateString: string) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
};

const quickCategories = [
  { v: "physical_help", l: "Physical Help" },
  { v: "digital_work", l: "Digital Work" },
  { v: "design", l: "Design" },
  { v: "writing", l: "Writing" },
  { v: "tech_help", l: "Tech Help" },
  { v: "home_services", l: "Home Services" },
  { v: "education", l: "Education" },
  { v: "transportation", l: "Delivery" },
  { v: "marketing", l: "Marketing" },
];

function TaskCard({ task, viewMode, formatLocal }: { task: TaskData; viewMode: "grid" | "list"; formatLocal: (n: number) => string }) {
  const catColor = CATEGORY_COLORS[task.category] || "bg-gray-50 text-gray-600 border-gray-200";
  const catLabel = CATEGORY_MAP[task.category] || task.category;
  const taskImage = getTaskImage(task.category, task.id);
  const creatorName = task.profiles?.full_name || "Anonymous";
  const creatorAvatar = task.profiles?.avatar_url;
  const avatarFallback = creatorName[0]?.toUpperCase() || "?";

  if (viewMode === "grid") {
    return (
      <Link href={`/request/${task.id}`}>
        <div
          className="group cursor-pointer bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
          style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(12,107,56,0.22)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(12,107,56,0.09)"; }}
          onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#F0F0F0"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}
        >
          <div className="relative h-44 overflow-hidden bg-gray-100">
            <img
              src={taskImage}
              alt={catLabel}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${task.id}/800/400`; }}
            />
            <div className="absolute top-3 left-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm bg-white/90 ${catColor}`}>
                {catLabel}
              </span>
            </div>
            <div className="absolute top-3 right-3">
              <span className={`text-xs font-medium px-2 py-1 rounded-full border backdrop-blur-sm ${
                task.is_remote
                  ? "bg-sky-50/90 text-sky-700 border-sky-200"
                  : "bg-orange-50/90 text-orange-700 border-orange-200"
              }`}>
                {task.is_remote ? "Remote" : "Local"}
              </span>
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-semibold text-sm text-[#0D0D0D] leading-snug mb-3 line-clamp-2 group-hover:text-[#0C6B38] transition-colors">
              {task.title}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>

            <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-4">
              {task.location && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{task.location}</span>
              )}
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{getTimeAgo(task.created_at)}</span>
              {(task.offers_count || 0) > 0 && (
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{task.offers_count} offers</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-3.5" style={{ borderTop: "1px solid #F5F5F5" }}>
              <div className="flex items-center gap-2">
                {creatorAvatar ? (
                  <img src={creatorAvatar} alt={creatorName} className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#0C6B38] flex items-center justify-center border-2 border-white shadow-sm">
                    <span className="text-white text-xs font-bold">{avatarFallback}</span>
                  </div>
                )}
                <span className="text-xs text-gray-500 font-medium truncate max-w-[80px]">{creatorName}</span>
              </div>
              {task.budget > 0 ? (
                <span className="text-base font-bold" style={{ color: "#0C6B38" }}>
                  {formatLocal(task.budget)}
                </span>
              ) : (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
                  Flexible
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/request/${task.id}`}>
      <div
        className="group cursor-pointer bg-white rounded-2xl overflow-hidden transition-all duration-200"
        style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
        onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(12,107,56,0.2)"; }}
        onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#F0F0F0"; }}
      >
        <div className="flex gap-0">
          <div className="w-32 sm:w-44 shrink-0 h-full min-h-[120px] bg-gray-100 overflow-hidden">
            <img
              src={taskImage}
              alt={catLabel}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 min-h-[120px]"
              loading="lazy"
            />
          </div>
          <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${catColor}`}>{catLabel}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />{getTimeAgo(task.created_at)}
                </span>
              </div>
              <h3 className="font-semibold text-sm text-[#0D0D0D] leading-snug mb-1 group-hover:text-[#0C6B38] transition-colors line-clamp-1">
                {task.title}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-1">{task.description}</p>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {task.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{task.location}</span>}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${task.is_remote ? "bg-sky-50 text-sky-600" : "bg-orange-50 text-orange-600"}`}>
                  {task.is_remote ? "Remote" : "Local"}
                </span>
              </div>
              {task.budget > 0 ? (
                <span className="font-bold text-sm shrink-0" style={{ color: "#0C6B38" }}>{formatLocal(task.budget)}</span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 border border-gray-100">Flexible</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function DiscoverPage() {
  const searchParams = useSearch();
  const initialQuery = new URLSearchParams(searchParams).get("query") || "";
  const initialCategory = new URLSearchParams(searchParams).get("category") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [locationFilter, setLocationFilter] = useState<"all" | "remote" | "local">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { formatLocal } = useLocalizationStore();
  const { user } = useFirebaseAuth();
  const { openTasks, openTasksLoading, refetchOpenTasks } = useTasksApi();

  const filteredTasks = openTasks.filter((t: TaskData) => {
    if (categoryFilter && categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (locationFilter === "remote" && !t.is_remote) return false;
    if (locationFilter === "local" && t.is_remote) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.location || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const clearFilters = () => { setSearchQuery(""); setCategoryFilter(""); setLocationFilter("all"); };
  const hasActiveFilters = categoryFilter || locationFilter !== "all" || searchQuery;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="border-b border-gray-100 bg-[#F8FAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-bold tracking-widest uppercase text-[#0C6B38] mb-1">Marketplace</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0D0D0D] mb-1">Find tasks</h1>
            <p className="text-gray-500 text-sm">Browse live opportunities from clients around Nigeria and beyond</p>
          </motion.div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        <div className="flex flex-col lg:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#0C6B38]/50 placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={categoryFilter || "all"} onValueChange={v => setCategoryFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="h-11 rounded-xl border-gray-200 text-sm w-full sm:w-[180px]">
                <Filter className="h-3.5 w-3.5 mr-2 text-gray-400" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="max-h-[260px] overflow-y-auto">
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_MAP).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={v => setLocationFilter(v as "all" | "remote" | "local")}>
              <SelectTrigger className="h-11 rounded-xl border-gray-200 text-sm w-[130px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="remote">Remote (Online)</SelectItem>
                <SelectItem value="local">Local (In-Person)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`h-11 w-11 flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-[#0C6B38] text-white" : "bg-white text-gray-400 hover:text-gray-600"}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`h-11 w-11 flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-[#0C6B38] text-white" : "bg-white text-gray-400 hover:text-gray-600"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {quickCategories.map(({ v, l }) => {
            const active = categoryFilter === v;
            return (
              <button
                key={v}
                onClick={() => setCategoryFilter(active ? "" : v)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                  active ? "bg-[#0C6B38] text-white border-[#0C6B38]" : "bg-white text-gray-600 border-gray-200 hover:border-[#0C6B38]/40 hover:text-[#0C6B38]"
                }`}
              >
                {l}
              </button>
            );
          })}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-all flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {openTasksLoading ? (
              <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading tasks...</span>
            ) : (
              <><span className="font-semibold text-[#0D0D0D]">{filteredTasks.length}</span> {filteredTasks.length === 1 ? "task" : "tasks"} available</>
            )}
          </p>
          {!openTasksLoading && (
            <button onClick={() => refetchOpenTasks()} className="text-xs text-gray-400 hover:text-[#0C6B38] transition-colors font-medium">
              Refresh
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {openTasksLoading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#0C6B38] mx-auto mb-3" />
              <p className="text-sm text-gray-400">Loading marketplace tasks...</p>
            </motion.div>
          ) : !user ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-5">
                <Search className="h-7 w-7 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-[#0D0D0D] mb-2">Sign in to browse tasks</h3>
              <p className="text-gray-400 text-sm mb-6">Create a free account to see all available tasks</p>
              <Link href="/auth">
                <button className="bg-[#0C6B38] hover:bg-[#0a5a30] text-white rounded-xl px-8 h-11 font-semibold text-sm flex items-center gap-2 mx-auto">
                  Get Started <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </motion.div>
          ) : filteredTasks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-5">
                <Search className="h-7 w-7 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-[#0D0D0D] mb-2">No tasks found</h3>
              <p className="text-gray-400 text-sm mb-6">
                {hasActiveFilters ? "Try adjusting your filters or search terms" : "Be the first to post a task!"}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm font-semibold px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    Clear filters
                  </button>
                )}
                <Link href="/create-request">
                  <button className="text-sm font-semibold px-6 py-3 rounded-xl text-white flex items-center gap-2" style={{ background: "#0C6B38" }}>
                    Post a Task <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4"}>
                {filteredTasks.map((task: TaskData, i: number) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <TaskCard task={task} viewMode={viewMode} formatLocal={formatLocal} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
