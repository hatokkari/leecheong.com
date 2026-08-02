import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.leecheong.com',  // apex 는 www 로 308 리다이렉트됨
  integrations: [
    // 관리자 페이지는 검색엔진에 올릴 이유가 없다.
    sitemap({ filter: (page) => !page.includes('/admin') }),
  ],
});
