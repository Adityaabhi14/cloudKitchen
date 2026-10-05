'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/profile');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAF5ED] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C9281C] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
