import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname in ES Modules context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://habeshatracker.com';

interface SitemapRoute {
  path: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  lastmod?: string;
}

// All crawleable public routes for Habesha Tracker
const routes: SitemapRoute[] = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/login', changefreq: 'monthly', priority: '0.8' },
  { path: '/signup', changefreq: 'monthly', priority: '0.9' },
  { path: '/reset-password', changefreq: 'monthly', priority: '0.5' },
];

function generateSitemap() {
  const currentDate = new Date().toISOString().split('T')[0];
  
  console.log('🌐 Generating dynamic XML sitemap...');
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
  xml += `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n`;
  xml += `        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;

  for (const route of routes) {
    const lastMod = route.lastmod || currentDate;
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${route.path}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  // Target directory to write to
  const publicDir = path.resolve(__dirname, '../public');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf8');
  
  console.log(`✅ Dynamic sitemap written successfully to: ${sitemapPath}`);
}

try {
  generateSitemap();
} catch (error) {
  console.error('❌ Error generating dynamic sitemap:', error);
}
