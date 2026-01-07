import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { authStorage } from "./replit_integrations/auth/storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Auth First
  await setupAuth(app);
  registerAuthRoutes(app);

  // Helper to get userId from req (supports mocked '1' for dev if needed, or actual auth)
  const getUserId = (req: any) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return req.user.claims.sub;
    }
    // For development/testing without login, you might return a demo user ID
    // But since IDs are strings now (auth IDs), we should probably require login or have a fixed demo ID.
    // Let's fallback to "demo-user-id" for now, and ensure that user exists in seed.
    if (process.env.NODE_ENV !== 'production') {
      return "demo-user-id"; 
    }
    return null;
  };

  // Habits CRUD
  app.get(api.habits.list.path, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const habits = await storage.getHabits(userId);
    res.json(habits);
  });

  app.post(api.habits.create.path, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const input = api.habits.create.input.parse(req.body);
      // Ensure habit is created for the current user
      const habit = await storage.createHabit({ ...input, userId });
      res.status(201).json(habit);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.habits.get.path, async (req, res) => {
    const habit = await storage.getHabit(Number(req.params.id));
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    res.json(habit);
  });

  app.delete(api.habits.delete.path, async (req, res) => {
    await storage.deleteHabit(Number(req.params.id));
    res.status(204).end();
  });

  // Logs
  app.get(api.habits.logs.list.path, async (req, res) => {
    const logs = await storage.getHabitLogs(Number(req.params.id), req.query.month as string);
    res.json(logs);
  });

  app.post(api.habits.logs.update.path, async (req, res) => {
    try {
      const input = api.habits.logs.update.input.parse(req.body);
      const log = await storage.logHabit({ ...input, habitId: Number(req.params.id) });
      res.json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const demoUserId = "demo-user-id";
  // Ensure demo user exists
  let user = await authStorage.getUser(demoUserId);
  if (!user) {
    await authStorage.upsertUser({
      id: demoUserId,
      email: "demo@example.com",
      firstName: "Demo",
      lastName: "User",
    });
  }

  const existingHabits = await storage.getHabits(demoUserId);
  if (existingHabits.length === 0) {
    await storage.createHabit({
      userId: demoUserId,
      name: "Drink Water",
      description: "Drink 8 glasses of water daily",
      color: "#3B82F6",
      targetDays: 30
    });
    await storage.createHabit({
      userId: demoUserId,
      name: "Exercise",
      description: "30 minutes of cardio",
      color: "#10B981",
      targetDays: 20
    });
  }
}
