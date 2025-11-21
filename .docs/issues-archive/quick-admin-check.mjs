import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const pages = [
  { name: 'Dashboard', url: BASE_URL + '/admin' },
  { name: 'Users', url: BASE_URL + '/admin/users' },
  { name: 'Products', url: BASE_URL + '/admin/products' },
  { name: 'Orders', url: BASE_URL + '/admin/orders' },
  { name: 'Analytics', url: BASE_URL + '/admin/analytics' }
];

async function quickCheck() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  console.log('\n=== QUICK ADMIN PAGE CHECK ===\n');
  
  for (const pageInfo of pages) {
    console.log('Testing: ' + pageInfo.name);
    
    try {
      const response = await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 20000 });
      const status = response.status();
      const finalUrl = page.url();
      
      console.log('  HTTP: ' + status);
      console.log('  URL: ' + finalUrl);
      
      if (finalUrl.includes('/auth/login')) {
        console.log('  Result: REDIRECTED TO LOGIN (auth required)');
      } else {
        await page.waitForTimeout(2000);
        const bodyText = await page.textContent('body');
        
        if (bodyText.includes('500') && bodyText.includes('Server Error')) {
          console.log('  Result: 500 ERROR PAGE');
        } else if (/\b(admin\.|account\.|common\.)[a-zA-Z0-9_.]+\b/.test(bodyText)) {
          const regex = /\b(admin\.|account\.|common\.)[a-zA-Z0-9_.]+\b/g;
          const matches = bodyText.match(regex);
          const uniqueMatches = Array.from(new Set(matches));
          console.log('  Result: TRANSLATION KEYS VISIBLE');
          console.log('  Keys: ' + uniqueMatches.slice(0, 5).join(', '));
        } else {
          console.log('  Result: LOADED OK');
        }
      }
    } catch (error) {
      console.log('  Result: ERROR - ' + error.message);
    }
    
    console.log('');
  }
  
  await browser.close();
}

quickCheck().catch(console.error);
