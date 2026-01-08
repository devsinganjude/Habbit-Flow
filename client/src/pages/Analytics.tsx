import { Layout } from "@/components/Layout";
import { useHabits, useHabitLogs } from "@/hooks/use-habits";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

export default function Analytics() {
  const userId = "1";
  const { data: habits, isLoading: habitsLoading } = useHabits(userId);

  // Get logs for all habits for the last 30 days
  const logsQueries = habits?.map(habit => 
    useHabitLogs(habit.id.toString(), format(new Date(), "yyyy-MM"))
  ) || [];
  const allLogsLoaded = logsQueries.every(query => !query.isLoading);
  const allLogs = logsQueries.flatMap(query => query.data || []);

  // Calculate weekly data for the last 7 days
  const weeklyData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    
    // Count completed habits for this date
    const completedCount = habits?.filter(habit => {
      const habitLog = allLogs.find(log => 
        log.habitId === habit.id && log.date === dateStr
      );
      return habitLog?.completed;
    }).length || 0;

    return {
      name: format(date, "EEE"),
      completed: completedCount,
      target: habits?.length || 0
    };
  });

  // Calculate monthly trend for the last 30 days
  const monthlyTrend = Array.from({ length: 30 }).map((_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    
    // Calculate completion rate for this date
    const totalHabits = habits?.length || 0;
    const completedHabits = habits?.filter(habit => {
      const habitLog = allLogs.find(log => 
        log.habitId === habit.id && log.date === dateStr
      );
      return habitLog?.completed;
    }).length || 0;
    
    const rate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

    return {
      day: i + 1,
      rate: Math.round(rate)
    };
  });

  const isLoading = habitsLoading || !allLogsLoaded;

  // Calculate summary statistics
  const totalHabits = habits?.length || 0;
  const totalCompletedToday = habits?.filter(habit => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const habitLog = allLogs.find(log => 
      log.habitId === habit.id && log.date === todayStr
    );
    return habitLog?.completed;
  }).length || 0;
  
  const averageCompletionRate = monthlyTrend.length > 0 
    ? Math.round(monthlyTrend.reduce((sum, day) => sum + day.rate, 0) / monthlyTrend.length)
    : 0;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Visualize your performance and identify trends.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg shadow-black/5">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Habits</h3>
            <div className="mt-2 text-3xl font-display font-bold">
              {isLoading ? "..." : totalHabits}
            </div>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg shadow-black/5">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Completed Today</h3>
            <div className="mt-2 text-3xl font-display font-bold text-blue-500">
              {isLoading ? "..." : `${totalCompletedToday}/${totalHabits}`}
            </div>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg shadow-black/5">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg. Completion Rate</h3>
            <div className="mt-2 text-3xl font-display font-bold text-emerald-500">
              {isLoading ? "..." : `${averageCompletionRate}%`}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Completion Chart */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-lg shadow-black/5">
            <h3 className="text-xl font-bold mb-6">Weekly Overview</h3>
            <div className="h-[300px] w-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-muted-foreground">Loading chart data...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Monthly Trend Line */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-lg shadow-black/5">
            <h3 className="text-xl font-bold mb-6">Completion Rate Trend</h3>
            <div className="h-[300px] w-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-muted-foreground">Loading trend data...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip 
                       contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Habit Performance List */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-xl font-bold">Habit Performance</h3>
          </div>
          <div className="divide-y divide-border">
            {habits?.map((habit) => (
              <div key={habit.id} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: habit.color || "#6366f1" }}
                  />
                  <span className="font-medium">{habit.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Target: {habit.targetDays}/mo</span>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-primary" 
                      style={{ width: `${Math.random() * 100}%`, backgroundColor: habit.color || undefined }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!habits || habits.length === 0) && (
              <div className="p-8 text-center text-muted-foreground">
                No habits to analyze yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
