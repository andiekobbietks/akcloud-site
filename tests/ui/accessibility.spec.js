import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('audit homepage and key interactive states with axe-core', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.waitForTimeout(1200);
  const home = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  await testInfo.attach('axe-homepage.json', { body: JSON.stringify(home, null, 2), contentType: 'application/json' });
  const criticalHome = home.violations.filter(item => item.impact === 'critical');
  expect(criticalHome, 'critical accessibility issues on homepage').toEqual([]);

  await page.getByRole('button', { name: 'Book a Consultation' }).first().click();
  const modal = await new AxeBuilder({ page }).include('#book-overlay').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  await testInfo.attach('axe-onboarding-modal.json', { body: JSON.stringify(modal, null, 2), contentType: 'application/json' });
  const criticalModal = modal.violations.filter(item => item.impact === 'critical');
  expect(criticalModal, 'critical accessibility issues in onboarding modal').toEqual([]);
});
