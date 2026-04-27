'use client';

import { useEffect, useState } from 'react';
import RegisterModal from '@/app/components/auth/RegisterModal';

export default function RegisterPage() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Open modal immediately when page loads
    setIsOpen(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <RegisterModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
