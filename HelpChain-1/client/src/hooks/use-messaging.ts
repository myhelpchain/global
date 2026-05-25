import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFirebaseAuth } from "./use-firebase-auth";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const TASK_API = `${SUPABASE_URL}/functions/v1/task-api`;

export interface ConversationData {
  id: string;
  task_id: string | null;
  offer_id: string | null;
  participant_a: string;
  participant_b: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_a: number;
  unread_b: number;
  created_at: string;
  other_a?: { full_name: string; avatar_url: string | null };
  other_b?: { full_name: string; avatar_url: string | null };
  task?: { title: string } | null;
}

export interface MessageData {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  message_type: string;
  read_at: string | null;
  created_at: string;
  sender?: { full_name: string; avatar_url: string | null };
}

export function useConversations() {
  const { user, getIdToken } = useFirebaseAuth();
  const queryClient = useQueryClient();

  const getHeaders = async () => {
    const token = await getIdToken();
    if (!token) return null;
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  };

  const { data: conversations = [], isLoading, refetch } = useQuery<ConversationData[]>({
    queryKey: ["conversations", user?.uid],
    queryFn: async () => {
      const headers = await getHeaders();
      if (!headers) return [];
      const res = await fetch(`${TASK_API}/conversations`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return data.conversations || [];
    },
    enabled: !!user,
    staleTime: 10000,
    // Keep a slow fallback poll in case realtime isn't connected
    refetchInterval: 60000,
  });

  const startConversationMutation = useMutation({
    mutationFn: async (params: { otherUserId: string; taskId?: string; message?: string }) => {
      const headers = await getHeaders();
      if (!headers) throw new Error("Not authenticated");
      const res = await fetch(`${TASK_API}/conversations`, {
        method: "POST",
        headers,
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start conversation");
      return data.conversation as ConversationData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    conversations,
    isLoading,
    refetch,
    startConversation: startConversationMutation.mutateAsync,
    startPending: startConversationMutation.isPending,
  };
}

export function useMessages(conversationId: string | null) {
  const { user, getIdToken } = useFirebaseAuth();
  const queryClient = useQueryClient();

  const getHeaders = async () => {
    const token = await getIdToken();
    if (!token) return null;
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  };

  const { data: messages = [], isLoading, refetch } = useQuery<MessageData[]>({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const headers = await getHeaders();
      if (!headers) return [];
      const res = await fetch(`${TASK_API}/conversations/${conversationId}/messages`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return data.messages || [];
    },
    enabled: !!conversationId && !!user,
    staleTime: 5000,
    // Slow fallback poll — realtime handles instant delivery
    refetchInterval: 30000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (body: string) => {
      if (!conversationId) throw new Error("No conversation selected");
      const headers = await getHeaders();
      if (!headers) throw new Error("Not authenticated");
      const res = await fetch(`${TASK_API}/conversations/${conversationId}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");
      return data.message as MessageData;
    },
    onSuccess: (newMessage) => {
      // Optimistically add message; realtime will confirm
      queryClient.setQueryData<MessageData[]>(["messages", conversationId], (prev = []) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    messages,
    isLoading,
    refetch,
    sendMessage: sendMessageMutation.mutateAsync,
    sendPending: sendMessageMutation.isPending,
    currentUserId: user?.uid,
  };
}
