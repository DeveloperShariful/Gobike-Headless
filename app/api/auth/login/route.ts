// app/api/auth/login/route.ts


import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

const LOGIN_MUTATION = `
  mutation LoginWithKey($username: String!, $password: String!) {
    loginWithSecretKey(input: { username: $username, password: $password }) {
      secretKey
      userId
      firstName
      email
    }
  }
`;

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;

  if (!endpoint) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: LOGIN_MUTATION,
        variables: { username: email, password: password },
      }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const result = data.data.loginWithSecretKey;

    const responseToClient = NextResponse.json(
      { 
        success: true, 
        user: { id: result.userId, firstName: result.firstName, email: result.email } 
      },
      { status: 200 }
    );

    responseToClient.cookies.set(AUTH_COOKIE_NAME, result.secretKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    return responseToClient;

  } catch (error) {
    return NextResponse.json({ error: 'Network error' }, { status: 500 });
  }
}