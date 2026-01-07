import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Trash2 } from "lucide-react";
import { useHabitLogs, useUpdateHabitLog, useDeleteHabit } from "@/hooks/use-habits";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Habit } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HabitGridProps {
  habits: Habit[];
  currentDate: Date;
}

export function HabitGrid({ habits, currentDate }: HabitGridProps) {
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-card/50 shadow-xl shadow-black/5">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex flex-col min-w-max">
          {/* Header Row */}
          <div className="flex border-b border-border/50 bg-muted/30">
            <div className="sticky left-0 z-20 w-[240px] p-4 font-display font-semibold text-muted-foreground bg-card border-r border-border/50 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.2)]">
              Habit Name
            </div>
            {daysInMonth.map((day) => (
              <div 
                key={day.toISOString()} 
                className={cn(
                  "w-[42px] p-2 flex flex-col items-center justify-center text-xs border-r border-border/30 last:border-r-0",
                  isSameDay(day, new Date()) ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground"
                )}
              >
                <span className="opacity-70">{format(day, "EEEEE")}</span>
                <span className="text-sm font-medium">{format(day, "d")}</span>
              </div>
            ))}
            <div className="w-[100px] p-4 text-center font-display font-semibold text-muted-foreground border-l border-border/30">
              Progress
            </div>
          </div>

          {/* Habit Rows */}
          <div className="flex flex-col">
            <AnimatePresence>
              {habits.map((habit) => (
                <HabitRow 
                  key={habit.id} 
                  habit={habit} 
                  days={daysInMonth} 
                />
              ))}
            </AnimatePresence>
            {habits.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                No habits yet. Click "New Habit" to get started!
              </div>
            )}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

function HabitRow({ habit, days }: { habit: Habit, days: Date[] }) {
  const monthStr = format(days[0], "yyyy-MM");
  const { data: logs, isLoading } = useHabitLogs(habit.id, monthStr);
  const updateLog = useUpdateHabitLog();
  const deleteHabit = useDeleteHabit();

  const getLogForDay = (date: Date) => {
    return logs?.find(log => isSameDay(new Date(log.date), date));
  };

  const handleToggle = (date: Date, currentStatus: boolean) => {
    updateLog.mutate({
      habitId: habit.id,
      date: format(date, "yyyy-MM-dd"),
      completed: !currentStatus,
      notes: null,
    });
  };

  // Calculate stats
  const completedCount = logs?.filter(l => l.completed).length || 0;
  const progress = Math.min(100, Math.round((completedCount / (habit.targetDays || 30)) * 100));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="flex border-b border-border/30 last:border-b-0 group hover:bg-muted/5 transition-colors"
    >
      <div className="sticky left-0 z-20 w-[240px] p-3 flex items-center justify-between bg-card border-r border-border/50 group-hover:bg-card/95 transition-colors shadow-[4px_0_12px_-4px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div 
            className="w-1.5 h-8 rounded-full shrink-0" 
            style={{ backgroundColor: habit.color || "#6366f1" }}
          />
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate">{habit.name}</span>
            {habit.description && (
              <span className="text-xs text-muted-foreground truncate">{habit.description}</span>
            )}
          </div>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Habit?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{habit.name}" and all its history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteHabit.mutate(habit.id)} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        days.map((day) => {
          const log = getLogForDay(day);
          const isCompleted = log?.completed || false;
          
          return (
            <div 
              key={day.toISOString()} 
              className={cn(
                "w-[42px] border-r border-border/30 last:border-r-0 flex items-center justify-center",
                isSameDay(day, new Date()) && "bg-primary/5"
              )}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleToggle(day, isCompleted)}
                    disabled={updateLog.isPending}
                    className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200",
                      isCompleted 
                        ? "text-primary-foreground shadow-sm scale-100" 
                        : "bg-muted/30 hover:bg-muted text-transparent scale-90 hover:scale-100",
                      updateLog.isPending && "opacity-50 cursor-wait"
                    )}
                    style={{ backgroundColor: isCompleted ? habit.color || "#6366f1" : undefined }}
                  >
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-semibold">{format(day, "MMM d")}: {isCompleted ? "Done" : "Not Done"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })
      )}

      {/* Progress Cell */}
      <div className="w-[100px] p-2 flex items-center justify-center border-l border-border/30">
        <div className="w-full max-w-[60px]">
          <div className="flex justify-between text-[10px] mb-1 font-medium text-muted-foreground">
            <span>{completedCount}</span>
            <span>/ {habit.targetDays}</span>
          </div>
          <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
            <motion.div 
              className="h-full rounded-full"
              style={{ backgroundColor: habit.color || "#6366f1" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
