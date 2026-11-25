import { test, expect } from '@playwright/test';

test('rendered design tokens and signature treatments remain present', async ({ page }) => {
  await page.goto('/');
  const values = await page.evaluate(() => {
    const css = selector => getComputedStyle(document.querySelector(selector));
    return {
      canvas: css('body').backgroundColor,
      navBlur: css('nav').backdropFilter,
      cardSurface: css('.card').backgroundColor,
      cardBorder: css('.card').borderTopColor,
      cardRadius: css('.card').borderTopLeftRadius,
      cardPadding: css('.card').paddingTop,
      primaryAccent: css('.btn-primary').backgroundColor,
      primaryGlow: css('.btn-primary').boxShadow,
      tooltipSurface: css('.tip-inner').backgroundColor,
      tooltipRadius: css('.tip-inner').borderTopLeftRadius,
      modalBlur: css('#book-overlay').backdropFilter,
      bodyFont: css('body').fontFamily,
    };
  });
  expect(values.canvas).toBe('rgb(8, 8, 8)');
  expect(values.navBlur).toContain('12px');
  expect(values.cardSurface).toBe('rgb(17, 17, 17)');
  expect(values.cardBorder).toBe('rgb(36, 36, 36)');
  expect(values.cardRadius).toBe('8px');
  expect(values.cardPadding).toBe('30px');
  expect(values.primaryAccent).toBe('rgb(57, 255, 20)');
  expect(values.primaryGlow).toContain('57, 255, 20');
  expect(values.tooltipSurface).toBe('rgb(25, 25, 25)');
  expect(values.tooltipRadius).toBe('8px');
  expect(values.modalBlur).toContain('6px');
  expect(values.bodyFont).toContain('DM Sans');
});

test('404 keeps its red/green chromatic split and recovery action', async ({ page }) => {
  await page.goto('/404.html');
  const effects = await page.locator('.glitch').evaluate(el => ({
    before: getComputedStyle(el, '::before').color,
    after: getComputedStyle(el, '::after').color,
    beforeBlend: getComputedStyle(el, '::before').mixBlendMode,
    afterBlend: getComputedStyle(el, '::after').mixBlendMode,
  }));
  expect(effects.before).toBe('rgb(57, 255, 20)');
  expect(effects.after).toBe('rgb(255, 85, 85)');
  expect(effects.beforeBlend).toBe('screen');
  expect(effects.afterBlend).toBe('screen');
  await expect(page.getByRole('link', { name: 'Return to Base' })).toBeVisible();
});
