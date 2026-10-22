/** Short identifier of the running build (commit and build time); `dev` outside a Vite build. */
export const BUILD_ID: string = typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'dev';
