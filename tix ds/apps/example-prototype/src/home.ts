/**
 * Where the project index (homepage) lives.
 *
 * On the deployed site this prototype is a folder of the same site, so home is the root.
 * Under `pnpm dev` it's a separate Vite server, so the link has to go to the homepage's
 * own dev server (only works if `pnpm dev:home` is also running).
 */
export const HOME_HREF = import.meta.env.DEV ? "http://localhost:5275/" : "/";
