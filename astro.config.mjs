import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/enquire') })],
  site: 'https://www.carltonridgevilla.com'
});
