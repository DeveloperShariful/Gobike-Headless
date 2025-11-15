// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';

// GraphQL Mutation কোয়েরি: লগইন করার জন্য
const LOGIN_MUTATION = `
  mutation LoginUser($email: String!, $password: String!) {
    login(input: { username: $email, password: $password }) {
      authToken
      refreshToken
      user {
        id
        email
        firstName
      }
    }
  }
`;

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;

  if (!endpoint) {
    console.error('WORDPRESS_GRAPHQL_ENDPOINT is not set');
    return NextResponse.json(
      { error: 'Server configuration error.' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: LOGIN_MUTATION,
        variables: { email, password },
      }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL Errors:', data.errors);
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const { authToken, refreshToken } = data.data.login;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token not received.' },
        { status: 401 }
      );
    }

    // ★★★ সঠিক পদ্ধতি: প্রথমে Response তৈরি করা ★★★
    const responseToClient = NextResponse.json(
      { success: true, user: data.data.login.user },
      { status: 200 }
    );

    // ★★★ তারপর সেই Response এর ওপর কুকি সেট করা ★★★
    responseToClient.cookies.set('auth-token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // ৩০ দিন
      sameSite: 'lax',
    });

    if (refreshToken) {
      responseToClient.cookies.set('refresh-token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // ৩০ দিন
        sameSite: 'lax',
      });
    }

    // সবশেষে কুকি-সহ Response টি রিটার্ন করা
    return responseToClient;

  } catch (error) {
    console.error('Login POST Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}