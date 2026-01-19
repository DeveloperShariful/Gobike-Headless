// app/api/auth/login/route.ts


import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

// ১. লগইন মিউটেশন (আগেরটাই, কারণ এটা কাজ করছে)
const LOGIN_MUTATION = `
  mutation LoginWithKey($username: String!, $password: String!) {
    loginWithSecretKey(input: { username: $username, password: $password }) {
      secretKey
      userId
    }
  }
`;

// ২. স্ট্যাটাস চেক কুয়েরি (নতুন)
// লগইন হওয়ার পর আমরা এই কুয়েরি দিয়ে স্ট্যাটাস বের করব
const GET_USER_STATUS_QUERY = `
  query GetUserStatus($key: String!) {
    viewerByKey(secretKey: $key) {
      id
      firstName
      lastName
      email
      affiliateStatus
    }
  }
`;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;

  if (!endpoint) {
    return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
  }

  try {
    // ধাপ ১: লগইন করা এবং Secret Key আনা
    const loginResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: LOGIN_MUTATION,
        variables: { username: email, password: password },
      }),
      cache: 'no-store',
    });

    const loginData = await loginResponse.json();

    if (loginData.errors || !loginData.data.loginWithSecretKey) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const { secretKey, userId } = loginData.data.loginWithSecretKey;

    // ধাপ ২: Secret Key ব্যবহার করে Affiliate Status জানা
    const userResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GET_USER_STATUS_QUERY,
        variables: { key: secretKey },
      }),
      cache: 'no-store',
    });

    const userData = await userResponse.json();
    const userDetails = userData.data?.viewerByKey;

    // যদি কোনো কারণে ইউজার ডাটা না আসে, আমরা বেসিক ডাটা ফেরত দেব
    const finalUser = userDetails || { id: userId, email: email, affiliateStatus: null };

    // ধাপ ৩: কুকি সেট করা
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, secretKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 Days
      sameSite: 'lax',
    });

    // ধাপ ৪: ফ্রন্টএন্ডে স্ট্যাটাস সহ ডাটা পাঠানো
    return NextResponse.json({
      success: true,
      user: {
        id: finalUser.id,
        firstName: finalUser.firstName,
        lastName: finalUser.lastName,
        email: finalUser.email,
        affiliateStatus: finalUser.affiliateStatus, // ★★★ এই ফিল্ডটি এখন মেনু ঠিক করবে ★★★
      },
    });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, message: 'Network error' }, { status: 500 });
  }
}