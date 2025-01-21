import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// Named .mts because of https://vitejs.dev/guide/troubleshooting.html#this-package-is-esm-only

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    server: {
        proxy: {
            '/socket.io': {
                target: 'http://localhost:5000',
                ws: true,
            },
        },
    },
});
