import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ message: 'Logout berhasil.' });
  } catch (error) {
    console.error('[POST /api/auth/logout] Error:', error);
    return NextResponse.json(
      { error: 'Gagal melakukan logout.' },
      { status: 500 }
    );
  }
}
