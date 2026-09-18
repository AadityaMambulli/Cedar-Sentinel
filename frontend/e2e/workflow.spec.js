import { test, expect } from '@playwright/test';

const browserErrors = new WeakMap();

test.beforeEach(async ({ page }) => {
  const errors = [];
  browserErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
});

async function expectOverview(page) {
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
  await expect(page.locator('.app-topbar').getByText('SIMULATION MODE', { exact: true })).toBeVisible();
  await expect(page.locator('.workspace-label')).toHaveText('Demo workspaceLOCAL · SAMPLE DATA');
  await expect(page.locator('.metrics article strong')).toHaveText(['0', '0%', 'No events yet']);
  await expect(page.getByText('A safe place to explore.')).toBeVisible();
  await expect(page.getByText('THE ACTIVE DEMO BOUNDARY')).toBeVisible();
  await expect(page.getByRole('link', { name: /New request/ })).toHaveAttribute('href', '#/app/commands');
  await expect(page.getByRole('link', { name: /View audit log/ })).toHaveAttribute('href', '#/app/audit');
  await expect(page.getByText('No decisions. Yet.')).toBeVisible();
  await expect(page.locator('[data-event-id], .console-event')).toHaveCount(0);
}

async function expectCommands(page) {
  await expect(page.getByRole('heading', { name: 'Command center' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Task description' })).toBeVisible();
  await expect(page.getByLabel('Amount (USD)')).toHaveValue('49.99');
  await expect(page.getByLabel('Agent principal')).toHaveValue('refund-bot');
  for (const name of ['Allowed refund', 'Over the limit']) {
    await expect(page.getByRole('button', { name: new RegExp(name) })).toBeEnabled();
  }
  await expect(page.getByRole('button', { name: /Run simulation/ })).toBeEnabled();
  await expect(page.getByText('Demo policy')).toBeVisible();
  await expect(page.getByText('Every action starts', { exact: false })).toBeVisible();
  await expect(page.locator('.result-card')).toHaveCount(0);
}

async function expectEmptyAudit(page) {
  await expect(page.getByRole('heading', { name: 'Audit log' })).toBeVisible();
  await expect(page.getByText('Your audit trail starts here.')).toBeVisible();
  await expect(page.getByText('0 of 0 events')).toBeVisible();
  await expect(page.getByRole('link', { name: /Try a request/ })).toHaveAttribute('href', '#/app/commands');
  await expect(page.locator('tbody tr')).toHaveCount(0);
}

test('landing → overview → command center → empty audit', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Open console' }).first()).toBeVisible();
  await page.getByRole('link', { name: 'See it in action' }).click();
  await expectOverview(page);
  await page.getByRole('link', { name: /New request/ }).click();
  await expectCommands(page);
  await page.getByRole('link', { name: 'Audit log', exact: true }).click();
  await expectEmptyAudit(page);
  for (const label of ['Search actions, agents, resources', 'Decision filter', 'Agent filter']) {
    await expect(page.getByLabel(label)).toBeVisible();
    await expect(page.getByLabel(label)).toBeEnabled();
  }
  await expect(page.getByLabel('Decision filter').locator('option')).toHaveText(['All', 'Allow', 'Deny']);
  for (const decision of ['Allow', 'Deny']) {
    await page.getByLabel('Decision filter').selectOption(decision);
    await expect(page.getByLabel('Decision filter')).toHaveValue(decision);
    await expectEmptyAudit(page);
  }
  await page.getByLabel('Agent filter').selectOption('refund-bot');
  await expectEmptyAudit(page);
  await page.getByLabel('Search actions, agents, resources').fill('no-match');
  await expect(page.getByLabel('Search actions, agents, resources')).toHaveValue('no-match');
  await expectEmptyAudit(page);
  await page.getByRole('link', { name: 'Overview', exact: true }).click();
  await expectOverview(page);
  await page.getByRole('link', { name: /View audit log/ }).click();
  await expectEmptyAudit(page);
  await page.getByRole('link', { name: 'Back to website' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Let agents move');
});

test('storage is never read or written and no requests are made', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); });
  await page.addInitScript(() => {
    const calls = [];
    const getItem = Storage.prototype.getItem;
    window.storageMonitor = {
      calls,
      snapshot: () => Object.fromEntries(Object.keys(localStorage).map(key => [key, getItem.call(localStorage, key)])),
    };
    for (const method of ['getItem', 'setItem', 'removeItem', 'clear', 'key']) {
      const original = Storage.prototype[method];
      Storage.prototype[method] = function (...args) {
        calls.push(method);
        return original.apply(this, args);
      };
    }
  });
  const requests = [];
  page.on('request', request => { if (['fetch', 'xhr'].includes(request.resourceType())) requests.push(request.url()); });
  await page.reload();
  await page.getByRole('link', { name: 'See it in action' }).click();
  await expectOverview(page);
  await page.reload();
  await expectOverview(page);
  await page.getByRole('link', { name: /New request/ }).click();
  await expectCommands(page);
  await page.getByRole('button', { name: /Run simulation/ }).click();
  await expect(page.getByText('Every action starts', { exact: false })).toBeVisible();
  await page.getByRole('link', { name: 'Audit log', exact: true }).click();
  await expectEmptyAudit(page);
  const state = await page.evaluate(() => ({ calls: window.storageMonitor.calls, storage: window.storageMonitor.snapshot() }));
  expect(state.calls).toEqual([]);
  expect(state.storage).toEqual({});
  expect(requests).toEqual([]);
  await page.getByRole('link', { name: 'Overview', exact: true }).click();
  await expectOverview(page);
});

test('process animation continues after click and keyboard selection', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const player = page.locator('.flow-player');
  const first = page.getByRole('button', { name: 'Agent proposes', exact: true });
  const second = page.getByRole('button', { name: 'Policy decides', exact: true });
  await expect(player).toHaveAttribute('data-playing', 'false');
  await player.scrollIntoViewIfNeeded();
  await expect(player).toHaveAttribute('data-playing', 'true');
  await expect(second).toHaveAttribute('aria-expanded', 'true', { timeout: 8000 });
  await expect(player.locator('.flow-controls')).toHaveCount(0);
  await second.focus();
  await expect(player).toHaveAttribute('data-playing', 'true');
  await expect(player.locator('.is-active .flow-progress')).toHaveCSS('animation-play-state', 'running');
  await first.focus();
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('aria-expanded', 'true');
  await expect(second).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('region', { name: 'Agent proposes', exact: true })).toBeVisible();
  await expect(page.locator('#flow-description-1')).toBeHidden();
  await page.getByRole('button', { name: 'The trail stays visible', exact: true }).click();
  await expect(page.getByRole('button', { name: 'The trail stays visible', exact: true })).toHaveAttribute('aria-expanded', 'true');
  await expect(player).toHaveAttribute('data-playing', 'true');
  await expect(first).toHaveAttribute('aria-expanded', 'true', { timeout: 8000 });
  await first.click();
  await expect(second).toHaveAttribute('aria-expanded', 'true', { timeout: 8000 });
});

for (const width of [320, 390, 1440]) {
  test(`process accordion supports reduced motion at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const player = page.locator('.flow-player');
    await player.scrollIntoViewIfNeeded();
    await expect(player).toHaveAttribute('data-playing', 'false');
    await expect(player.locator('.flow-controls')).toHaveCount(0);
    for (const button of await player.locator('h3 button').all()) {
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      await expect(player.getByRole('region')).toHaveCount(1);
      await expect(player.locator('.is-active .flow-progress')).toHaveCSS('animation-name', 'none');
      expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}

for (const width of [320, 390, 650, 768, 1024]) {
  test(`responsive pages and navigation at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    const fitsViewport = async () => {
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    };
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await fitsViewport();
    if (width === 390) await testInfo.attach('mobile-landing', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    if (width <= 760) {
      const toggle = page.getByRole('button', { name: 'Open menu' });
      await expect(toggle).toHaveAttribute('aria-controls', 'site-menu');
      await toggle.click();
      const navigation = page.getByRole('navigation', { name: 'Main navigation' });
      await expect(navigation).toBeVisible();
      await navigation.getByRole('link', { name: 'Platform', exact: true }).click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await toggle.click();
      await navigation.getByRole('link', { name: 'Open console' }).click();
    } else {
      await page.getByRole('link', { name: 'See it in action' }).click();
    }
    await expectOverview(page);
    await fitsViewport();
    if (width <= 650) {
      await expect(page.locator('.workspace-label')).toBeHidden();
      for (const link of await page.getByRole('navigation', { name: 'Console navigation' }).getByRole('link').all()) {
        const box = await link.boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
    }
    if (width === 390) await testInfo.attach('mobile-dashboard', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    await page.getByRole('link', { name: /New request/ }).click();
    await expectCommands(page);
    await fitsViewport();
    if (width <= 760) expect(await page.getByLabel('Task description').evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
    if (width === 390) await testInfo.attach('mobile-command', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    await page.getByRole('link', { name: 'Audit log', exact: true }).click();
    await expectEmptyAudit(page);
    await fitsViewport();
    for (const label of ['Search actions, agents, resources', 'Decision filter', 'Agent filter']) {
      await expect(page.getByLabel(label)).toBeVisible();
      await expect(page.getByLabel(label)).toBeEnabled();
    }
    await page.getByLabel('Agent filter').selectOption('refund-bot');
    await fitsViewport();
    for (const decision of ['Allow', 'Deny']) {
      await page.getByLabel('Decision filter').selectOption(decision);
      await expect(page.getByLabel('Decision filter')).toHaveValue(decision);
      await expectEmptyAudit(page);
    }
    await page.getByLabel('Search actions, agents, resources').fill('no-match');
    await expectEmptyAudit(page);
    await fitsViewport();
    if (width === 390) await testInfo.attach('mobile-audit-empty', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    await page.getByRole('link', { name: 'Overview', exact: true }).click();
    await expectOverview(page);
    await fitsViewport();
    await page.locator('.sidebar').getByRole('link', { name: 'Cedar Sentinel home' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Let agents move');
    await fitsViewport();
  });
}
