import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/admin/users/[id]
 * Memperbarui info user atau reset password (Hanya untuk Superadmin).
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Fitur ini hanya untuk Superadmin.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { name, email, role, newPassword } = body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan.' },
        { status: 404 }
      );
    }

    const updateData: {
      name?: string;
      email?: string;
      role?: Role;
      password?: string;
    } = {};

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      updateData.name = name.trim();
    }

    if (email && typeof email === 'string' && email.includes('@')) {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail !== existing.email) {
        const duplicate = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });
        if (duplicate) {
          return NextResponse.json(
            { error: 'Email sudah digunakan oleh akun lain.' },
            { status: 409 }
          );
        }
        updateData.email = cleanEmail;
      }
    }

    if (role && (role === 'ADMIN' || role === 'SUPERADMIN')) {
      // Jangan biarkan superadmin mendowngrade akunnya sendiri jika dia satu-satunya
      if (existing.id === session.userId && role !== 'SUPERADMIN') {
        return NextResponse.json(
          { error: 'Anda tidak dapat menurunkan role akun Anda sendiri.' },
          { status: 400 }
        );
      }
      updateData.role = role === 'SUPERADMIN' ? Role.SUPERADMIN : Role.ADMIN;
    }

    // Jika Superadmin mereset password
    if (newPassword && typeof newPassword === 'string') {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'Password baru minimal 8 karakter.' },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada perubahan data yang dikirim.' },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/admin/users/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui data pengguna.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Menghapus akun pengguna (Hanya untuk Superadmin).
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Fitur ini hanya untuk Superadmin.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Tidak boleh menghapus akun diri sendiri yang sedang login
    if (session.userId === id) {
      return NextResponse.json(
        { error: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan.' },
        { status: 404 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: 'Pengguna berhasil dihapus.' });
  } catch (error) {
    console.error('[DELETE /api/admin/users/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus pengguna.' },
      { status: 500 }
    );
  }
}

