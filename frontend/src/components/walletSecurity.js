const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function deriveKey(pin, salt) {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 250000,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptWallet(walletData, pin) {
  if (!pin || pin.length < 6) {
    throw new Error("PIN must contain at least 6 characters.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pin, salt);
  const plaintext = encoder.encode(JSON.stringify(walletData));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );

  return JSON.stringify({
    version: 1,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted)),
  });
}

export async function decryptWallet(payload, pin) {
  const stored = JSON.parse(payload);
  if (stored.version !== 1) {
    throw new Error("Unsupported wallet storage version.");
  }

  const salt = base64ToBytes(stored.salt);
  const iv = base64ToBytes(stored.iv);
  const data = base64ToBytes(stored.data);
  const key = await deriveKey(pin, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return JSON.parse(decoder.decode(decrypted));
}

export function isEncryptedWallet(value) {
  try {
    return JSON.parse(value)?.version === 1;
  } catch {
    return false;
  }
}
