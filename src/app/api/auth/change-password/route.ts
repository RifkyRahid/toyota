import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { getSession, signSessionToken, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Akses ditolak. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword, newEmail } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Password saat ini wajib diisi untuk verifikasi keamanan.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Akun pengguna tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Verifikasi password saat ini
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password saat ini yang Anda masukkan salah.' },
        { status: 400 }
      );
    }

    const updateData: { email?: string; password?: string } = {};

    // Validasi dan update email jika diubah
    if (newEmail && newEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      const trimmedEmail = newEmail.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return NextResponse.json(
          { error: 'Format email baru tidak valid.' },
          { status: 400 }
        );
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          email: trimmedEmail,
          NOT: { id: user.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email baru tersebut sudah terdaftar pada akun lain.' },
          { status: 400 }
        );
      }

      updateData.email = trimmedEmail;
    }

    // Validasi dan update password baru jika diisi
    if (newPassword) {
      if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return NextResponse.json(
          { error: 'Password baru minimal harus 8 karakter.' },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada perubahan email atau password yang dimasukkan.' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Refresh cookie sesi agar tetap login dengan data baru
    const newToken = await signSessionToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    });
    await setSessionCookie(newToken);

    return NextResponse.json({
      message: 'Akun dan password admin berhasil diperbarui.',
      email: updatedUser.email,
    });
  } catch (error) {
    console.error('[POST /api/auth/change-password] Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memperbarui profil admin.' },
      { status: 500 }
    );
  }
}

