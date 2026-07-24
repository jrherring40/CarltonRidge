import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  site: 'https://github.io/jrherring40/CarltonRidge',
  base: '/CarltonRidge'
});
