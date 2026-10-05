import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

const MIME_MAP: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const segments = resolvedParams?.path ?? [];

    const relativePath = segments.join('/');
    if (relativePath.includes('..') || relativePath.includes('\\')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const uploadBaseDir = process.env.UPLOAD_DESTINATION
      ? path.resolve(process.env.UPLOAD_DESTINATION)
      : path.resolve(process.cwd(), 'public', 'uploads');

    const filePath = path.join(uploadBaseDir, ...segments);

    // Keamanan: pastikan file berada di dalam uploadBaseDir
    if (!filePath.startsWith(uploadBaseDir)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      return NextResponse.json({ error: 'Not a file' }, { status: 404 });
    }

    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
