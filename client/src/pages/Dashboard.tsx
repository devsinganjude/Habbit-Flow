import { useState } from "react";
import { Layout } from "@/components/Layout";
import { HabitGrid } from "@/components/HabitGrid";
import { CreateHabitDialog } from "@/components/CreateHabitDialog";
import { useHabits } from "@/hooks/use-habits";
import { format, subMonths, addMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  // Mock userId for now, as per implementation notes
  const userId = 1;
  const { data: habits, isLoading } = useHabits(userId);

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
              {/* Mock data for now */}
              12 Days
            </div>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg shadow-black/5 hover:border-primary/20 transition-colors">
             <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Completion Rate</h3>
            <div className="mt-2 text-3xl font-display font-bold text-emerald-500">
              84%
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
