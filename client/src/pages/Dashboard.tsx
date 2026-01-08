import { useState } from "react";
import { Layout } from "@/components/Layout";
import { HabitGrid } from "@/components/HabitGrid";
import { CreateHabitDialog } from "@/components/CreateHabitDialog";
import { useHabits, useHabitLogs } from "@/hooks/use-habits";
import { format, subMonths, addMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  // Mock userId for now, as per implementation notes
  const userId = "1";
  const { data: habits, isLoading } = useHabits(userId);

  const logsQueries = habits?.map(habit => useHabitLogs(habit.id.toString())) || [];
  const allLogsLoaded = logsQueries.every(query => !query.isLoading);

  let activeStreak = 0;
  let completionRate = 0;

  if (allLogsLoaded && habits && habits.length > 0) {
    const allLogs = logsQueries.flatMap(query => query.data || []);
    const completedDates = new Set(allLogs.filter(log => log.completed).map(log => log.date));
    
    // Calculate active streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; ; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (completedDates.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    activeStreak = streak;

    // Calculate completion rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let totalPossible = 0;
    let totalCompleted = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(thirtyDaysAgo);
      checkDate.setDate(thirtyDaysAgo.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      // For each habit, check if it was completed on this date
      habits.forEach(habit => {
        const habitLog = allLogs.find(log => 
          log.habitId === habit.id && log.date === dateStr
        );
        totalPossible++;
        if (habitLog?.completed) {
          totalCompleted++;
        }
      });
    }
    
    completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  }

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const resetToToday = () => setCurrentDate(new Date());

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Track your daily progress and build consistency.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-card rounded-lg border border-border p-1 shadow-sm">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="px-4 font-medium min-w-[140px] text-center font-mono text-sm">
                {format(currentDate, "MMMM yyyy")}
              </div>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <Button variant="outline" size="icon" onClick={resetToToday} title="Go to Today">
              <CalendarDays className="w-4 h-4" />
            </Button>
            
            <CreateHabitDialog userId={userId} />
          </div>
        </div>

        {/* Stats Summary - Placeholder for visual depth */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg shadow-black/5 hover:border-primary/20 transition-colors">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Habits</h3>
            <div className="mt-2 text-3xl font-display font-bold">
              {isLoading ? <Skeleton className="h-9 w-12" /> : habits?.length || 0}
            </div>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg shadow-black/5 hover:border-primary/20 transition-colors">
             <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Streak</h3>
            <div className="mt-2 text-3xl font-display font-bold">
              {allLogsLoaded ? `${activeStreak} Days` : <Skeleton className="h-9 w-12" />}
            </div>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg shadow-black/5 hover:border-primary/20 transition-colors">
             <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Completion Rate</h3>
            <div className="mt-2 text-3xl font-display font-bold text-emerald-500">
              {allLogsLoaded ? `${completionRate}%` : <Skeleton className="h-9 w-12" />}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="mt-8">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
          ) : (
            <HabitGrid habits={habits || []} currentDate={currentDate} />
          )}
        </div>
      </div>
    </Layout>
  );
}
