//app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  
  // কুকি ডিলিট
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);

  // রিডাইরেক্ট URL চেক
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get('redirect') || '/login';

  return NextResponse.redirect(new URL(redirectUrl, request.url));
}

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
  return NextResponse.json({ success: true });
}