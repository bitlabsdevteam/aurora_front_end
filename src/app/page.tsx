'use client';

import { useRouter } from 'next/navigation';
import Login from './components/Login';

export default function Home() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8F9FE]">
      <Login onLoginSuccess={handleLoginSuccess} />
    </main>
  );
}
