import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertHabit, InsertHabitLog } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// ============================================
// HABIT HOOKS
// ============================================

export function useHabits(userId: number) {
  return useQuery({
    queryKey: [api.habits.list.path, userId],
    queryFn: async () => {
      const url = `${api.habits.list.path}?userId=${userId}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch habits");
      return api.habits.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertHabit) => {
      const res = await fetch(api.habits.create.path, {
        method: api.habits.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.habits.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create habit");
      }
      return api.habits.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.habits.list.path] });
      toast({
        title: "Habit Created",
        description: "New habit has been added to your dashboard.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.habits.delete.path, { id });
      const res = await fetch(url, {
        method: api.habits.delete.method,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete habit");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.habits.list.path] });
      toast({
        title: "Habit Deleted",
        description: "The habit has been removed.",
      });
    },
  });
}

// ============================================
// HABIT LOG HOOKS
// ============================================

export function useHabitLogs(habitId: number, monthStr?: string) {
  return useQuery({
    queryKey: [api.habits.logs.list.path, habitId, monthStr],
    queryFn: async () => {
      const baseUrl = buildUrl(api.habits.logs.list.path, { id: habitId });
      const url = monthStr ? `${baseUrl}?month=${monthStr}` : baseUrl;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.habits.logs.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateHabitLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ habitId, ...data }: InsertHabitLog & { habitId: number }) => {
      const url = buildUrl(api.habits.logs.update.path, { id: habitId });
      const res = await fetch(url, {
        method: api.habits.logs.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update log");
      return api.habits.logs.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific habit's logs
      const monthStr = format(new Date(variables.date), "yyyy-MM");
      
      queryClient.invalidateQueries({ 
        queryKey: [api.habits.logs.list.path, variables.habitId] 
      });
      
      // Also invalidate the specific query with month if it exists in cache
      queryClient.invalidateQueries({
        queryKey: [api.habits.logs.list.path, variables.habitId, monthStr]
      });
    },
  });
}
