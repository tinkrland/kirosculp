/**
 * file storage layer
 *
 * all file uploads go through here. the current implementation delegates to
 * the platform's built-in upload integration. to migrate to supabase storage,
 * replace the body of each function with supabase.storage calls and update
 * the bucket names in portsb.md.
 */

import { base44 } from "@/api/base44Client";

/**
 * uploads a file and returns its public url.
 * returns null if the upload fails.
 *
 * @param {File} file - the file object from an input element
 * @returns {Promise<string | null>} public url of the uploaded file
 */
export async function uploadFile(file) {
  const result = await base44.integrations.Core.UploadFile({ file });
  return result?.file_url ?? null;
}