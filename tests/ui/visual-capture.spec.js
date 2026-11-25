import { test, expect } from '@playwright/test';

test('capture AKTOps visual states for review and regression evidence', async ({ page }, testInfo) => {
  const capture = async (name, fullPage = false) => {
    const path = testInfo.outputPath(name + '.png');
    await page.screenshot({ path, fullPage, animations: 'disabled' });
    await testInfo.attach(name, { path, contentType: 'image/png' });
  };

  await page.goto('/');
  await capture('00-splash-intro');
  await page.waitForTimeout(1400);
  await capture('01-home-desktop-full', true);
  await capture('02-home-desktop-viewport');
  if (!testInfo.project.name.includes('mobile')) {
    await page.getByRole('button', { name: 'Book a Consultation' }).first().hover();
    await capture('03-primary-button-hover');
    await page.locator('.card').first().hover();
    await page.waitForTimeout(650);
    await capture('04-service-card-hover');
    await page.locator('.perk-card').first().hover();
    await capture('05-perk-card-hover');
  }
  await page.locator('.term[data-term="sovereign"]').first().hover();
  await expect(page.locator('#tip-box')).toBeVisible();
  await capture('06-glossary-tooltip');
  await page.getByRole('button', { name: 'Book a Consultation' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await capture('07-onboarding-modal');
  await page.getByRole('button', { name: 'Close onboarding request' }).click();
  await page.goto('/admin/');
  await capture('08-decap-admin-fallback', true);
  await page.goto('/missing-visual-capture-route');
  await capture('09-not-found-404', true);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForTimeout(1400);
  await capture('10-home-mobile-390', true);
  await page.getByRole('button', { name: 'Book a Consultation' }).first().click();
  await capture('11-onboarding-mobile', true);
});
