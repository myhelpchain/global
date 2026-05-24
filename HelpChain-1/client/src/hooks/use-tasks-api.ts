import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFirebaseAuth } from "./use-firebase-auth";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const TASK_API = `${SUPABASE_URL}/functions/v1/task-api`;

export interface TaskData {
  id: string;
  requester_id: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  is_remote: boolean;
  urgency: string;
  budget: number;
  platform_fee: number;
  status: string;
  helper_id: string | null;
  funded_from: string | null;
  offers_count: number;
  views_count: number;
  created_at: string;
  assigned_at: string | null;
  completed_at: string | null;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
    location: string | null;
  };
}

export interface OfferData {
  id: string;
  task_id: string;
  worker_id: string;
  amount: number;
  message: string;
  delivery_time: string | null;
  status: string;
  accepted_at: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
    reputation_score: number;
    total_tasks_done: number;
    location: string | null;
  };
}

export interface ReviewData {
  id: string;
  task_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  role: string;
  created_at: string;
  reviewer?: { full_name: string; avatar_url: string | null };
  task?: { title: string };
}

export function useTasksApi() {
  const queryClient = useQueryClient();
  const { user, getIdToken } = useFirebaseAuth();

  const getAuthHeaders = async (): Promise<HeadersInit | undefined> => {
    try {
      const token = await getIdToken();
      if (!token) return undefined;
      return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    } catch {
      return undefined;
    }
  };

  // My tasks
  const { data: myTasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useQuery<TaskData[]>({
    queryKey: ["my-tasks", user?.uid],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      if (!headers) return [];
      const res = await fetch(`${TASK_API}/tasks`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return data.tasks || [];
    },
    enabled: !!user,
    staleTime: 15000,
  });

  // Open tasks (marketplace)
  const { data: openTasks = [], isLoading: openTasksLoading, refetch: refetchOpenTasks } = useQuery<TaskData[]>({
    queryKey: ["open-tasks"],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      if (!headers) return [];
      const res = await fetch(`${TASK_API}/tasks/open`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return data.tasks || [];
    },
    enabled: !!user,
    staleTime: 30000,
  });

  // Create task
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: {
      title: string;
      description: string;
      category: string;
      location?: string;
      locationType?: string;
      urgency?: string;
      budget: number;
      workerCount: number;
    }) => {
      const headers = await getAuthHeaders();
      if (!headers) throw new Error("Not authenticated");
      const res = await fetch(`${TASK_API}/tasks`, {
        method: "POST",
        headers,
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to create task");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["open-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });

  return {
    myTasks,
    openTasks,
    tasksLoading,
    openTasksLoading,
    refetchTasks,
    refetchOpenTasks,
    createTask: createTaskMutation.mutateAsync,
    createTaskPending: createTaskMutation.isPending,
  };
}

export function useTask(taskId: string | undefined) {
  const { user, getIdToken } = useFirebaseAuth();

  const getAuthHeaders = async (): Promise<HeadersInit | undefined> => {
    try {
      const token = await getIdToken();
      if (!token) return undefined;
      return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    } catch {
      return undefined;
    }
  };

  return useQuery<TaskData | null>({
    queryKey: ["task", taskId],
    queryFn: async () => {
      if (!taskId) return null;
      const headers = await getAuthHeaders();
      if (!headers) return null;
      const res = await fetch(`${TASK_API}/tasks/${taskId}`, { headers });
      if (!res.ok) return null;
      const data = await res.json();
      return data.task || null;
    },
    enabled: !!taskId && !!user,
    staleTime: 10000,
  });
}

export function useTaskOffers(taskId: string | undefined) {
  const queryClient = useQueryClient();
  const { user, getIdToken } = useFirebaseAuth();

  const getAuthHeaders = async (): Promise<HeadersInit | undefined> => {
    try {
      const token = await getIdToken();
      if (!token) return undefined;
      return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    } catch {
      return undefined;
    }
  };

  const { data: offers = [], isLoading, refetch } = useQuery<OfferData[]>({
    queryKey: ["task-offers", taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const headers = await getAuthHeaders();
      if (!headers) return [];
      const res = await fetch(`${TASK_API}/tasks/${taskId}/offers`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return data.offers || [];
    },
    enabled: !!taskId && !!user,
    staleTime: 10000,
  });

  const submitOfferMutation = useMutation({
    mutationFn: async (offerData: { message: string; amount?: number; deliveryTime?: string }) => {
      const headers = await getAuthHeaders();
      if (!headers) throw new Error("Not authenticated");
      const res = await fetch(`${TASK_API}/tasks/${taskId}/offers`, {
        method: "POST",
        headers,
        body: JSON.stringify(offerData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit offer");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-offers", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });

  const acceptOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const headers = await getAuthHeaders();
      if (!headers) throw new Error("Not authenticated");
      const res = await fetch(`${TASK_API}/offers/${offerId}/accept`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept offer");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-offers", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });

  const rejectOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const headers = await getAuthHeaders();
      if (!headers) throw new Error("Not authenticated");
      const res = await fetch(`${TASK_API}/offers/${offerId}/reject`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject offer");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-offers", taskId] });
    },
  });

  const withdrawOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const headers = await getAuthHeaders();
      if (!headers) throw new Error("Not authenticated");
      const res = await fetch(`${TASK_API}/offers/${offerId}/withdraw`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to withdraw offer");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-offers", taskId] });
    },
  });

  return {
    offers,
    isLoading,
    refetch,
    submitOffer: submitOfferMutation.mutateAsync,
    submitPending: submitOfferMutation.isPending,
    acceptOffer: acceptOfferMutation.mutateAsync,
    acceptPending: acceptOfferMutation.isPending,
    rejectOffer: rejectOfferMutation.mutateAsync,
    withdrawOffer: withdrawOfferMutation.mutateAsync,
  };
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  const { getIdToken } = useFirebaseAuth();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const res = await fetch(`${TASK_API}/tasks/${taskId}/complete`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete task");
      return data;
    },
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  const { getIdToken } = useFirebaseAuth();

  return useMutation({
    mutationFn: async (reviewData: { taskId: string; revieweeId: string; rating: number; comment?: string }) => {
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const res = await fetch(`${TASK_API}/reviews`, {
        method: "POST",
        headers,
        body: JSON.stringify(reviewData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
    },
  });
}

export function useUserReviews(targetUserId: string | undefined) {
  const { user, getIdToken } = useFirebaseAuth();

  return useQuery<ReviewData[]>({
    queryKey: ["reviews", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const token = await getIdToken();
      if (!token) return [];
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${TASK_API}/reviews/${targetUserId}`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return data.reviews || [];
    },
    enabled: !!targetUserId && !!user,
    staleTime: 30000,
  });
}
