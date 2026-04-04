import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { query } from "./db";

const JWT_SECRET = process.env.SESSION_SECRET ?? "zensure-dev-secret-change-in-prod";

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getUserFromToken(token: string) {
  const payload = verifyToken(token);
  if (!payload) return null;

  const result = await query(
    "SELECT id, name, email, city, avg_income, working_hours, created_at FROM users WHERE id = $1",
    [payload.userId]
  );
  return result.rows[0] ?? null;
}
