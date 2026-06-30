import { test, expect, type Page } from '@playwright/test';

const BASE_URL = (process.env.BASE_URL || '').replace(/\/$/, '');
const SITE_STAGE = (process.env.SITE_STAGE || 'draft').toLowerCase();

const DOMAIN = (() => {
  try {
    return new URL(BASE_URL).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
})();

const PAGES = ['/', '/contact', '/terms-and-conditions', '/privacy-policy', '/refund-policy', '/delivery-policy'];

const ALLOWED_EXTERNAL = [
  'google.com',
  'gstatic.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'youtube.com',
  'linkedin.com',
  'stripe.com',
  'paypal.com',
  'cloudflare.com',
  'jsdelivr.net',
];

const FORBIDDEN_WORDS = [
  /\bcontest\b/i,
  /\bwinner\b/i,
  /\bparticipate\b/i,
  /\bprize\b/i,
  /\btournament\b/i,
  /\bplayer group\b/i,
];

const WRONG_COPY = [
  /\bwallet\b/i,
  /\bcredits?\b/i,
  /\bredeem\b/i,
  /pre-levellegaming/i,
];

async function getText(page: Page, path: string): Promise<string | null> {
  const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
  if (!response || response.status() >= 400) return null;
  return await page.locator('body').innerText();
}

function extractDomains(text: string): string[] {
  const matches = text.match(/\b([a-z0-9-]+\.[a-z]{2,})\b/gi) || [];
  return [...new Set(matches.map((domain) => domain.toLowerCase()))];
}

function isAllowed(domain: string): boolean {
  return ALLOWED_EXTERNAL.some((allowed) => domain === allowed || domain.endsWith(`.${allowed}`));
}

test.describe('Ground Rules QA', () => {
  test.beforeAll(() => {
    expect(BASE_URL, 'Set BASE_URL before running this spec').not.toBe('');
  });

  test('No external wrong references', async ({ page }) => {
    for (const path of PAGES) {
      const text = await getText(page, path);
      if (!text) continue;

      const domains = extractDomains(text);
      const bad = domains.filter((domain) => DOMAIN && domain !== DOMAIN && !isAllowed(domain));

      expect(bad, `Wrong domain on ${path}`).toEqual([]);
    }
  });

  test('No forbidden wording', async ({ page }) => {
    for (const path of PAGES) {
      const text = await getText(page, path);
      if (!text) continue;

      for (const rule of FORBIDDEN_WORDS) {
        expect(text, `${rule} on ${path}`).not.toMatch(rule);
      }
    }
  });

  test('No wrong business wording', async ({ page }) => {
    for (const path of PAGES) {
      const text = await getText(page, path);
      if (!text) continue;

      for (const rule of WRONG_COPY) {
        expect(text, `${rule} on ${path}`).not.toMatch(rule);
      }
    }
  });

  test('Disclaimer exists', async ({ page }) => {
    const text = await getText(page, '/');
    expect(text).toMatch(/purchased points/i);
  });

  test('Footer format', async ({ page }) => {
    const text = await getText(page, '/');
    expect(text).toMatch(/(?:\u00A9|&copy;|\(c\))\s*2026.*All Rights Reserved\./i);
  });

  test('No placeholders in live', async ({ page }) => {
    if (SITE_STAGE !== 'live') return;

    for (const path of PAGES) {
      const text = await getText(page, path);
      if (!text) continue;

      expect(text, `Placeholder text found on ${path}`).not.toMatch(/\[Company Name\]|\[Address\]/i);
    }
  });
});
