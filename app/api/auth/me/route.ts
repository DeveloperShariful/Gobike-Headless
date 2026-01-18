//app/api/auth/me/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

const GET_VIEWER_QUERY = `
  query GetViewer($key: String!) {
    viewerByKey(secretKey: $key) {
      id
      firstName
      email
    }
  }
`;

export async function GET(request: NextRequest) {
  // ১. সার্ভার থেকে কুকি পড়া (Browser এটা পারে না, কিন্তু সার্ভার পারে)
  const cookieStore = await cookies();
  const secretKey = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!secretKey) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  try {
    // ২. কুকি পেলে ওয়ার্ডপ্রেসকে জিজ্ঞেস করা এই ইউজার কে?
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GET_VIEWER_QUERY,
        variables: { key: secretKey },
      }),
      cache: 'no-store',
    });

    const data = await response.json();
    const user = data?.data?.viewerByKey;

    // ৩. যদি ভ্যালিড ইউজার হয়, ফ্রন্টএন্ডকে ডাটা পাঠানো
    if (user) {
      return NextResponse.json({ 
        loggedIn: true, 
        user: { id: user.id, firstName: user.firstName, email: user.email } 
      });
    }

    return NextResponse.json({ loggedIn: false }, { status: 401 });

  } catch (error) {
    return NextResponse.json({ loggedIn: false }, { status: 500 });
  }
}