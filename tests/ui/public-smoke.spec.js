import { test, expect } from '@playwright/test';

test('deployed homepage, security headers, assets and booking flow', async ({ page, request }, testInfo) => {
  const base = process.env.BASE_URL || 'https://akcloud.netlify.app';
  const response = await request.get(base + '/');
  expect(response.ok()).toBeTruthy();
  const headers = response.headers();
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBeTruthy();

  const jsErrors = [];
  page.on('pageerror', error => jsErrors.push(error.message));
  const configResponse = page.waitForResponse(response => response.url().includes('/api/get-config'));
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  const config = await (await configResponse).json();
  await expect(page).toHaveTitle(/AKTOps/);
  await expect(page.locator('#hero')).toContainText('AKTOps');
  await page.screenshot({ path: testInfo.outputPath('public-homepage.png'), fullPage: true });
  await page.getByRole('button', { name: 'Book a Consultation' }).first().click();
  if (typeof config.booking_url === 'string' && config.booking_url.length > 0) {
    await expect(page).toHaveURL(config.booking_url);
  } else {
    await expect(page.getByRole('dialog')).toBeVisible();
  }
  await page.screenshot({ path: testInfo.outputPath('public-onboarding.png'), fullPage: true });
  expect(jsErrors).toEqual([]);

  const notFound = await request.get(base + '/aktops-visual-smoke-404');
  expect(notFound.status()).toBe(404);
});
