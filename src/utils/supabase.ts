/**
 * Backward compatibility layer redirecting to PocketBase backend
 */
export * from './pocketbase';
export { getPocketBaseClient as getSupabaseClient } from './pocketbase';
