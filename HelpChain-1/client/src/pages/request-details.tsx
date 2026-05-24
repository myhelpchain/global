import { useState } from "react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useRoute, useLocation, Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocalizationStore } from "@/stores/localization-store";
import { useTask, useTaskOffers, useCompleteTask, useSubmitReview } from "@/hooks/use-tasks-api";
import {
  MapPin, Calendar, Clock, Star, ChevronLeft, Check, X,
  Globe, Shield, Users, CheckCircle2, CircleDot, Circle, Play,
  Send, TrendingUp, AlertCircle, Loader2, MessageCircle
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const CATEGORY_LABELS: Record<string, string> = {
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

const CATEGORY_IMAGES: Record<string, string> = {
  design: "https://picsum.photos/seed/design-creative/1200/400",
  writing: "https://picsum.photos/seed/writing-desk/1200/400",
  programming: "https://picsum.photos/seed/code-laptop/1200/400",
  digital_work: "https://picsum.photos/seed/digital-laptop/1200/400",
  marketing: "https://picsum.photos/seed/marketing-team/1200/400",
  tech_help: "https://picsum.photos/seed/tech-support/1200/400",
  physical_help: "https://picsum.photos/seed/moving-help/1200/400",
  home_repairs: "https://picsum.photos/seed/home-repair/1200/400",
  home_services: "https://picsum.photos/seed/home-cleaning/1200/400",
  errands: "https://picsum.photos/seed/errands-shopping/1200/400",
  transportation: "https://picsum.photos/seed/delivery-transport/1200/400",
  education: "https://picsum.photos/seed/study-classroom/1200/400",
  tutoring: "https://picsum.photos/seed/tutoring-student/1200/400",
  photography: "https://picsum.photos/seed/photography-camera/1200/400",
  event_planning: "https://picsum.photos/seed/event-party/1200/400",
  fitness: "https://picsum.photos/seed/fitness-gym/1200/400",
  cooking: "https://picsum.photos/seed/cooking-chef/1200/400",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open", in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const OFFER_STATUS_COLORS: Record<string, string> = {
  accepted: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-gray-50 text-gray-600 border-gray-200",
  withdrawn: "bg-gray-50 text-gray-400 border-gray-200",
};

const statusOrder = ["open", "in_progress", "completed"];

function StatusTimeline({ current }: { current: string }) {
  let idx = statusOrder.indexOf(current);
  if (idx === -1) idx = 0;
  return (
    <div className="flex items-center justify-between px-2 py-4">
      {statusOrder.map((s, i) => {
        const done = i < idx || current === "completed";
        const now = i === idx && current !== "completed";
        return (
          <div key={s} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {i > 0 && <div className={`h-0.5 flex-1 ${done || now ? "bg-[#0C6B38]" : "bg-gray-200"}`} />}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                done ? "bg-[#0C6B38] text-white" : now ? "bg-[#0C6B38] text-white ring-4 ring-[#0C6B38]/20" : "bg-gray-100 text-gray-400"
              }`}>
                {done ? <CheckCircle2 className="w-3 h-3" /> : now ? <CircleDot className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
              </div>
              {i < statusOrder.length - 1 && <div className={`h-0.5 flex-1 ${done ? "bg-[#0C6B38]" : "bg-gray-200"}`} />}
            </div>
            <span className={`text-[10px] mt-1.5 font-medium text-center ${now || done ? "text-[#0C6B38]" : "text-gray-400"}`}>
              {STATUS_LABELS[s]?.split(" ")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function RequestDetails() {
  const [, params] = useRoute("/request/:id");
  const [, navigate] = useLocation();
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const taskId = params?.id;

  const { formatLocal } = useLocalizationStore();
  const { data: task, isLoading: taskLoading } = useTask(taskId);
  const { offers, isLoading: offersLoading, submitOffer, submitPending, acceptOffer, acceptPending, rejectOffer } = useTaskOffers(taskId);
  const completeTask = useCompleteTask();
  const submitReview = useSubmitReview();

  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [pitchText, setPitchText] = useState("");
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [deliveryTime, setDeliveryTime] = useState("");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (taskLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8]">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-[#0C6B38]" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#F8FAF8]">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 pt-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-7 h-7 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-[#0D0D0D] mb-2">Task not found</h2>
          <p className="text-gray-400 text-sm mb-6">This task may have been removed or the link is invalid.</p>
          <Link href="/discover">
            <button className="text-sm font-semibold px-6 py-3 rounded-xl text-white" style={{ background: "#0C6B38" }}>
              Browse Tasks
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = user?.uid === task.requester_id;
  const myOffer = offers.find(o => o.worker_id === user?.uid);
  const hasApplied = !!myOffer;
  const coverImage = CATEGORY_IMAGES[task.category] || `https://picsum.photos/seed/${task.id}/1200/400`;
  const catLabel = CATEGORY_LABELS[task.category] || task.category;
  const statusClass = STATUS_COLORS[task.status] || "bg-gray-50 text-gray-600 border-gray-200";
  const creatorName = task.profiles?.full_name || "Anonymous";
  const creatorAvatar = task.profiles?.avatar_url;

  const handleSubmitOffer = async () => {
    if (pitchText.length < 50) {
      toast({ title: "Pitch too short", description: "Minimum 50 characters required.", variant: "destructive" });
      return;
    }
    try {
      await submitOffer({
        message: pitchText,
        amount: offerAmount || task.budget,
        deliveryTime: deliveryTime || undefined,
      });
      toast({ title: "Offer Submitted!", description: "The task owner will review your pitch soon." });
      setShowOfferDialog(false);
      setPitchText(""); setOfferAmount(0); setDeliveryTime("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit offer";
      toast({ title: "Failed", description: message, variant: "destructive" });
    }
  };

  const handleAcceptOffer = async (offerId: string, workerName: string) => {
    try {
      await acceptOffer(offerId);
      toast({ title: "Worker Hired!", description: `${workerName} has been accepted. Work can begin!` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to accept offer";
      toast({ title: "Failed", description: message, variant: "destructive" });
    }
  };

  const handleDeclineOffer = async (offerId: string) => {
    try {
      await rejectOffer(offerId);
      toast({ title: "Offer Declined" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to decline offer";
      toast({ title: "Failed", description: message, variant: "destructive" });
    }
  };

  const handleCompleteTask = async () => {
    try {
      const result = await completeTask.mutateAsync(task.id);
      toast({ title: "Task Completed!", description: `₦${(result.payout || 0).toLocaleString()} released to the worker.` });
      setShowReviewDialog(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to complete task";
      toast({ title: "Failed", description: message, variant: "destructive" });
    }
  };

  const handleSubmitReview = async () => {
    if (!task.helper_id) return;
    try {
      await submitReview.mutateAsync({
        taskId: task.id,
        revieweeId: task.helper_id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSubmitted(true);
      toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit review";
      toast({ title: "Note", description: message });
      setReviewSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pb-10">

        <div className="py-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0C6B38] transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* Cover image */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative rounded-2xl overflow-hidden h-52 mb-4 bg-gray-100">
            <img src={coverImage} alt={catLabel} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)" }} />
            <div className="absolute top-4 left-4">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border bg-white/90 backdrop-blur-sm ${statusClass}`}>
                {STATUS_LABELS[task.status] || task.status}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full border bg-white/90 backdrop-blur-sm text-gray-700 border-gray-200">
                {catLabel}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main task card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <h1 className="text-2xl font-bold text-[#0D0D0D] mb-3 leading-snug">{task.title}</h1>

            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-5">
              {task.location && (
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{task.location}</span>
              )}
              {task.is_remote && (
                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />Remote</span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />{format(new Date(task.created_at), "MMM d, yyyy")}
              </span>
              {(task.offers_count || 0) > 0 && (
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{task.offers_count} offers</span>
              )}
            </div>

            {task.budget > 0 && (
              <div className="rounded-xl px-5 py-4 mb-5" style={{ background: "rgba(12,107,56,0.06)", border: "1px solid rgba(12,107,56,0.12)" }}>
                <p className="text-3xl font-bold" style={{ color: "#0C6B38" }}>{formatLocal(task.budget)}</p>
                <p className="text-xs text-gray-500 mt-0.5">Budget per task</p>
              </div>
            )}

            {task.status !== "cancelled" && (
              <div className="rounded-xl bg-[#F8FAF8] mb-5 px-3">
                <StatusTimeline current={task.status} />
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-[#0D0D0D] mb-2">Description</h3>
              <p className="text-sm text-gray-500 whitespace-pre-line leading-relaxed">{task.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Posted By */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-white rounded-2xl p-5 mb-4" style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <h3 className="text-sm font-semibold text-[#0D0D0D] mb-4">Posted by</h3>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-[#0C6B38] flex items-center justify-center shrink-0">
                {creatorAvatar ? (
                  <img src={creatorAvatar} alt={creatorName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-sm">{creatorName[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#0D0D0D]">{creatorName}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  {task.profiles?.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{task.profiles.location}</span>
                  )}
                </div>
              </div>
              {!isCreator && user && (
                <Link href={`/public-profile/${task.requester_id}`}>
                  <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                    View Profile
                  </button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Offers */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <div className="bg-white rounded-2xl mb-4 overflow-hidden" style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #F5F5F5" }}>
              <h3 className="text-sm font-semibold text-[#0D0D0D]">
                Offers {offersLoading ? "" : `(${offers.length})`}
              </h3>
              {offersLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </div>

            {offersLoading ? (
              <div className="py-10 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300 mx-auto" />
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-10">
                <Send className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No offers yet — be the first!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {offers.map((offer) => {
                  const statusClass = OFFER_STATUS_COLORS[offer.status] || "bg-gray-50 text-gray-600 border-gray-200";
                  const workerName = offer.profiles?.full_name || "Anonymous";
                  const workerAvatar = offer.profiles?.avatar_url;
                  const repScore = offer.profiles?.reputation_score || 0;
                  const tasksDone = offer.profiles?.total_tasks_done || 0;

                  return (
                    <div key={offer.id} className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0C6B38] overflow-hidden flex items-center justify-center shrink-0">
                          {workerAvatar ? (
                            <img src={workerAvatar} alt={workerName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-xs font-bold">{workerName[0]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-semibold text-sm text-[#0D0D0D]">{workerName}</p>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusClass}`}>
                              {offer.status}
                            </span>
                          </div>
                          <div className="flex items-center flex-wrap gap-2 text-xs text-gray-400 mb-2">
                            {repScore > 0 && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{repScore.toFixed(1)}
                              </span>
                            )}
                            {tasksDone > 0 && (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />{tasksDone} done
                              </span>
                            )}
                            {offer.amount > 0 && (
                              <>
                                <span>·</span>
                                <span className="font-bold" style={{ color: "#0C6B38" }}>{formatLocal(offer.amount)}</span>
                              </>
                            )}
                            {offer.delivery_time && (
                              <>
                                <span>·</span>
                                <span>{offer.delivery_time}</span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{offer.message}</p>

                          {isCreator && offer.status === "pending" && task.status === "open" && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleAcceptOffer(offer.id, workerName)}
                                disabled={acceptPending}
                                className="flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white transition-all disabled:opacity-60"
                                style={{ background: "#0C6B38" }}
                              >
                                {acceptPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Hire
                              </button>
                              <button
                                onClick={() => handleDeclineOffer(offer.id)}
                                className="flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                              >
                                <X className="w-3 h-3" /> Decline
                              </button>
                            </div>
                          )}

                          {/* Worker can message the creator after being accepted */}
                          {offer.status === "accepted" && !isCreator && offer.worker_id === user?.uid && (
                            <Link href="/messages">
                              <button className="flex items-center gap-1.5 mt-3 text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-[#0C6B38]/30 text-[#0C6B38] hover:bg-[#0C6B38]/5 transition-colors">
                                <MessageCircle className="w-3 h-3" /> Message Client
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="space-y-3">

          {!user && task.status === "open" && (
            <Link href="/auth">
              <button className="w-full flex items-center justify-center gap-2 py-3.5 text-base font-semibold rounded-2xl text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #0C6B38, #0a5a30)", boxShadow: "0 4px 14px rgba(12,107,56,0.3)" }}>
                <Send className="w-4 h-4" /> Sign in to Submit Offer
              </button>
            </Link>
          )}

          {user && !isCreator && !hasApplied && task.status === "open" && (
            <button
              className="w-full flex items-center justify-center gap-2 py-3.5 text-base font-semibold rounded-2xl text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #0C6B38, #0a5a30)", boxShadow: "0 4px 14px rgba(12,107,56,0.3)" }}
              onClick={() => { setOfferAmount(task.budget || 0); setShowOfferDialog(true); }}
            >
              <Send className="w-4 h-4" /> Submit Your Offer
            </button>
          )}

          {hasApplied && myOffer?.status === "pending" && (
            <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(12,107,56,0.06)", border: "1px solid rgba(12,107,56,0.15)" }}>
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: "#0C6B38" }} />
              <p className="font-semibold text-sm" style={{ color: "#0C6B38" }}>Offer submitted!</p>
              <p className="text-xs text-gray-400 mt-1">Check back for updates from the task owner.</p>
            </div>
          )}

          {hasApplied && myOffer?.status === "accepted" && (
            <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(12,107,56,0.06)", border: "1px solid rgba(12,107,56,0.15)" }}>
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: "#0C6B38" }} />
              <p className="font-semibold text-sm" style={{ color: "#0C6B38" }}>Your offer was accepted!</p>
              <p className="text-xs text-gray-400 mt-1">You've been hired. Deliver great work!</p>
            </div>
          )}

          {isCreator && task.status === "in_progress" && (
            <button
              className="w-full flex items-center justify-center gap-2 py-3.5 font-semibold rounded-2xl text-white transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
              onClick={handleCompleteTask}
              disabled={completeTask.isPending}
            >
              {completeTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Complete & Release Payment
            </button>
          )}

          {isCreator && task.status === "open" && offers.length > 0 && (
            <p className="text-center text-xs text-gray-400">
              Review the offers above and hire a worker to get started.
            </p>
          )}

          {isCreator && task.status === "completed" && !reviewSubmitted && task.helper_id && (
            <button
              className="w-full flex items-center justify-center gap-2 py-3.5 font-semibold rounded-2xl border border-[#0C6B38] text-[#0C6B38] hover:bg-[#0C6B38]/5 transition-colors"
              onClick={() => setShowReviewDialog(true)}
            >
              <Star className="w-4 h-4" /> Leave a Review
            </button>
          )}
        </motion.div>
      </div>

      {/* Submit Offer Dialog */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Submit Your Offer</DialogTitle>
            <DialogDescription className="text-sm text-gray-400">
              Write a compelling pitch explaining why you're the right person for this task.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-1">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Your Offer Amount (₦)</label>
              <Input
                type="number"
                value={offerAmount || ""}
                onChange={e => setOfferAmount(Number(e.target.value))}
                placeholder={`Default: ${formatLocal(task.budget)}`}
                className="rounded-xl border-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Estimated Delivery Time</label>
              <Input
                value={deliveryTime}
                onChange={e => setDeliveryTime(e.target.value)}
                placeholder="e.g. 3 days, 1 week..."
                className="rounded-xl border-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                Your Pitch ({pitchText.length}/50 min)
              </label>
              <Textarea
                value={pitchText}
                onChange={e => setPitchText(e.target.value)}
                placeholder="Explain your experience, approach, and why you're perfect for this task..."
                className="rounded-xl border-gray-200 min-h-[140px] text-sm resize-none"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowOfferDialog(false)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitOffer}
                disabled={submitPending || pitchText.length < 50}
                className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                style={{ background: "#0C6B38" }}
              >
                {submitPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Offer
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Leave a Review</DialogTitle>
            <DialogDescription className="text-sm text-gray-400">
              How was your experience working with this helper?
            </DialogDescription>
          </DialogHeader>
          {reviewSubmitted ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: "#0C6B38" }} />
              <p className="font-semibold text-[#0D0D0D]">Review submitted!</p>
              <p className="text-sm text-gray-400 mt-1">Thank you for your feedback.</p>
            </div>
          ) : (
            <div className="space-y-4 mt-1">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-3">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setReviewRating(star)}>
                      <Star className={`w-8 h-8 transition-colors ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Comment (optional)</label>
                <Textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="rounded-xl border-gray-200 min-h-[100px] text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowReviewDialog(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submitReview.isPending}
                  className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "#0C6B38" }}
                >
                  {submitReview.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                  Submit Review
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
