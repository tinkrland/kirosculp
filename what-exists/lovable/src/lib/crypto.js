/**
 * client-side sha256 hashing using the web crypto api.
 * used to hash market account access keys before storing them.
 * the raw key is never sent to the server - only the hash is persisted.
 */
export async function hashKey(rawKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(rawKey);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * generates a cryptographically random access key.
 * format: 3 groups of 8 hex characters separated by dashes.
 * readable enough to write down, strong enough to be a credential.
 */
export function generateAccessKey() {
  const array = new Uint8Array(24);
  window.crypto.getRandomValues(array);
  const hex = Array.from(array).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 16)}-${hex.slice(16, 24)}`;
}