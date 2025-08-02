// app/api/auth/refresh/route.ts
import { verifyRefreshToken, signToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "Refresh token missing" }, { status: 401 });
  }

  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded || typeof decoded === "string" || !("userId" in decoded)) {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 403 });
  }

  const newAccessToken = signToken({ userId: decoded.userId });

  cookieStore.set("access_token", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 mins
  });

  return NextResponse.json({ message: "Access token refreshed" }, { status: 200 });
}
