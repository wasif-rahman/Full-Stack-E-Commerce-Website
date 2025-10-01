import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import { users } from "../models/user.js";
import { eq } from "drizzle-orm";
import AppError from "../utils/AppError.js";

export const registerUserService = async (name: string, email: string, password: string, role?: "customer" | "vendor" | "admin") => {
  const [existingUser] = await db.select().from(users).where(eq(users.email, email));
  if (existingUser) throw new AppError(400, "Email already in use");

  const hashedPassword = await bcrypt.hash(password, 10);

  const insertedUsers = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
    role: role || "customer",
  }).returning();

  if (!insertedUsers || insertedUsers.length === 0) {
    throw new AppError(500, "Failed to create user");
  }

  const newUser = insertedUsers[0];
  if (!newUser) {
    throw new AppError(500, "Failed to create user");
  }

  // Generate token for the new user
  if (!process.env.JWT_SECRET) {
    throw new AppError(500, "JWT_SECRET is not configured");
  }

  const jwtOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h"
  } as jwt.SignOptions;

  let token: string;
  try {
    token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      jwtOptions
    );
  } catch (error) {
    throw new AppError(500, "Failed to generate token");
  }

  const { password: _, ...userWithoutPassword } = newUser;
  return {
    token,
    user: userWithoutPassword
  };
};
export const loginUserService = async (email: string, password: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new AppError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError(401, "Invalid credentials");

  // Validate JWT secret
  if (!process.env.JWT_SECRET) {
    throw new AppError(500, "JWT_SECRET is not configured");
  }

  const jwtOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h"
  } as jwt.SignOptions;

  let token: string;
  try {
    token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      jwtOptions
    );
  } catch (error) {
    throw new AppError(500, "Failed to generate token");
  }

  const { password: _, ...userWithoutPassword } = user;
  return {
    token,
    user: userWithoutPassword
  };
};

export const getCurrentUserService = async (userId: string) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) throw new AppError(404, "User not found");

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const logoutUserService = async () => {
  // For JWT, logout is handled on the client side by removing the token
  return { message: "Logged out successfully" };
};



