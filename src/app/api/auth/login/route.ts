import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { signRefreshToken } from "@/lib/jwt";
import brcypt from "bcrypt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
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


  return NextResponse.json(
    {
      message: "Login successful",
    },
    { status: 200 }
  );
}
