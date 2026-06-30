import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

/**
 * FULL Ground Rules QA Script - Gaming Points Websites
 *
 * Save as:
 *   C:\Users\honey\tests\ground-rules.spec.ts
 *
 * Run:
 *   cd "C:\Users\honey"
 *   $env:BASE_URL="https://www.vanguardelohub.com"
 *   $env:SITE_STAGE="draft"
 *   npx playwright test tests/ground-rules.spec.ts
 *
 * Optional:
 *   $env:EXPECTED_BRAND="VanguardEloHub"
 *   $env:EXPECTED_DOMAIN="vanguardelohub.com"
 *
 * SITE_STAGE:
 *   draft = allows client placeholders like [Company Address]
 *   live  = fails placeholders/company missing details
 */

const BASE_URL = (process.env.BASE_URL || '').replace(/\/$/, '');
const SITE_STAGE = (process.env.SITE_STAGE || 'draft').toLowerCase();
const EXPECTED_BRAND = process.env.EXPECTED_BRAND || '';
const EXPECTED_DOMAIN = process.env.EXPECTED_DOMAIN || '';

/**
 * WEBSITE_TYPE options:
 *   gaming-points      = gaming boosting website using Points (default)
 *   non-gaming-points  = non-gaming website using Points, e.g. courses/services points site
 *   standard           = normal website without points/cart business rules
 */
const WEBSITE_TYPE = (process.env.WEBSITE_TYPE || 'gaming-points').toLowerCase();
const IS_GAMING_SITE = WEBSITE_TYPE.includes('gaming');
const IS_POINTS_SITE = WEBSITE_TYPE.includes('points');
const RUN_ACCOUNT_FLOW = (process.env.RUN_ACCOUNT_FLOW || 'false').toLowerCase() === 'true';

const currentDomain = (() => {
  try {
    return (EXPECTED_DOMAIN || new URL(BASE_URL).hostname).replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
})();

const pages = {
  home: '/',
  games: '/games',
  products: '/products',
  services: '/services',
  courses: '/courses',
  cart: '/cart',
  checkout: '/checkout',
  contact: '/contact',
  register: '/register',
  login: '/login',
  forgotPassword: '/forgot-password',
  accountOrders: '/my-account/orders',
  terms: '/terms-and-conditions',
  refund: '/refund-policy',
  delivery: '/delivery-policy',
  privacy: '/privacy-policy',
  sitemap: '/sitemap.xml',
};

const publicPagesThatShouldNotBeVisible = [
  '/test-email',
  '/cache-clear',
  '/storage-link',
  '/images',
];

const commonPages = [
  pages.home,
  pages.games,
  pages.products,
  pages.services,
  pages.courses,
  pages.cart,
  pages.checkout,
  pages.contact,
  pages.register,
  pages.login,
  pages.forgotPassword,
  pages.accountOrders,
  pages.terms,
  pages.refund,
  pages.delivery,
  pages.privacy,
];

const policyPages = [
  pages.terms,
  pages.refund,
  pages.delivery,
  pages.privacy,
];

const forbiddenWords = [
  /\besports?\b/i,
  /\besports?\s+tournaments?\b/i,
  /\btournaments?\b/i,
  /\bfarming\b/i,
  /\bfarm\b/i,
  /\bgame\s+development\b/i,
  /\bgame\s+creation\b/i,
  /\bcontest\b/i,
  /\bcontests\b/i,
  /\bparticipate\b/i,
  /\bparticipating\b/i,
  /\bwinner\b/i,
  /\bwinners\b/i,
  /\bwin\s+prizes?\b/i,
  /\bprize\s+pool\b/i,
  /\bonline\s+player\s+group\b/i,
  /\bplayer\s+group\b/i,
  /\bcommunity\s+tournament\b/i,
];

const wrongBusinessCopy = [
  /You have no order yet!! Please order some products/i,
  /Browse Marketplace/i,
  /\bmarketplace\b/i,
  /pre-levellegaming/i,
  /\bwallet\b/i,
  /\bcredits?\b/i,
  /\bredeem\b/i,
];

const internalDevCopy = [
  /\bbrowsing experience\b/i,
  /\bproduct flow\b/i,
  /\broutes?\b.*\bunchanged\b/i,
  /\bkeeping your existing\b/i,
  /\bcatalog,?\s*routes?\b/i,
  /\bpremium browsing\b/i,
  /\bUI\s*\/?\s*UX\b/,
  /\bfront[\s-]?end\b/i,
  /\bback[\s-]?end\b/i,
  /\bAPI\s+endpoint\b/i,
  /\bcode\s*base\b/i,
  /\brepository\b/i,
  /\bdeployment\b/i,
  /\bmigration\b/i,
  /\brefactor\b/i,
  /\bpush(?:ed)?\s+to\s+(?:production|staging|live)\b/i,
  /\bmerge\s+(?:request|conflict)\b/i,
  /\bpull\s+request\b/i,
  /\bsprint\b/i,
  /\btech\s*stack\b/i,
  /\bLaravel\b/,
  /\bReact\b/,
  /\bVue\.?js\b/i,
  /\bNode\.?js\b/i,
  /\bframework\b/i,
];

const requiredNewsletterTexts = [
  /Subscribe to our newsletter/i,
  /Subscribe for more updates/i,
];

const captchaSelector =
  '.g-recaptcha, [data-sitekey], iframe[src*="recaptcha"], iframe[src*="hcaptcha"], input[name*="captcha"], textarea[name*="g-recaptcha-response"], textarea[name*="h-captcha-response"]';

const logoSelector =
  'img[alt*="logo" i], img[src*="logo" i], .logo img, .navbar-brand img, header img';

async function goto(page: Page, path: string) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
}

async function getStatus(request: APIRequestContext, path: string) {
  const response = await request.get(`${BASE_URL}${path}`, {
    maxRedirects: 0,
    failOnStatusCode: false,
  });

  return response.status();
}

async function pageExists(page: Page, path: string) {
  const response = await page.goto(`${BASE_URL}${path}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  }).catch(() => null);

  return !!response && response.status() < 400;
}

async function bodyText(page: Page) {
  return await page.locator('body').innerText({ timeout: 30000 });
}

function skipIfNotGaming() {
  if (!IS_GAMING_SITE) {
    test.skip(true, `Skipped because WEBSITE_TYPE=${WEBSITE_TYPE}. Gaming-specific checks are not applicable.`);
  }
}

function skipIfNotPoints() {
  if (!IS_POINTS_SITE) {
    test.skip(true, `Skipped because WEBSITE_TYPE=${WEBSITE_TYPE}. Points-specific checks are not applicable.`);
  }
}

async function existingPaths(page: Page, paths: string[]) {
  const existing: string[] = [];
  for (const path of paths) {
    if (await pageExists(page, path)) existing.push(path);
  }
  return existing;
}

async function visibleTextForPages(page: Page, paths: string[]) {
  const result: { path: string; text: string }[] = [];

  for (const path of paths) {
    const exists = await pageExists(page, path);
    if (!exists) continue;

    result.push({ path, text: await bodyText(page) });
  }

  return result;
}

function extractDomainsFromText(text: string) {
  const urls = [...text.matchAll(/\b(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+\.[a-z]{2,})(?:\/[^\s]*)?/gi)]
    .map((m) => m[1].replace(/^www\./, '').toLowerCase());

  const emails = [...text.matchAll(/[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})/gi)]
    .map((m) => m[1].replace(/^www\./, '').toLowerCase());

  return [...new Set([...urls, ...emails])];
}

function isAllowedExternalDomain(domain: string) {
  const allowedExternal = [
    'google.com',
    'googleapis.com',
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
    'cloudfront.net',
    'bootstrapcdn.com',
    'jsdelivr.net',
    'jquery.com',
    'w3.org',
    'schema.org',
  ];

  return allowedExternal.some((allowed) => domain === allowed || domain.endsWith(`.${allowed}`));
}

test.describe('Security and public-route rules', () => {
  for (const path of publicPagesThatShouldNotBeVisible) {
    test(`${path} should not be publicly visible`, async ({ request }) => {
      const status = await getStatus(request, path);

      expect(
        [301, 302, 401, 403, 404, 410],
        `${path} returned ${status}. It should not be publicly visible and should not crash.`
      ).toContain(status);
    });
  }

  test('debug mode should not be visible on public site', async ({ page }) => {
    await goto(page, pages.home);
    const text = await bodyText(page);

    expect(text).not.toMatch(/debugbar|laravel debug|whoops|stack trace|APP_DEBUG/i);
  });
});

test.describe('SEO and metadata rules', () => {
  test('sitemap.xml should be accessible and contain XML sitemap content', async ({ request }) => {
    const response = await request.get(`${BASE_URL}${pages.sitemap}`, {
      failOnStatusCode: false,
    });

    expect(response.status()).toBe(200);

    const text = await response.text();
    expect(text).toMatch(/<urlset|<sitemapindex/i);
  });

  test('homepage title and SEO tags should exist', async ({ page }) => {
    await goto(page, pages.home);

    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:url"]')).toHaveCount(1);
  });

  test('browser tab title should not be generic or wrong', async ({ page }) => {
    await goto(page, pages.home);

    const title = await page.title();

    expect(title.trim()).not.toBe('');
    expect(title).not.toMatch(/All Games List|Untitled|Laravel|Home Page/i);

    if (EXPECTED_BRAND) {
      expect(title.toLowerCase()).toContain(EXPECTED_BRAND.toLowerCase());
    }
  });

  test('www/non-www redirect should not create duplicate www', async ({ request }) => {
    const url = new URL(BASE_URL);

    if (url.hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)) {
      test.skip(true, 'Skipped for localhost/IP.');
    }

    const targetHost = url.hostname.startsWith('www.')
      ? url.hostname.replace(/^www\./, '')
      : `www.${url.hostname}`;

    const targetUrl = `${url.protocol}//${targetHost}`;

    const response = await request.get(targetUrl, {
      maxRedirects: 0,
      failOnStatusCode: false,
    });

    expect([200, 301, 302, 307, 308]).toContain(response.status());
  });
});

test.describe('Suspicious reference and placeholder checks', () => {
  test('visible copy should not reference another website/domain', async ({ page }) => {
    const pagesWithText = await visibleTextForPages(page, [
      pages.home,
      pages.contact,
      pages.terms,
      pages.refund,
      pages.delivery,
      pages.privacy,
    ]);

    for (const item of pagesWithText) {
      const domains = extractDomainsFromText(item.text);

      const suspicious = domains
        .filter((domain) => currentDomain && domain !== currentDomain)
        .filter((domain) => !isAllowedExternalDomain(domain));

      expect(
        suspicious,
        `Suspicious external website/email reference found on ${item.path}. Current domain is ${currentDomain}.`
      ).toEqual([]);
    }
  });

  test('live site should not show placeholders', async ({ page }) => {
    if (SITE_STAGE !== 'live') {
      test.skip(true, 'Placeholder check is strict only in SITE_STAGE=live.');
    }

    const pagesWithText = await visibleTextForPages(page, [
      pages.home,
      pages.contact,
      pages.terms,
      pages.refund,
      pages.delivery,
      pages.privacy,
    ]);

    for (const item of pagesWithText) {
      expect(item.text, `Placeholder found on ${item.path}`).not.toMatch(/\[Company Name\]|\[Company Address\]|\[Email\]|\[Phone\]|\[Address\]/i);
    }
  });
});

test.describe('Homepage and global content rules', () => {
  test('homepage should show purchased-points disclaimer when site uses points', async ({ page }) => {
    skipIfNotPoints();
    await goto(page, pages.home);
    const text = await bodyText(page);

    expect(text).toMatch(/purchased points can only be (used|redeemed) on this website/i);
  });

  test('forbidden gaming/contest/community words should not appear on gaming common pages', async ({ page }) => {
    skipIfNotGaming();
    const pagesWithText = await visibleTextForPages(page, commonPages);

    for (const item of pagesWithText) {
      for (const rule of forbiddenWords) {
        expect(item.text, `Forbidden wording ${rule} found on ${item.path}`).not.toMatch(rule);
      }
    }
  });

  test('wrong business words should not appear', async ({ page }) => {
    const pagesWithText = await visibleTextForPages(page, commonPages);

    const rules = wrongBusinessCopy.filter((rule) => {
      const ruleText = rule.toString().toLowerCase();
      if (!IS_POINTS_SITE && /wallet|credits|redeem/.test(ruleText)) return false;
      if (!IS_GAMING_SITE && /pre-levellegaming/.test(ruleText)) return false;
      return true;
    });

    for (const item of pagesWithText) {
      for (const rule of rules) {
        expect(item.text, `Wrong copy ${rule} found on ${item.path}`).not.toMatch(rule);
      }
    }
  });

  test('internal developer or project-description copy should not appear on public pages', async ({ page }) => {
    const pagesWithText = await visibleTextForPages(page, commonPages);

    for (const item of pagesWithText) {
      for (const rule of internalDevCopy) {
        expect(item.text, `Internal/dev-facing copy ${rule} found on ${item.path}`).not.toMatch(rule);
      }
    }
  });

  test('newsletter wording should be approved when newsletter exists', async ({ page }) => {
    await goto(page, pages.home);
    const text = await bodyText(page);

    if (!/newsletter|subscribe/i.test(text)) {
      test.skip(true, 'No newsletter section found.');
    }

    expect(
      requiredNewsletterTexts.some((rule) => rule.test(text)),
      'Newsletter text should be either "Subscribe to our newsletter" or "Subscribe for more updates".'
    ).toBeTruthy();
  });

  test('footer copyright should follow approved format', async ({ page }) => {
    await goto(page, pages.home);
    const text = await bodyText(page);

    expect(text).not.toMatch(/copyrigth/i);
    expect(text).not.toMatch(/©\s*copyright/i);
    expect(text).toMatch(/©\s*2026\s+.+\. All Rights Reserved\./);
  });

  test('mobile viewport should show logo', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await goto(page, pages.home);

    await expect(page.locator(logoSelector).first()).toBeVisible();
  });

  test('random single-character artifact should not appear near page bottom', async ({ page }) => {
    await goto(page, pages.home);

    const bottomText = await page.evaluate(() => {
      const body = document.body.innerText || '';
      return body.split('\n').slice(-10).join('\n').trim();
    });

    expect(bottomText).not.toMatch(/^s$/im);
  });
});

test.describe('Currency and points rules', () => {
  test('JPY amounts should have comma separator and no decimals when JPY appears', async ({ page }) => {
    await goto(page, pages.home);
    const text = await bodyText(page);

    if (!/¥|JPY/i.test(text)) {
      test.skip(true, 'JPY is not visible on this page.');
    }

    expect(text).not.toMatch(/(¥|JPY)\s*\d{1,3}(,\d{3})*\.\d{1,2}/i);
    expect(text).not.toMatch(/(¥|JPY)\s*\d{4,}(?!,)/i);
  });

  test('HKD amounts should use comma separator for thousands when HKD appears', async ({ page }) => {
    await goto(page, pages.home);
    const text = await bodyText(page);

    if (!/HKD/i.test(text)) {
      test.skip(true, 'HKD is not visible on this page.');
    }

    expect(text).not.toMatch(/HKD\s*\d{4,}(?!,)/i);
  });

  test('visible point values should not show decimals when site uses points', async ({ page }) => {
    skipIfNotPoints();
    const pagesWithText = await visibleTextForPages(page, [
      pages.home,
      pages.cart,
      pages.checkout,
    ]);

    for (const item of pagesWithText) {
      expect(item.text, `Decimal point value found on ${item.path}`).not.toMatch(/\b\d+\.\d{1,2}\s*points?\b/i);
      expect(item.text, `Decimal point value found on ${item.path}`).not.toMatch(/\bpoints?\s*[:\-]?\s*\d+\.\d{1,2}\b/i);
    }
  });

  test('gaming service base cost should be between 30 and 40 points where service prices are visible', async ({ page }) => {
    skipIfNotGaming();
    skipIfNotPoints();
    await goto(page, pages.games);
    const text = await bodyText(page);

    const pointValues = [...text.matchAll(/\b(\d+)\s*points?\b/gi)]
      .map((match) => Number(match[1]));

    if (pointValues.length === 0) {
      test.skip(true, 'No service point values visible on games page.');
    }

    for (const value of pointValues) {
      expect(
        value === 20 || (value >= 30 && value <= 40),
        `Unexpected point value found: ${value}. Base services should be 30-40 points; optional training should be 20 points.`
      ).toBeTruthy();
    }
  });
});

test.describe('Cart, checkout and account wording rules', () => {
  test('checkout should not show subtotal row when accessible', async ({ page }) => {
    const exists = await pageExists(page, pages.checkout);

    if (!exists) {
      test.skip(true, 'Checkout page not publicly accessible.');
    }

    const text = await bodyText(page);
    expect(text).not.toMatch(/sub\s*total|subtotal|sub-total/i);
  });

  test('cart/sidebar should not repeat optional training on gaming sites', async ({ page }) => {
    skipIfNotGaming();
    const pagesWithText = await visibleTextForPages(page, [
      pages.cart,
      pages.home,
    ]);

    for (const item of pagesWithText) {
      const matches = item.text.toLowerCase().match(/optional training/g) || [];

      expect(
        matches.length,
        `"optional training" repeated on ${item.path}`
      ).toBeLessThanOrEqual(1);
    }
  });

  test('empty order page should use professional copy when accessible', async ({ page }) => {
    const exists = await pageExists(page, pages.accountOrders);

    if (!exists) {
      test.skip(true, 'Account orders page not publicly accessible.');
    }

    const text = await bodyText(page);

    expect(text).not.toMatch(/You have no order yet!! Please order some products/i);
    expect(text).not.toMatch(/Please order some products/i);
    expect(text).not.toMatch(/Marketplace/i);
  });

  test('success messages should use Product instead of Cart wording', async ({ page }) => {
    const pagesWithText = await visibleTextForPages(page, [
      pages.cart,
      pages.games,
    ]);

    for (const item of pagesWithText) {
      expect(item.text).not.toMatch(/added to cart|removed from cart|cart added|cart removed/i);
    }
  });
});

test.describe('Registration and login wording rules', () => {
  test('register page should have approved sign-in prompt and terms grammar when accessible', async ({ page }) => {
    const exists = await pageExists(page, pages.register);

    if (!exists) {
      test.skip(true, 'Register page not found.');
    }

    const text = await bodyText(page);

    expect(text).toMatch(/Already have an account\?\s*Sign In/i);
    expect(text).toMatch(/I agree with the Terms\s*&\s*Conditions/i);
  });

  test('captcha should exist on public sensitive forms if page is available', async ({ page }) => {
    const sensitivePages = [
      pages.contact,
      pages.register,
      pages.forgotPassword,
    ];

    for (const path of sensitivePages) {
      const exists = await pageExists(page, path);
      if (!exists) continue;

      await expect(
        page.locator(captchaSelector).first(),
        `Captcha missing on ${path}`
      ).toBeVisible();
    }
  });

  test('login page should not contain known spelling mistakes', async ({ page }) => {
    const exists = await pageExists(page, pages.login);

    if (!exists) {
      test.skip(true, 'Login page not found.');
    }

    const text = await bodyText(page);

    expect(text).not.toMatch(/plese|agian|try again to/i);
  });
});

test.describe('Policy page quality checks', () => {
  test('policy pages should avoid obvious repeated words and bad placeholders', async ({ page }) => {
    const pagesWithText = await visibleTextForPages(page, policyPages);

    for (const item of pagesWithText) {
      expect(item.text, `Repeated word found on ${item.path}`).not.toMatch(/\b(\w+)\s+\1\b/i);
      expect(item.text, `Bad placeholder found on ${item.path}`).not.toMatch(/pre-levellegaming/i);

      if (SITE_STAGE === 'live') {
        expect(item.text, `Placeholder found on live page ${item.path}`).not.toMatch(/\[Company Name\]|\[Company Address\]|\[Email\]|\[Phone\]|\[Address\]/i);
      }

      expect(item.text, `Jurisdiction should be Camel Case on ${item.path}`).not.toMatch(/\bjurisdiction\b/);
    }
  });
});


test.describe('Reviews removed checks', () => {
  test('review/testimonial section should not be visible on public pages', async ({ page }) => {
    const pagesWithText = await visibleTextForPages(page, [
      pages.home,
      pages.products,
      pages.services,
      pages.courses,
      pages.games,
    ]);

    for (const item of pagesWithText) {
      expect(item.text, `Review/testimonial copy found on ${item.path}`).not.toMatch(/reviews?|testimonials?|customer\s+feedback|what\s+our\s+customers\s+say|star\s+rating/i);
    }
  });

  test('review API or review JS should not be exposed in page source', async ({ page }) => {
    const paths = await existingPaths(page, [pages.home, pages.products, pages.services, pages.courses, pages.games]);

    for (const path of paths) {
      await goto(page, path);
      const html = await page.content();
      expect(html, `Review-related code/source found on ${path}`).not.toMatch(/review|testimonial|rating-stars|star-rating|api\/(reviews?|testimonials?)/i);
    }
  });
});

test.describe('Email activation and account verification checks', () => {
  test('registration page should mention email verification or activation', async ({ page }) => {
    const exists = await pageExists(page, pages.register);
    if (!exists) test.skip(true, 'Register page not found.');

    const text = await bodyText(page);
    expect(text).toMatch(/verify|verification|activate|activation|email/i);
  });

  test('login before verification flow requires manual/seeded account setup', async () => {
    if (!RUN_ACCOUNT_FLOW) {
      test.skip(true, 'Set RUN_ACCOUNT_FLOW=true and provide seeded unverified user flow before enabling this test.');
    }
  });
});

test.describe('Updated / new policy checks', () => {
  test('policy links should be present from homepage and should not be broken', async ({ page, request }) => {
    await goto(page, pages.home);
    const html = await page.content();

    for (const path of policyPages) {
      expect(html, `Policy link ${path} missing from homepage/footer`).toContain(path);
      const status = await getStatus(request, path);
      expect([200, 301, 302], `${path} returned ${status}`).toContain(status);
    }
  });

  test('policy pages should contain meaningful policy content', async ({ page }) => {
    const pagesWithText = await visibleTextForPages(page, policyPages);

    for (const item of pagesWithText) {
      expect(item.text.trim().length, `Policy page content too short on ${item.path}`).toBeGreaterThan(300);
      expect(item.text, `Policy page heading/content missing on ${item.path}`).toMatch(/policy|terms|conditions|refund|delivery|privacy/i);
      expect(item.text, `Broken link or route error visible on ${item.path}`).not.toMatch(/404|not found|route not defined|server error|exception/i);
    }
  });
});

test.describe('Game content and imagery checks', () => {
  test('game names should not be repeated awkwardly at start of descriptions', async ({ page }) => {
    skipIfNotGaming();
    await goto(page, pages.games);
    const text = await bodyText(page);

    expect(text).not.toMatch(/\b([A-Z][A-Za-z0-9:'’\-\s]{2,40}):\s+In\s+\1\b/);
  });

  test('service descriptions should not repeat full service names awkwardly', async ({ page }) => {
    skipIfNotGaming();
    await goto(page, pages.games);
    const text = await bodyText(page);

    expect(text).not.toMatch(/with the\s+(.{5,80})\s+-\s+\1\s+service/i);
  });

  test('non-logo images should not repeat excessively on game listing page', async ({ page }) => {
    skipIfNotGaming();
    await goto(page, pages.games);

    const imageData = await page.locator('img').evaluateAll((imgs) =>
      imgs.map((img) => ({
        src: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || '',
        className: img.getAttribute('class') || '',
      })).filter((img) => img.src)
    );

    const nonLogoSources = imageData
      .filter((img) => {
        const combined = `${img.src} ${img.alt} ${img.className}`.toLowerCase();

        return !combined.includes('logo') &&
          !combined.includes('brand') &&
          !combined.includes('favicon');
      })
      .map((img) => img.src);

    const counts = new Map<string, number>();

    for (const src of nonLogoSources) {
      counts.set(src, (counts.get(src) || 0) + 1);
    }

    const repeated = [...counts.entries()].filter(([, count]) => count > 2);

    expect(
      repeated,
      `Same non-logo image source repeated too many times: ${JSON.stringify(repeated)}`
    ).toEqual([]);
  });

  test('game image alt/src should not clearly contradict nearby game name', async ({ page }) => {
    skipIfNotGaming();
    await goto(page, pages.games);

    const suspiciousImages = await page.locator('img').evaluateAll((imgs) => {
      const games = [
        'dota 2',
        'apex legends',
        'valorant',
        'league of legends',
        'fortnite',
        'overwatch',
        'counter-strike',
        'cs2',
        'genshin impact',
        'clash of clans',
      ];

      return imgs
        .map((img) => {
          const alt = (img.getAttribute('alt') || '').toLowerCase();
          const src = (img.getAttribute('src') || '').toLowerCase();
          const className = (img.getAttribute('class') || '').toLowerCase();

          if (`${alt} ${src} ${className}`.includes('logo')) {
            return null;
          }

          const parentText =
            ((img.closest('section, article, div, li') as HTMLElement)?.innerText || '').toLowerCase();

          const imageText = `${alt} ${src}`;
          const nearbyGames = games.filter((game) => parentText.includes(game));
          const imageGames = games.filter((game) =>
            imageText.includes(game.replace(/\s+/g, '-')) ||
            imageText.includes(game)
          );

          return { alt, src, nearbyGames, imageGames };
        })
        .filter(Boolean)
        .filter((item: any) =>
          item.nearbyGames.length &&
          item.imageGames.length &&
          !item.nearbyGames.some((game: string) => item.imageGames.includes(game))
        );
    });

    expect(
      suspiciousImages,
      `Possible game image mismatch: ${JSON.stringify(suspiciousImages, null, 2)}`
    ).toEqual([]);
  });
});
