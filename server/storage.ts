import { db } from "./db";
import { eq, and } from "drizzle-orm";
import {
  habits, habitLogs,
  type Habit, type InsertHabit,
  type HabitLog, type InsertHabitLog
} from "@shared/schema";

export interface IStorage {
  // Habit methods
  createHabit(habit: InsertHabit): Promise<Habit>;
  getHabits(userId: string): Promise<Habit[]>; // userId is string now
  getHabit(id: number): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<void>;

  // Log methods
  getHabitLogs(habitId: number, month?: string): Promise<HabitLog[]>;
  logHabit(log: InsertHabitLog): Promise<HabitLog>;
}

export class DatabaseStorage implements IStorage {
  async createHabit(habit: InsertHabit): Promise<Habit> {
    const [newHabit] = await db.insert(habits).values(habit).returning();
    return newHabit;
  }

  async getHabits(userId: string): Promise<Habit[]> {
    return await db.select().from(habits).where(eq(habits.userId, userId));
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    const [habit] = await db.select().from(habits).where(eq(habits.id, id));
    return habit;
  }

  async deleteHabit(id: number): Promise<void> {
    await db.delete(habits).where(eq(habits.id, id));
  }

  async getHabitLogs(habitId: number, month?: string): Promise<HabitLog[]> {
    return await db.select().from(habitLogs).where(eq(habitLogs.habitId, habitId));
  }

  async logHabit(log: InsertHabitLog): Promise<HabitLog> {
    const [existing] = await db.select()
      .from(habitLogs)
      .where(and(
        eq(habitLogs.habitId, log.habitId),
        eq(habitLogs.date, log.date)
      ));

    if (existing) {
      const [updated] = await db.update(habitLogs)
        .set({ completed: log.completed, notes: log.notes })
        .where(eq(habitLogs.id, existing.id))
        .returning();
      return updated;
    }

    const [newLog] = await db.insert(habitLogs).values(log).returning();
    return newLog;
  }
}

export const storage = new DatabaseStorage();
