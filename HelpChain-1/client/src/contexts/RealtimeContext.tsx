import React, { createContext, useEffect, useRef, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { getSupabaseClient } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

const RealtimeContext = createContext<{ isConnected: boolean }>({ isConnected: false });
export { RealtimeContext };

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { user } = useFirebaseAuth();
  const channelsRef = useRef<RealtimeChannel[]>([]);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) {
      cleanup();
      return;
    }

    cleanup();

    const uid = user.uid;

    // ─── PROFILE ────────────────────────────────────────────────────────────
    const profileCh = supabase
      .channel(`profiles:${uid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `user_id=eq.${uid}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["profile"] });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") isConnectedRef.current = true;
      });

    // ─── TASKS (open marketplace) ────────────────────────────────────────────
    const openTasksCh = supabase
      .channel(`tasks:open`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["open-tasks"] });
          // Also invalidate my-tasks if this task belongs to the current user
          const rec = (payload.new || payload.old) as Record<string, unknown>;
          if (rec && (rec.requester_id === uid || rec.helper_id === uid)) {
            queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
            if (rec.id) {
              queryClient.invalidateQueries({ queryKey: ["task", rec.id as string] });
            }
          }
        }
      )
      .subscribe();

    // ─── OFFERS ─────────────────────────────────────────────────────────────
    const offersCh = supabase
      .channel(`offers:${uid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offers", filter: `worker_id=eq.${uid}` },
        (payload) => {
          const rec = (payload.new || payload.old) as Record<string, unknown>;
          if (rec?.task_id) {
            queryClient.invalidateQueries({ queryKey: ["task-offers", rec.task_id as string] });
            queryClient.invalidateQueries({ queryKey: ["task", rec.task_id as string] });
          }
          queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
        }
      )
      .subscribe();

    // ─── NOTIFICATIONS ───────────────────────────────────────────────────────
    const notifCh = supabase
      .channel(`notifications:${uid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    // ─── CONVERSATIONS ───────────────────────────────────────────────────────
    const convACh = supabase
      .channel(`conversations_a:${uid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations", filter: `participant_a=eq.${uid}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .subscribe();

    const convBCh = supabase
      .channel(`conversations_b:${uid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations", filter: `participant_b=eq.${uid}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .subscribe();

    // ─── MESSAGES ────────────────────────────────────────────────────────────
    const messagesCh = supabase
      .channel(`messages:${uid}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Record<string, unknown>;
          if (msg?.conversation_id) {
            queryClient.invalidateQueries({ queryKey: ["messages", msg.conversation_id as string] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
          }
        }
      )
      .subscribe();

    // ─── WALLET ─────────────────────────────────────────────────────────────
    const walletCh = supabase
      .channel(`wallet:${uid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wallets", filter: `user_id=eq.${uid}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["wallet"] });
        }
      )
      .subscribe();

    const txCh = supabase
      .channel(`transactions:${uid}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions", filter: `user_id=eq.${uid}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
          queryClient.invalidateQueries({ queryKey: ["wallet"] });
        }
      )
      .subscribe();

    channelsRef.current = [profileCh, openTasksCh, offersCh, notifCh, convACh, convBCh, messagesCh, walletCh, txCh];

    return cleanup;
  }, [user?.uid]);

  function cleanup() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    channelsRef.current.forEach((ch) => {
      try { supabase.removeChannel(ch); } catch {}
    });
    channelsRef.current = [];
    isConnectedRef.current = false;
  }

  return (
    <RealtimeContext.Provider value={{ isConnected: isConnectedRef.current }}>
      {children}
    </RealtimeContext.Provider>
  );
}
