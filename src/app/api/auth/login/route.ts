import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { signSessionToken, setSessionCookie } from '@/lib/auth';

// In-memory rate limiting map for brute-force protection
// IP -> { count: number, resetAt: number, blockedUntil: number }
const attemptsMap = new Map<string, { count: number; resetAt: number; blockedUntil: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts?: number; retryAfter?: number } {
  const now = Date.now();
  const entry = attemptsMap.get(ip);

  if (entry) {
    if (entry.blockedUntil > now) {
      const waitSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
      return { allowed: false, retryAfter: waitSeconds };
    }

    if (entry.resetAt < now) {
      attemptsMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000, blockedUntil: 0 });
      return { allowed: true, remainingAttempts: 4 };
    }

    if (entry.count >= 5) {
      entry.blockedUntil = now + 15 * 60 * 1000; // Block for 15 minutes
      const waitSeconds = 15 * 60;
      return { allowed: false, retryAfter: waitSeconds };
    }

    entry.count += 1;
    return { allowed: true, remainingAttempts: 5 - entry.count };
  }

  attemptsMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000, blockedUntil: 0 });
  return { allowed: true, remainingAttempts: 4 };
}

function clearRateLimit(ip: string): void {
  attemptsMap.delete(ip);
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan gagal. Silakan coba lagi dalam ${Math.ceil((rateLimit.retryAfter || 900) / 60)} menit.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kredensial tidak valid.' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Kredensial tidak valid.' },
        { status: 401 }
      );
    }

    // Success: clear rate limit attempts
    clearRateLimit(ip);

    // Sign session token and set httpOnly cookie
    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      message: 'Login berhasil.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[POST /api/auth/login] Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat login.' },
      { status: 500 }
    );
  }
}
