// lib/session.ts
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

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const secretKey = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!secretKey) return null;

  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) return null;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GET_VIEWER_QUERY,
        variables: { key: secretKey },
      }),
      cache: 'no-store', // Always fresh data
    });

    const data = await response.json();
    return data?.data?.viewerByKey || null;
  } catch (error) {
    return null;
  }
}