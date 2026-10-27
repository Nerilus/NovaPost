import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920'],
    defaultViewport: { width: 1440, height: 920 },
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Send Request & Capture Response
  console.log('Sending request...');
  const sendBtn = await page.waitForSelector('.url-bar-container .btn-primary');
  await sendBtn.click();
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.resolve('../docs/screenshots/01-request-response.png') });
  console.log('Saved 01-request-response.png');

  // 2. Open Code Snippet Modal
  console.log('Opening Code Snippet modal...');
  const codeBtn = await page.waitForSelector('button[title*="Code"]');
  await codeBtn.click();
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.resolve('../docs/screenshots/02-code-generator.png') });
  console.log('Saved 02-code-generator.png');

  // Close modal
  const closeBtn = await page.waitForSelector('.modal-header .btn-ghost');
  await closeBtn.click();
  await new Promise(r => setTimeout(r, 500));

  // 3. Open Collection Runner Modal & Run
  console.log('Opening Collection Runner...');
  const runnerBtn = await page.waitForSelector('button[title*="Runner"]');
  await runnerBtn.click();
  await new Promise(r => setTimeout(r, 800));
  const runColBtn = await page.waitForSelector('.modal-body .btn-primary');
  await runColBtn.click();
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.resolve('../docs/screenshots/03-collection-runner.png') });
  console.log('Saved 03-collection-runner.png');

  // Close modal
  const closeRunnerBtn = await page.waitForSelector('.modal-footer .btn-secondary');
  await closeRunnerBtn.click();
  await new Promise(r => setTimeout(r, 500));

  // 4. Toggle Light Theme
  console.log('Toggling theme...');
  const themeBtn = await page.waitForSelector('button[title*="Theme"]');
  await themeBtn.click();
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.resolve('../docs/screenshots/04-light-theme.png') });
  console.log('Saved 04-light-theme.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
