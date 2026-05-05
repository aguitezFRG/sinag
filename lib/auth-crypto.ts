import crypto from 'crypto';

type AuthPlainPayload = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'student';
  studentNumber?: string;
  program?: string;
  department?: string;
};

type EncryptedEnvelope = {
  encrypted: true;
  payload: string;
};

function wrapPem(key: string, type: 'PRIVATE KEY' | 'PUBLIC KEY'): string {
  const stripped = key.replace(/\s+/g, '');
  if (stripped.startsWith('-----')) return key;
  const body = stripped.match(/.{1,64}/g)?.join('\n') ?? stripped;
  return `-----BEGIN ${type}-----\n${body}\n-----END ${type}-----`;
}

function getPrivateKey(): string | null {
  const raw = process.env.AUTH_ENCRYPTION_PRIVATE_KEY ?? null;
  return raw ? wrapPem(raw, 'PRIVATE KEY') : null;
}

function getServerPublicKey(): string | null {
  const raw = process.env.AUTH_ENCRYPTION_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_AUTH_ENCRYPTION_PUBLIC_KEY ?? null;
  return raw ? wrapPem(raw, 'PUBLIC KEY') : null;
}

export function isEncryptionRequired(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isEncryptedEnvelope(body: unknown): body is EncryptedEnvelope {
  return !!body && typeof body === 'object' && (body as { encrypted?: unknown }).encrypted === true;
}

export function decryptAuthEnvelope(payload: string): AuthPlainPayload {
  const privateKey = getPrivateKey();
  if (!privateKey) {
    throw new Error('Server missing AUTH_ENCRYPTION_PRIVATE_KEY');
  }

  try {
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(payload, 'base64')
    );

    const parsed = JSON.parse(decrypted.toString('utf8')) as AuthPlainPayload;
    return parsed;
  } catch {
    throw new Error('Invalid encrypted auth payload');
  }
}

export function validateAuthCryptoConfig(): {
  privateKeyConfigured: boolean;
  publicKeyConfigured: boolean;
  keyPairValid: boolean | null;
} {
  const privateKey = getPrivateKey();
  const publicKey = getServerPublicKey();
  const privateKeyConfigured = !!privateKey;
  const publicKeyConfigured = !!publicKey;

  if (!privateKeyConfigured || !publicKeyConfigured) {
    return {
      privateKeyConfigured,
      publicKeyConfigured,
      keyPairValid: null,
    };
  }

  try {
    const probe = Buffer.from('sinag-auth-crypto-probe', 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      probe
    );

    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      encrypted
    );

    return {
      privateKeyConfigured: true,
      publicKeyConfigured: true,
      keyPairValid: decrypted.equals(probe),
    };
  } catch {
    return {
      privateKeyConfigured: true,
      publicKeyConfigured: true,
      keyPairValid: false,
    };
  }
}
