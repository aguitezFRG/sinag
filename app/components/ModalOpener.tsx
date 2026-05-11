'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface ModalOpenerProps {
  setShowLoginModal: (v: boolean) => void;
  setShowSignUpModal: (v: boolean) => void;
}

export default function ModalOpener({ setShowLoginModal, setShowSignUpModal }: ModalOpenerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const modal = searchParams.get('modal');
    if (modal === 'register') {
      setShowSignUpModal(true);
      setShowLoginModal(false);
    } else if (modal === 'login') {
      setShowLoginModal(true);
      setShowSignUpModal(false);
    }
  }, [searchParams, setShowLoginModal, setShowSignUpModal]);

  return null;
}
