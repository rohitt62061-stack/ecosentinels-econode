import { chromium } from '@playwright/test';

const consoleErrors = [];
const pageErrors = [];
const networkFailures = [];

async function inspectApp() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  page.on('requestfailed', request => {
    networkFailures.push(`${request.url()} - ${request.failure()?.errorText}`);
  });

  console.log('Navigating to http://localhost:5173...');
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded successfully\n');
    
    await page.waitForTimeout(2000);
    
    const title = await page.title();
    console.log(`Page Title: ${title}`);
    
    const bodyContent = await page.evaluate(() => document.body.innerHTML.length);
    console.log(`Body content length: ${bodyContent} characters`);
    
    const visibleElements = await page.evaluate(() => {
      const all = document.querySelectorAll('*');
      let visible = 0;
      let hidden = 0;
      all.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          visible++;
        } else {
          hidden++;
        }
      });
      return { visible, hidden };
    });
    console.log(`Visible elements: ${visibleElements.visible}, Hidden: ${visibleElements.hidden}`);
    
    const route = await page.evaluate(() => window.location.pathname);
    console.log(`Current route: ${route}\n`);
    
    console.log('Taking screenshot of main page...');
    await page.screenshot({ path: 'inspect_main.png', fullPage: true });
    
  } catch (error) {
    console.error('Navigation error:', error.message);
  }

  console.log('--- Console Errors ---');
  if (consoleErrors.length === 0) {
    console.log('No console errors detected');
  } else {
    consoleErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
  }

  console.log('\n--- Page Errors (JS Exceptions) ---');
  if (pageErrors.length === 0) {
    console.log('No page errors detected');
  } else {
    pageErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
  }

  console.log('\n--- Network Failures ---');
  if (networkFailures.length === 0) {
    console.log('No network failures detected');
  } else {
    networkFailures.forEach((fail, i) => console.log(`${i + 1}. ${fail}`));
  }

  await browser.close();
  console.log('\nInspection complete. Screenshot saved as inspect_main.png');
}

inspectApp().catch(console.error);
