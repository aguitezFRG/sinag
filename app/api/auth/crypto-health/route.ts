import { NextResponse } from 'next/server';
import { validateAuthCryptoConfig } from '@/lib/auth-crypto';

export async function GET() {
  const cfg = validateAuthCryptoConfig();

  return NextResponse.json(
    {
      encryptionRequired: process.env.NODE_ENV === 'production',
      serverPrivateKeyConfigured: cfg.privateKeyConfigured,
      clientPublicKeyConfigured: cfg.publicKeyConfigured,
      keyPairValid: cfg.keyPairValid,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
