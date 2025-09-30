import { UserProfile } from '../types';

/**
 * Creates a stable, unique hash (fingerprint) from a user's profile.
 * This is used as a key for caching generated learning paths.
 * Normalizes skills by sorting and lowercasing to ensure consistency.
 * @param profile The user's profile object.
 * @returns A promise that resolves to a SHA-256 hash string.
 */
export const generateProfileHash = async (profile: UserProfile): Promise<string> => {
    // 1. Normalize and sort skills to ensure consistency
    const normalizedSkills = [...profile.skills]
        .map(s => s.toLowerCase().trim())
        .sort()
        .join(',');

    // 2. Normalize career aspirations
    const normalizedAspirations = profile.career_aspirations.toLowerCase().trim();

    // 3. Create a stable string representation
    const stableString = `aspirations:${normalizedAspirations}|skills:${normalizedSkills}`;

    // 4. Use the SubtleCrypto API to create a SHA-256 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(stableString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // 5. Convert the buffer to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
};