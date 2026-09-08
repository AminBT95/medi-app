import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { db } from "./database.js";
import { pharmacyUsers } from "../shared/schema.js";
import { eq } from "drizzle-orm";

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }
  return "dev-only-medi-rappel-secret-change-me";
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    pharmacyId: number;
    role: string;
    firstName: string;
    lastName: string;
  };
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, jwtSecret(), { expiresIn: "24h" });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, jwtSecret());
  } catch (error) {
    return null;
  }
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // Get fresh user data from database
    const user = await db.select().from(pharmacyUsers).where(eq(pharmacyUsers.id, decoded.id)).limit(1);
    
    if (!user.length || !user[0].isActive) {
      return res.status(403).json({ error: "User not found or inactive" });
    }

    req.user = {
      id: user[0].id,
      email: user[0].email,
      pharmacyId: user[0].pharmacyId,
      role: user[0].role,
      firstName: user[0].firstName,
      lastName: user[0].lastName,
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}

export async function loginUser(email: string, password: string) {
  const user = await db.select().from(pharmacyUsers).where(eq(pharmacyUsers.email, email)).limit(1);
  
  if (!user.length) {
    throw new Error("Invalid credentials");
  }

  const isValidPassword = await verifyPassword(password, user[0].password);
  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  if (!user[0].isActive) {
    throw new Error("Account is inactive");
  }

  // Update last login
  await db.update(pharmacyUsers)
    .set({ lastLogin: new Date() })
    .where(eq(pharmacyUsers.id, user[0].id));

  const token = generateToken({
    id: user[0].id,
    email: user[0].email,
    pharmacyId: user[0].pharmacyId,
    role: user[0].role,
  });

  return {
    token,
    user: {
      id: user[0].id,
      email: user[0].email,
      firstName: user[0].firstName,
      lastName: user[0].lastName,
      role: user[0].role,
      pharmacyId: user[0].pharmacyId,
    },
  };
}