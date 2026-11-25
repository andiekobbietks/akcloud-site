import { test, expect } from '@playwright/test';

test('homepage renders core sections, branding, assets and navigation', async ({ page }) => {
  const failed = [];
  page.on('pageerror', error => failed.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/AKTOps/);
  await expect(page.locator('#hero')).toContainText('AKTOps');
  for (const id of ['top', 'about', 'credits', 'perks', 'stories']) {
    await expect(page.locator('#' + id)).toBeAttached();
  }
  await expect(page.locator('nav')).toBeVisible();
  await expect(page.locator('footer')).toBeAttached();
  await page.waitForFunction(() => [...document.images].every(image => image.complete));
  await page.waitForTimeout(1400);
  await expect(page.locator('#spx')).toHaveCSS('display', 'none');
  const broken = await page.locator('img').evaluateAll(images => images.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src));
  expect(broken, 'all referenced image assets should load').toEqual([]);
  expect(failed, 'homepage should not throw uncaught JavaScript errors').toEqual([]);
});

test('every primary navigation anchor resolves to a real section', async ({ page }) => {
  await page.goto('/');
  const anchors = await page.locator('nav a[href^="#"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
  expect(anchors.length).toBeGreaterThan(0);
  for (const href of anchors) await expect(page.locator(href)).toHaveCount(1);
});

test('booking modal opens, focuses first field, closes with Escape and backdrop', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Book a Consultation' }).first().click();
  const dialog = page.getByRole('dialog', { name: /Tell us what you are building/i });
  await expect(dialog).toBeVisible();
  await expect(page.locator('#lead-name')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await page.getByRole('button', { name: 'Book a Consultation' }).first().click();
  await page.locator('#book-overlay').click({ position: { x: 5, y: 5 } });
  await expect(dialog).toBeHidden();
});

test('onboarding validates required fields and reports successful submission', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Book a Consultation' }).first().click();
  let postCount = 0;
  page.on('request', request => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/') postCount += 1;
  });
  const submit = page.getByRole('button', { name: 'Send onboarding request' });
  await submit.click();
  await expect(page.locator('#lead-name')).toBeFocused();
  expect(await page.locator('#lead-name').evaluate(el => el.validity.valueMissing)).toBeTruthy();
  expect(postCount, 'invalid form must not submit a POST').toBe(0);

  await page.locator('#lead-name').fill('Visual QA');
  await page.locator('#book-email').fill('qa@example.test');
  await page.locator('#lead-need').selectOption({ label: 'IT support and operations' });
  await submit.click();
  await expect(page.locator('#book-notify-msg')).toContainText('Your request has been submitted');
  await expect(page.locator('#book-form')).toBeHidden();
});

test('glossary supports hover and click-to-pin interactions', async ({ page }, testInfo) => {
  const isMobile = testInfo.project.name.includes('mobile');
  await page.goto('/');
  const term = page.locator('.term[data-term="sovereign"]').first();
  if (!isMobile) {
    await term.hover();
    await expect(page.locator('#tip-box')).toBeVisible();
    await expect(page.locator('#tip-title')).toHaveText('Sovereign cloud');
    await term.click();
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await expect(page.locator('#tip-box')).toBeHidden();
  } else {
    await term.click();
    await expect(page.locator('#tip-box')).toBeVisible();
    await expect(page.locator('#tip-title')).toHaveText('Sovereign cloud');
  }
});

test('Decap CMS fallback is readable when the external editor is unavailable', async ({ page }) => {
  await page.route('https://unpkg.com/**', route => route.abort());
  await page.goto('/admin/');
  await expect(page.getByRole('heading', { name: 'AKTOps content studio' })).toBeVisible();
  await expect(page.locator('a[href*="decap-cms.md"]')).toBeVisible();
});

test('404 route returns a real 404 page with recovery action', async ({ page }) => {
  const response = await page.goto('/route-that-does-not-exist-for-visual-qa');
  expect(response.status()).toBe(404);
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to Base' })).toHaveAttribute('href', '/');
});

test('reduced-motion preference removes animation and transition effects', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('#spx')).toHaveCSS('display', 'none');
  const duration = await page.locator('.card').first().evaluate(el => getComputedStyle(el).transitionDuration);
  expect(duration.split(',').every(value => Number.parseFloat(value) === 0)).toBeTruthy();
  await context.close();
});

test('layout has no horizontal overflow at common viewport widths', async ({ page }) => {
  for (const width of [320, 360, 375, 390, 430, 600, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(100);
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(dimensions.content, 'horizontal overflow at ' + width + 'px').toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});
