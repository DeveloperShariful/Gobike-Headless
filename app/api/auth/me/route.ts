// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

// ★★★ আপডেট: affiliateStatus যোগ করা হয়েছে ★★★
const GET_VIEWER_QUERY = `
  query GetViewer($key: String!) {
    viewerByKey(secretKey: $key) {
      id
      firstName
      email
      affiliateStatus
    }
  }
`;

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const secretKey = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!secretKey) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  try {
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

    if (user) {
      return NextResponse.json({ 
        loggedIn: true, 
        // ★★★ আপডেট: affiliateStatus পাঠানো হচ্ছে ★★★
        user: { 
            id: user.id, 
            firstName: user.firstName, 
            email: user.email,
            affiliateStatus: user.affiliateStatus 
        } 
      });
    }

    return NextResponse.json({ loggedIn: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ loggedIn: false }, { status: 500 });
  }
}