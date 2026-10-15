/**
 * Where the project index lives.
 *
 * On the deployed site this gallery is a folder of the index's own build, so home is
 * the site root. Under `pnpm dev:kitchen-sink` it's a separate Vite server and the link
 * has to leave the origin to reach it — which only resolves if `pnpm dev:home` is also
 * running.
 */
export const HOME_HREF = import.meta.env.DEV ? "http://localhost:5275/" : "/";
