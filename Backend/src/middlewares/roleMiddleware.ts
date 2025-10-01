
// Purpose: Restrict access to routes based on user roles.
// Usage: Pass allowed roles (e.g., "admin", "vendor"). 
// If the logged-in user's role is not in the list → return 403 Forbidden.

import { Request, Response, NextFunction } from "express";
 

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
};
