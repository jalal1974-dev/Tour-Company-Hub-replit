import type { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const session = (req as Request & { session?: { adminId?: number; username?: string; role?: string } }).session;
  if (!session?.adminId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}
