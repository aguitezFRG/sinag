'use client';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_AUTH_ENCRYPTION_PUBLIC_KEY || '';

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s+/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function isClientAuthEncryptionReady(): boolean {
  return !!PUBLIC_KEY && typeof window !== 'undefined' && !!window.crypto?.subtle;
}

export async function encryptAuthPayload(payload: unknown): Promise<string> {
  if (!isClientAuthEncryptionReady()) {
    throw new Error('Client auth encryption is not configured');
  }

  const keyBuffer = pemToArrayBuffer(PUBLIC_KEY);
  const cryptoKey = await window.crypto.subtle.importKey(
    'spki',
    keyBuffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );

  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const encrypted = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, cryptoKey, encoded);
  return arrayBufferToBase64(encrypted);
}

