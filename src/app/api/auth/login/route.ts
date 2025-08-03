import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { signRefreshToken } from "@/lib/jwt";
import brcypt from "bcrypt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";
import { log } from "console";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  logger.info("Login Request Received:", email, password);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    logger.warn("Login failed: User not found", email);
    return NextResponse.json({ error: "Invalid Credentials" }, { status: 401 });
  }

  const isPasswordValid = await brcypt.compare(password, user.password);
  if (!isPasswordValid) {
    logger.warn("Login failed: Invalid password", email);
    return NextResponse.json({ error: "Invalid Credentials" }, { status: 401 });
  }

  const accessToken = signToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  const cookieStore = await cookies();

  // Set access token (short-lived)
  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutes
  });

  // Set refresh token (long-lived)
  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  cookieStore.set("user_info", JSON.stringify({ name: user.name, email: user.email }), {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
});

  logger.info("Login successful for user:", email);
  return NextResponse.json(
    {
      message: "Login successful",
    },
    { status: 200 }
  );
}
