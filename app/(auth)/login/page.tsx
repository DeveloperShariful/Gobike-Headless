import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Login | GoBike Australia',
  description: 'Login to your GoBike Australia account.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/login',
  }
};

export default function LoginPage() {
  return (
    <main>
      <LoginForm />
    </main>
  );
}