// app/api/auth/me/route.ts


import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

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

  // ১. লগ: কুকি পাওয়া গেছে কি না?
  if (!secretKey) {
    console.error('❌ [API/ME] 401 Error: No Secret Key found in cookies.');
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) {
    console.error('❌ [API/ME] 500 Error: Missing GraphQL Endpoint.');
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GET_VIEWER_QUERY,
        variables: { key: secretKey },
      }),
      cache: 'no-store', // হার্ড রিফ্রেশের জন্য ক্যাশ অফ রাখা জরুরি
    });

    const data = await response.json();
    
    // ২. লগ: ওয়ার্ডপ্রেস কী রেসপন্স দিল?
    if (data.errors) {
        console.error('❌ [API/ME] GraphQL Error:', data.errors[0].message);
    }

    const user = data?.data?.viewerByKey;

    if (user) {
      // ✅ সফল লগইন
      return NextResponse.json({ 
        loggedIn: true, 
        user: { 
            id: user.id, 
            firstName: user.firstName, 
            email: user.email,
            affiliateStatus: user.affiliateStatus 
        } 
      });
    }

    // ৩. লগ: ইউজার পাওয়া যায়নি
    console.error('❌ [API/ME] 401 Error: Invalid Secret Key (User not found in WP). Key used:', secretKey);
    
    return NextResponse.json({ loggedIn: false }, { status: 401 });

  } catch (error) {
    console.error('❌ [API/ME] 500 Error: Fetch failed:', error);
    return NextResponse.json({ loggedIn: false }, { status: 500 });
  }
}