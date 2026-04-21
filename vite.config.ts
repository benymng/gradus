import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gradus',
        short_name: 'Gradus',
        description: 'Track your workout progress',
        theme_color: '#0a0a12',
        background_color: '#0a0a12',
        display: 'standalone',
        display_override: ['standalone', 'browser'],
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
          { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
          { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 3600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: true
      }
    }),
    {
      name: 'vercel-api-fallback',
      configureServer(server) {
        import('vite').then(({ loadEnv }) => {
          Object.assign(process.env, loadEnv('', process.cwd(), ''));
        });
        
        server.middlewares.use('/api', async (req, res, next) => {
          (res as any).status = (code: number) => { res.statusCode = code; return res; };
          (res as any).json = (data: any) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };

          try {
            if (req.url === '/workouts') {
              const { default: handler } = await server.ssrLoadModule('/api/workouts.ts');
              return handler(req as any, res as any);
            }
          } catch (err) {
            console.error('API Error:', err);
            return (res as any).status(500).json({ error: 'Internal Server Error' });
          }
          next();
        });
      }
    }
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
})
