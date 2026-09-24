/**
 * authentication layer
 *
 * wraps the platform auth methods. to migrate to supabase auth, replace the
 * bodies of these functions with supabase.auth.* equivalents and update the
 * session handling in lib/AuthContext.jsx accordingly.
 *
 * note: this app uses platform-managed auth for admin routes only.
 * market account access uses a separate key-based system (see lib/crypto.js).
 */

import { base44 } from "@/api/base44Client";

/**
 * returns the currently authenticated user, or null if not logged in.
 * @returns {Promise<object | null>}
 */
export async function getCurrentUser() {
  return base44.auth.me();
}

/**
 * checks whether the user is currently authenticated.
 * @returns {Promise<boolean>}
 */
export async function checkIsAuthenticated() {
  return base44.auth.isAuthenticated();
}

/**
 * logs the user out and optionally redirects to the given url.
 * @param {string | undefined} redirectUrl
 */
export function logout(redirectUrl) {
  base44.auth.logout(redirectUrl);
}

/**
 * redirects the user to the platform login page.
 * after login, the user is returned to the given url.
 * @param {string | undefined} returnToUrl
 */
export function redirectToLogin(returnToUrl) {
  base44.auth.redirectToLogin(returnToUrl);
}