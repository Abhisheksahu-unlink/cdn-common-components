# 🚀 CDN Common Web Components (Integration Guide)

Welcome to the **Common Web Components** repository! This library serves modular, beautiful, and highly responsive web components dynamically via jsDelivr CDN. They are built as vanilla Web Components using Shadow DOM to prevent global stylesheet leaks and ensure modular design and functional consistency across any frontend project (HTML, Laravel Blade, React, Vue, etc.).

---

## 📦 Global CDN Integration

To load all available common components, copy and paste the scripts and fonts below into your main layout template (preferably in the **footer** page right before the `</body>` tag to guarantee fast page-load performance).

```html
<!-- 1. Include Phosphor Icons (Needed for visual styling) -->
<script src="https://unpkg.com/@phosphor-icons/web"></script>

<!-- 2. Include outfit font (Premium typography theme) -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap">

<!-- 3. Load the Common Components CDN Script -->
<script src="https://cdn.jsdelivr.net/gh/Abhisheksahu-unlink/cdn-common-components@main/common-components.js"></script>
```

> [!TIP]
> **CDN Cache Invalidation:** The `@main` version of jsDelivr automatically cache-purges when changes are merged into the repository. However, if your browser or CDN edge is serving a cached version, you can specify a specific commit hash for absolute consistency, e.g.:
> `https://cdn.jsdelivr.net/gh/Abhisheksahu-unlink/cdn-common-components@bf8ae58e097de1ea36789e91c4d449e423a97d4b/common-components.js`

---

## 🎨 Global Theme Styles (CSS Variables)

The components look spectacular out of the box and seamlessly inherit layout colors using the following CSS custom properties (variables) defined in your global `:root` or main CSS page. You can customize the look and feel in **one single spot**:

```css
:root {
    --ppf-primary: #8b5cf6;       /* Main interactive color (Purple/Blue/Gold) */
    --ppf-primary-hover: #7c3aed; /* Interactive hover color */
    --ppf-primary-text: #ffffff;  /* Text on interactive background */
    --ppf-border-color: #3f3f46;  /* Standard field borders */
    --ppf-input-bg: #18181b;      /* Form input backgrounds */
    --ppf-bg: #09090b;            /* Dark-mode form background */
    --ppf-text: #f4f4f5;          /* Default body text color */
}
```

---

## 📚 Component Catalog & Custom Elements

Here is the exact reference guide for every element defined in `common-components.js`.

---

### 1. 💳 Points Purchase & Recharge (`<points-purchase-form>`)

This element provides an interactive top-up amount and points conversion calculation mechanism, matching designated multiplier tiers. It supports two different structural styles (`standard` modern table and `cosmic` premium sci-fi gaming layout).

#### Attributes:
| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `string` | `standard` | Core style variant: `standard` or `cosmic` (interactive dark gaming layout). |
| `action` | `string` | `#` | Backend endpoint URL to submit the finalized purchase/cart addition. |
| `csrf` | `string` | `""` | Laravel/framework security token value to prevent CSRF failures. |
| `currency-symbol` | `string` | `$` | Display symbol representing selected local currency (e.g. `$`, `₹`, `€`). |
| `layout` | `string` | `horizontal` | Structure direction: `horizontal` or `vertical` (only applies to `standard` variant). |
| `button-text` | `string` | `Add To Cart` | The primary CTA submit button text. |
| `show-table` | `boolean` | `true` | Show/hide the bonus multiplier ranges grid (use `'false'` to hide). |
| `show-bonus` | `boolean` | `true` | Show/hide the dynamic points summary cards (use `'false'` to hide). |
| `button-background` | `color` | `var(--ppf-primary)` | Override button color directly. |
| `button-color` | `color` | `var(--ppf-primary-text)` | Override button text color directly. |
| `border-radius`/`radius` | `string` | `12px` | Card/input roundness size override. |
| `tiers` | `JSON string` | `[]` | **Required.** Serialized array defining the multiplier and benefit levels. |
| `topup-title` | `string` | `""` | Header banner overlay text. |
| `topup-icon` | `string` | `""` | Header image icon URL. |
| `topup-tagline` | `string` | `""` / `Bonus Tier Structure` | Title of the tier calculation board. |
| `topup-intro` | `string` | `""` | Subtitle description for headers. |
| `topup-disclaimer`| `string` | `""` / Default text | Text shown in the calculations warning area. |
| `recharge-title` | `string` | `Begin Your Recharge` | Header text above the input form card. |
| `recharge-text` | `string` | Default text | Descriptive sub-text below the form header. |

#### Tiers JSON Schema:
```json
[
  {
    "min": 1,
    "max": 99,
    "multiplier": 1,
    "benefit": "Bronze Tier",
    "label": "$1.00 - $99.99"
  }
]
```

#### Example Usage (Standard Variant):
```html
<points-purchase-form
    currency-symbol="₹"
    action="/cart/add"
    csrf="TOKEN_HERE"
    layout="horizontal"
    variant="standard"
    tiers='[
        {"min": 1, "max": 99, "multiplier": 1, "benefit": "Base Points", "label": "₹1 - ₹99"},
        {"min": 100, "max": 499, "multiplier": 1.2, "benefit": "20% Bonus Level", "label": "₹100 - ₹499"},
        {"min": 500, "max": 9990, "multiplier": 1.5, "benefit": "50% Power Up", "label": "₹500 - ₹9,990"},
        {"min": 10000, "max": 9999999, "multiplier": 2.0, "benefit": "Double Points Tier", "label": "₹10,000+"}
    ]'
></points-purchase-form>
```

#### Example Usage (Cosmic Gaming Variant):
```html
<points-purchase-form
    currency-symbol="$"
    action="/cart/add"
    csrf="TOKEN_HERE"
    variant="cosmic"
    topup-tagline="Galactic Core Multiplying Tiers"
    recharge-title="Initiate Quantum Hypercharge"
    recharge-text="Empower your inventory with instant premium tier-multiplying credits"
    tiers='[
        {"min": 1, "max": 9, "multiplier": 1.0, "benefit": "Core Level I", "label": "$1.00 - $9.99"},
        {"min": 10, "max": 49, "multiplier": 1.2, "benefit": "Core Level II", "label": "$10.00 - $49.99"},
        {"min": 50, "max": 99, "multiplier": 1.5, "benefit": "Core Level III", "label": "$50.00 - $99.99"},
        {"min": 100, "max": 999999, "multiplier": 2.0, "benefit": "Core Level IV", "label": "$100.00+"}
    ]'
></points-purchase-form>
```

---

### 2. 🔑 Secure User Sign In (`<login-form>`)

A highly performant authentication block with embedded client-side pattern validations and immediate backend feedback handling.

#### Attributes:
| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `action` | `string` | `#` | Target submission route (e.g. `{{ route('login') }}`). |
| `csrf` | `string` | `""` | Verification token. |
| `theme` | `string` | `dark` | Visual backdrop styling: `dark` or `light`. |
| `border-radius`/`radius` | `string` | `12px` | Corner styling. |
| `register-url` | `string` | `#` | Destination link for registration page. |
| `lost-password-url` | `string` | `#` | Destination link for recovering forgotten password. |
| `email-placeholder` | `string` | `Email` | Custom email input placeholder. |
| `password-placeholder` | `string` | `Password` | Custom password input placeholder. |
| `button-text` | `string` | `Sign In` | Submit button caption. |
| `error-message` | `string` | `""` | server validation error banners (e.g. `{{ $errors->first() }}`). |

#### Example Usage:
```html
<login-form
    action="/login"
    csrf="CSRF_TOKEN_FROM_SERVER"
    theme="dark"
    register-url="/register"
    lost-password-url="/forgot-password"
    error-message=""
></login-form>
```

---

### 3. 📝 Complete User Sign Up (`<register-form>`)

A responsive onboarding template with client-side requirements, password parity enforcement, terms confirmation checker, and dynamic Captcha injection slot.

#### Attributes:
| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `action` | `string` | `#` | Route endpoint URL. |
| `csrf` | `string` | `""` | Security token. |
| `theme` | `string` | `dark` | Theme selector. |
| `border-radius`/`radius` | `string` | `12px` | Elements border radius. |
| `login-url` | `string` | `#` | Target link for active accounts to login. |
| `terms-url` | `string` | `#` | Terms & Conditions documentation link. |
| `button-text` | `string` | `Sign Up` | Action button text. |
| `error-message` | `string` | `""` | Main error container overlay text. |
| `captcha-error-message` | `string` | `""` | Custom captcha validator failure text. |

#### Captcha Slot Support:
To avoid hardcoding captcha libraries, the form exposes a named slot `captcha` to dynamically render any captcha element (e.g., standard flat images or reCAPTCHA scripts).

#### Example Usage:
```html
<register-form
    action="/register"
    csrf="CSRF_TOKEN"
    theme="dark"
    login-url="/login"
    terms-url="/terms-of-service"
>
    <!-- Inject dynamic flat captcha image securely into the form -->
    <img 
        slot="captcha" 
        src="/captcha/image" 
        id="reg-captcha"
        style="cursor: pointer; border-radius: 6px; height: 42px;" 
        onclick="this.src='/captcha/image?'+Math.random()" 
        alt="Refresh Captcha"
    />
</register-form>
```

---

### 4. 🔑 Forgotten Password Recovery (`<forget-pwd-form>`)

A sleek form designed to request password reset links with server status banners and support for slots.

#### Attributes:
| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `action` | `string` | `#` | Reset request endpoint. |
| `csrf` | `string` | `""` | Security token. |
| `theme` | `string` | `dark` | Visual backdrop styles. |
| `register-url` | `string` | `#` | New user redirection URL. |
| `button-text` | `string` | `Submit` | Submit button copy. |
| `success-message` | `string` | `""` | Pass session confirmations (e.g. `{{ session('status') }}`). |
| `error-message` | `string` | `""` | Server error string. |

#### Example Usage:
```html
<forget-pwd-form
    action="/forgot-password"
    csrf="CSRF_TOKEN"
    theme="dark"
    register-url="/register"
    success-message=""
>
    <img 
        slot="captcha" 
        src="/captcha/image" 
        style="cursor: pointer; border-radius: 6px; height: 42px;" 
        onclick="this.src='/captcha/image?'+Math.random()" 
        alt="Refresh Captcha"
    />
</forget-pwd-form>
```

---

### 5. 🌐 Currency & Language Selectors

Modern dropdown select pickers that support instant route redirection or standard browser custom event dispatching.

---

#### 💱 Currency Switcher (`<currency-switcher>`)
Custom select picker for switching site currencies.

##### Attributes:
- `active-code` (default: `USD`): Highlighted currency code.
- `redirect-pattern` (optional): Redirect URL with `__VALUE__` placeholder. If omitted, dispatches a custom event.
- `currencies` (JSON string): Array of items, each containing `code` and `symbol`.

##### Schema:
```json
[
  {"code": "USD", "symbol": "$"},
  {"code": "INR", "symbol": "₹"},
  {"code": "EUR", "symbol": "€"}
]
```

##### Example Usage (Redirect pattern):
```html
<currency-switcher
    active-code="INR"
    redirect-pattern="/currency/switch?code=__VALUE__"
    currencies='[
        {"code": "USD", "symbol": "$"},
        {"code": "INR", "symbol": "₹"},
        {"code": "EUR", "symbol": "€"}
    ]'
></currency-switcher>
```

---

#### 🌐 Language Switcher (`<language-switcher>`)
Custom select picker for language translation selectors.

##### Attributes:
- `active-code` (default: `en`): Highlighted language code.
- `redirect-pattern` (optional): Redirect URL with `__VALUE__` placeholder. If omitted, dispatches a custom event.
- `languages` (JSON string): Array of items, each containing `code` and `label`.

##### Schema:
```json
[
  {"code": "en", "label": "English"},
  {"code": "es", "label": "Español"},
  {"code": "hi", "label": "हिन्दी"}
]
```

##### Example Usage (Custom Events pattern):
```html
<language-switcher
    active-code="en"
    languages='[
        {"code": "en", "label": "English"},
        {"code": "es", "label": "Español"},
        {"code": "hi", "label": "हिन्दी"}
    ]'
></language-switcher>

<script>
    // Listen for custom change events
    document.addEventListener('language-change', (e) => {
        const selectedLang = e.detail.code;
        console.log("Language changed to:", selectedLang);
        // Implement custom page logic or API dispatch here
    });
</script>
```

---

## 🛠️ AI Coding Assistant Integration Instructions

When instructing AI coding assistants (like Gemini, Copilot, or Cursor) to work with views inside projects utilizing this repository, direct them to read this file first. 

### Recommended Prompt for AI Agents:
> "Read `/Users/unlink/Desktop/websites/common-component/README.md` to understand the valid custom elements (`login-form`, `register-form`, `forget-pwd-form`, `points-purchase-form`, `currency-switcher`, `language-switcher`), their attributes, required JSON patterns, styling customizer systems, and CSRF token binding syntax before editing blade layouts."
