import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users
 * Mendapatkan daftar semua akun pengguna (Hanya untuk Superadmin).
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Fitur ini hanya untuk Superadmin.' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('[GET /api/admin/users] Error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pengguna.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Membuat akun pengguna/admin baru (Hanya untuk Superadmin).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Fitur ini hanya untuk Superadmin.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password, role = 'ADMIN' } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nama pengguna wajib diisi minimal 2 karakter.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Format email tidak valid.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password wajib diisi minimal 8 karakter.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Pastikan email belum digunakan
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar untuk pengguna lain.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'SUPERADMIN' ? Role.SUPERADMIN : Role.ADMIN;

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: assignedRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/users] Error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat akun pengguna.' },
      { status: 500 }
    );
  }
}

