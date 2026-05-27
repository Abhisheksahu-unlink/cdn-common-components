
function parseTextStyle(attrValue) {
    const style = { family: '', weight: '', fontStyle: '' };
    if (!attrValue) return style;

    const parts = attrValue.split(/\s+/);
    parts.forEach(part => {
        const lower = part.toLowerCase();
        if (lower === 'italic' || lower === 'normal' || lower === 'oblique') {
            style.fontStyle = lower;
        } else if (lower === 'bold' || lower === 'lighter' || lower === 'bolder' || /^\d{3}$/.test(part)) {
            style.weight = lower;
        } else {
            if (style.family) {
                style.family += ' ' + part;
            } else {
                style.family = part;
            }
        }
    });
    return style;
}

class PointsPurchaseForm extends HTMLElement {

    static get observedAttributes() {
        return [
            'currency-symbol', 'action', 'csrf', 'theme', 'layout',
            'button-text', 'show-table', 'show-bonus', 'button-background',
            'button-color', 'border-radius', 'radius', 'variant', 'tiers',
            'title-color', 'title-size', 'title-style',
            'heading-color', 'heading-size', 'heading-style',
            'subheading-color', 'subheading-size', 'subheading-style',
            'paragraph-color', 'paragraph-size', 'paragraph-style'
        ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this._connected) {
            this.updateAttributes();
            this.render();
            this.bindEvents();
        }
    }

    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this._connected = true;
        this.updateAttributes();
        this.render();
        this.bindEvents();
    }

    updateAttributes() {
        this.currency =
            this.getAttribute('currency-symbol') || '$';

        this.action =
            this.getAttribute('action') || '#';

        this.csrf =
            this.getAttribute('csrf') || '';

        this.theme =
            this.getAttribute('theme') || 'dark';

        this.layout =
            this.getAttribute('layout') || 'horizontal';

        this.buttonText =
            this.getAttribute('button-text') || 'Add To Cart';

        this.showTable =
            this.getAttribute('show-table') !== 'false';

        this.showBonus =
            this.getAttribute('show-bonus') !== 'false';

        this.buttonBackground =
            this.getAttribute('button-background') ||
            'var(--ppf-primary)';

        this.buttonColor =
            this.getAttribute('button-color') ||
            'var(--ppf-primary-text)';

        this.borderRadius =
            this.getAttribute('border-radius') ||
            this.getAttribute('radius') ||
            '12px';

        this.variant =
            this.getAttribute('variant') || 'standard';

        try {
            this.tiers = JSON.parse(
                this.getAttribute('tiers') || '[]'
            );
        } catch (e) {
            console.error('Invalid JSON for tiers attribute', e);
            this.tiers = [];
        }

        // Parse and apply dynamic typography variables to the host element's styles
        const textTypes = ['title', 'heading', 'subheading', 'paragraph'];
        textTypes.forEach(type => {
            const color = this.getAttribute(`${type}-color`);
            const size = this.getAttribute(`${type}-size`);
            const styleAttr = this.getAttribute(`${type}-style`);

            if (color) {
                this.style.setProperty(`--ppf-${type}-color`, color);
            } else {
                this.style.removeProperty(`--ppf-${type}-color`);
            }

            if (size) {
                this.style.setProperty(`--ppf-${type}-size`, size);
            } else {
                this.style.removeProperty(`--ppf-${type}-size`);
            }

            if (styleAttr) {
                const parsed = parseTextStyle(styleAttr);
                if (parsed.family) {
                    this.style.setProperty(`--ppf-${type}-font-family`, parsed.family);
                } else {
                    this.style.removeProperty(`--ppf-${type}-font-family`);
                }
                if (parsed.weight) {
                    this.style.setProperty(`--ppf-${type}-font-weight`, parsed.weight);
                } else {
                    this.style.removeProperty(`--ppf-${type}-font-weight`);
                }
                if (parsed.fontStyle) {
                    this.style.setProperty(`--ppf-${type}-font-style`, parsed.fontStyle);
                } else {
                    this.style.removeProperty(`--ppf-${type}-font-style`);
                }
            } else {
                this.style.removeProperty(`--ppf-${type}-font-family`);
                this.style.removeProperty(`--ppf-${type}-font-weight`);
                this.style.removeProperty(`--ppf-${type}-font-style`);
            }
        });
    }

    render() {
        if (this.variant === 'cosmic') {
            const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
            const powerLevels = [20, 40, 65, 100];

            const tierCards = this.tiers.map((tier, index) => {
                const roman = romanNumerals[index] || (index + 1).toString();
                const power = powerLevels[index] || Math.round(((index + 1) / this.tiers.length) * 100);
                const isBestDeal = index === this.tiers.length - 1 && this.tiers.length > 1;

                return `
                    <div class="tier-face tier-${index + 1}">
                        ${isBestDeal ? `<span class="tier-best-badge">[ BEST DEAL ]</span>` : ''}
                        <div class="tier-inner">
                            <div class="tier-badge-wrap">
                                <span class="tier-roman">${roman}</span>
                                <span class="tier-name">${tier.benefit}</span>
                            </div>
                            <div class="tier-mult-display">
                                <span class="mult-num">${tier.multiplier}</span><span class="mult-x">x</span>
                            </div>
                            <div class="tier-range-label">${tier.multiplier}x Points</div>
                            <div class="tier-price-range">${tier.label}</div>
                            <div class="tier-power-bar">
                                <div class="tier-power-fill" data-width="${power}"></div>
                            </div>
                            <div class="tier-power-label">POWER LEVEL ▸ ${power}%</div>
                        </div>
                    </div>
                `;
            }).join('');

            const topupTitle = this.getAttribute('topup-title') || '';
            const topupIcon = this.getAttribute('topup-icon') || '';
            const topupTagline = this.getAttribute('topup-tagline') || 'Bonus Tier Structure';
            const topupIntro = this.getAttribute('topup-intro') || '';
            const topupDisclaimer = this.getAttribute('topup-disclaimer') || 'Disclaimer: All purchased points can only be redeemed on this website.';
            const rechargeTitle = this.getAttribute('recharge-title') || 'Begin Your Recharge';
            const rechargeText = this.getAttribute('recharge-text') || 'Maximize your benefits with every top-up – the more you recharge, the more rewards you get.';

            this.shadowRoot.innerHTML = `
            ${getCosmicStyles({
                borderRadius: this.borderRadius,
                buttonBg: this.buttonBackground,
                buttonColor: this.buttonColor
            })}

            <div class="cosmic-container cosmic-layout-${this.layout}">
                ${topupTagline ? `
                <div class="cosmic-header text-center">
                    <h2>${topupTagline}</h2>
                </div>
                ` : ''}

                <div class="cosmic-content">
                    <section class="pricing-section">
                        <div class="container">
                            <div class="tier-cards-grid">
                                ${tierCards}
                            </div>
                        </div>
                    </section>

                    <div class="section-divider"></div>

                    <section class="epoint-form">
                        <div class="container">
                            <div class="point-winfo">
                                <div class="text-center">
                                    <p>${topupDisclaimer}</p>
                                    <h4>${rechargeTitle}</h4>
                                    <p class="sub-text">${rechargeText}</p>
                                    <a href="javascript:void(0)" class="clck-winfo"><strong>Input Your Amount &amp; Recharge Today</strong></a>
                                </div>

                                <form action="${this.action}" method="POST">
                                    <input type="hidden" name="_token" value="${this.csrf}">
                                    <input type="hidden" name="quant[1]" value="1">
                                    <input type="hidden" name="slug" value="points">

                                    <div class="cosmic-form-row">
                                        <div class="curency-col">
                                            <p class="curency_xicn">${this.currency}</p>
                                        </div>

                                        <div class="input-col">
                                            <label class="form-label">Amount</label>
                                            <input 
                                                type="number" 
                                                class="form-control" 
                                                placeholder="Enter amount in ${this.currency}" 
                                                min="1" 
                                                name="price" 
                                                id="price" 
                                                required
                                            >
                                        </div>

                                        <div class="input-col">
                                            <label class="form-label">Points</label>
                                            <input 
                                                type="number" 
                                                class="form-control pnter-text" 
                                                placeholder="Number Of Points" 
                                                min="1" 
                                                name="points" 
                                                id="points" 
                                                required 
                                                readonly
                                            >
                                        </div>
                                    </div>

                                    <div class="text-center" style="margin-top: 24px;">
                                        <button class="default-button" type="submit">${this.buttonText}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            `;
            return;
        }

        const rows = this.tiers.map((tier, index) => `
            <tr class="${index !== this.tiers.length - 1 ? 'border-row' : ''}">
                <td>${tier.label}</td>
                <td>${tier.multiplier}x</td>
                <td>${tier.benefit}</td>
            </tr>
        `).join('');

        const topupTitle = this.getAttribute('topup-title') || '';
        const topupIcon = this.getAttribute('topup-icon') || '';
        const topupTagline = this.getAttribute('topup-tagline') || '';
        const topupIntro = this.getAttribute('topup-intro') || '';
        const topupDisclaimer = this.getAttribute('topup-disclaimer') || '';
        const rechargeTitle = this.getAttribute('recharge-title') || '';
        const rechargeText = this.getAttribute('recharge-text') || '';

        const hasHeaders = topupTitle || topupTagline || rechargeTitle || rechargeText;

        this.shadowRoot.innerHTML = `
        ${getSharedStyles({
            borderRadius: this.borderRadius,
            buttonBg: this.buttonBackground,
            buttonColor: this.buttonColor,
            isAuth: false
        })}

        <div class="points-topup-container">
            ${topupTitle || topupTagline ? `
            <div class="topup-header">
                <div class="section-title-wrap">
                    ${topupTitle ? `<p class="topup-title">${topupTitle}</p>` : ''}
                    ${topupIcon ? `<img class="topup-icon" src="${topupIcon}" alt="" />` : ''}
                </div>
                ${topupTagline ? `<h2 class="topup-tagline">${topupTagline}</h2>` : ''}
                ${topupIntro ? `<p class="topup-intro">${topupIntro}</p>` : ''}
                ${topupDisclaimer ? `<p class="topup-disclaimer">${topupDisclaimer}</p>` : ''}
            </div>
            ` : ''}

            <div class="${hasHeaders ? 'recharge-card' : ''}">
                ${rechargeTitle || rechargeText ? `
                <div class="recharge-header">
                    ${rechargeTitle ? `<h3 class="recharge-title">${rechargeTitle}</h3>` : ''}
                    ${rechargeText ? `<p class="recharge-text">${rechargeText}</p>` : ''}
                </div>
                ` : ''}

                <div class="component-layout-${this.layout}">

                    <div class="form-section">

                        <form action="${this.action}" method="POST">

                            <input type="hidden" name="_token" value="${this.csrf}">
                            <input type="hidden" name="quant[1]" value="1">
                            <input type="hidden" name="slug" value="points">
                            <input type="hidden" name="points" id="total_points" value="0">

                            <div class="layout-${this.layout}">

                                <div>
                                    <label class="label">Amount</label>

                                    <div class="input-wrap">
                                        <span>${this.currency}</span>

                                        <input
                                            type="number"
                                            min="1"
                                            max="9999999"
                                            id="price"
                                            name="price"
                                            placeholder="Enter amount"
                                            required
                                        >
                                    </div>
                                </div>

                            </div>

                            ${this.showBonus ? `
                            <div class="stats">
                                <div class="card">

                                    <div class="total-title">
                                        Total Points
                                    </div>

                                    <div class="total-value" id="total_pointst">
                                        0
                                    </div>

                                </div>

                                <div class="card">
                                    <div class="stat-title">Points</div>
                                    <div class="stat-value" id="pointst">0</div>
                                </div>

                                <div class="card">
                                    <div class="stat-title">Bonus Points</div>
                                    <div class="stat-value" id="bonus_pointst">0</div>
                                </div>

                                <div class="card">
                                    <div class="stat-title">Multiplier</div>
                                    <div class="stat-value" id="bonus_multiplier">1x</div>
                                </div>

                            </div>
                            ` : ''}

                            <button type="submit">
                                ${this.buttonText}
                            </button>
                        </form>
                    </div>

                    ${this.showTable ? `
                    <div class="table-wrap">

                        <table>

                            <thead>
                                <tr>
                                    <th>Top-Up Range</th>
                                    <th>Multiplier</th>
                                    <th>Benefit</th>
                                </tr>
                            </thead>

                            <tbody>
                                ${rows}
                            </tbody>

                        </table>

                    </div>
                    ` : ''}

                </div>
            </div>
        </div>
        `;
    }

    bindEvents() {
        const input = this.shadowRoot.querySelector('#price');
        if (input) {
            input.addEventListener('input', () => this.calculate());
        }

        if (this.variant === 'cosmic') {
            const fills = this.shadowRoot.querySelectorAll('.tier-power-fill');
            const section = this.shadowRoot.querySelector('.pricing-section');
            if (fills.length && section) {
                let animated = false;
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !animated) {
                            animated = true;
                            fills.forEach(fill => {
                                fill.style.width = fill.getAttribute('data-width') + '%';
                            });
                            observer.unobserve(section);
                        }
                    });
                }, { threshold: 0.1 });
                observer.observe(section);
            }
        }
    }

    calculate() {
        const priceEl = this.shadowRoot.querySelector('#price');
        if (!priceEl) return;

        const amount = parseFloat(priceEl.value) || 0;

        const matchedTier = this.tiers.find(tier =>
            amount >= Number(tier.min) &&
            amount <= Number(tier.max)
        );

        const multiplier = matchedTier
            ? Number(matchedTier.multiplier)
            : 1;

        const points = amount;

        const totalPoints =
            Math.floor(points * multiplier);

        const bonusPoints =
            totalPoints - points;

        if (this.variant === 'cosmic') {
            const pointsEl = this.shadowRoot.querySelector('#points');
            if (pointsEl) {
                pointsEl.value = totalPoints;
            }
        } else {
            const pointstEl = this.shadowRoot.querySelector('#pointst');
            if (pointstEl) pointstEl.textContent = points.toLocaleString();

            const bonusPointstEl = this.shadowRoot.querySelector('#bonus_pointst');
            if (bonusPointstEl) bonusPointstEl.textContent = bonusPoints.toLocaleString();

            const totalPointstEl = this.shadowRoot.querySelector('#total_pointst');
            if (totalPointstEl) totalPointstEl.textContent = totalPoints.toLocaleString();

            const bonusMultiplierEl = this.shadowRoot.querySelector('#bonus_multiplier');
            if (bonusMultiplierEl) bonusMultiplierEl.textContent = multiplier + 'x';

            const totalPointsEl = this.shadowRoot.querySelector('#total_points');
            if (totalPointsEl) totalPointsEl.value = totalPoints;
        }
    }
}

customElements.define(
    'points-purchase-form',
    PointsPurchaseForm
);

function getCosmicStyles({
    borderRadius = '12px',
    buttonBg = 'var(--ppf-primary)',
    buttonColor = 'var(--ppf-primary-text)'
} = {}) {
    return `
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Outfit:wght@300;400;700&family=Rajdhani:wght@500;600;700&display=swap">
        <style>
            :host {
                --cosmic-bg: #0c071e;
                --cosmic-card-bg: rgba(13, 9, 26, 0.85);
                --cosmic-input-bg: #07040d;
                --cosmic-input-focus-bg: #0d091a;
                --cosmic-text: #ffffff;
                --cosmic-text-muted: rgba(226, 232, 240, 0.6);
                --cosmic-border: rgba(139, 92, 246, 0.25);
                --cosmic-grid-color: rgba(255, 255, 255, 0.013);
                --cosmic-roman-bg: rgba(139, 92, 246, 0.1);

                --obsidian-panel:   var(--cosmic-card-bg);
                --obsidian-border:  var(--cosmic-border);
                --aurora-cyan:      #00f2fe;
                --aurora-purple:    #8b5cf6;
                --aurora-pink:      #ec4899;
                --cyber-gold:       #f59e0b;

                --button-bg: ${buttonBg};
                --button-color: ${buttonColor};
                --ppf-radius: ${borderRadius};

                display: block;
                width: 100%;
                font-family: 'Outfit', sans-serif;
                background-color: var(--cosmic-bg);
                color: var(--cosmic-text);
                transition: background-color 0.3s ease, color 0.3s ease;
            }

            :host([theme="light"]) {
                --cosmic-bg: #f5f3ff;
                --cosmic-card-bg: rgba(255, 255, 255, 0.85);
                --cosmic-input-bg: #ffffff;
                --cosmic-input-focus-bg: #fcfbff;
                --cosmic-text: #120e36;
                --cosmic-text-muted: rgba(18, 14, 54, 0.65);
                --cosmic-border: rgba(139, 92, 246, 0.15);
                --cosmic-grid-color: rgba(139, 92, 246, 0.03);
                --cosmic-roman-bg: rgba(139, 92, 246, 0.06);

                --aurora-cyan:      #0284c7;
                --aurora-purple:    #7c3aed;
                --aurora-pink:      #db2777;
                --cyber-gold:       #d97706;
            }

            *, *::before, *::after {
                box-sizing: border-box;
            }

            .pricing-section {
                padding: 60px 0;
                overflow: hidden;
                position: relative;
            }

            .pricing-section::before {
                content: '';
                position: absolute;
                inset: 0;
                background-image:
                    linear-gradient(var(--cosmic-grid-color) 1px, transparent 1px),
                    linear-gradient(90deg, var(--cosmic-grid-color) 1px, transparent 1px);
                background-size: 30px 30px;
                pointer-events: none;
                z-index: 0;
            }

            .cosmic-header h2, .pricing-section .sec-title h2 {
                font-family: var(--ppf-title-font-family, 'Orbitron', sans-serif);
                font-size: var(--ppf-title-size, 2.2rem);
                font-weight: var(--ppf-title-font-weight, 700);
                font-style: var(--ppf-title-font-style, normal);
                text-transform: uppercase;
                letter-spacing: 2px;
                color: var(--ppf-title-color, var(--cosmic-text));
                text-shadow: 0 0 10px rgba(139,92,246,0.4);
                margin-bottom: 40px;
                text-align: center;
            }

            .tier-cards-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 22px;
                margin-top: 20px;
            }

            .tier-face {
                position: relative;
                transition: transform 0.35s ease;
            }

            .tier-face:hover { transform: translateY(-8px); }

            .tier-inner {
                background: var(--cosmic-card-bg);
                backdrop-filter: blur(20px) saturate(180%);
                -webkit-backdrop-filter: blur(20px) saturate(180%);
                border: 1px solid var(--cosmic-border);
                border-radius: 16px;
                padding: 38px 24px 30px;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                position: relative;
                overflow: hidden;
                transition: border-color 0.4s ease, box-shadow 0.4s ease, background-color 0.3s ease;
            }

            .tier-inner::before {
                content: '';
                position: absolute;
                inset: 0;
                background-image:
                    linear-gradient(var(--cosmic-grid-color) 1px, transparent 1px),
                    linear-gradient(90deg, var(--cosmic-grid-color) 1px, transparent 1px);
                background-size: 22px 22px;
                pointer-events: none;
            }

            .tier-badge-wrap {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                margin-bottom: 24px;
            }

            .tier-roman {
                font-family: 'Orbitron', sans-serif;
                font-size: 14px;
                font-weight: 700;
                width: 46px;
                height: 46px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                letter-spacing: 1px;
                transition: all 0.3s ease;
            }

            .tier-name {
                font-family: 'Rajdhani', sans-serif;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 2px;
                text-transform: uppercase;
                color: var(--cosmic-text-muted);
            }

            .tier-mult-display {
                display: flex;
                align-items: baseline;
                justify-content: center;
                margin-bottom: 6px;
                line-height: 1;
            }

            .mult-num {
                font-family: 'Orbitron', sans-serif;
                font-size: 56px;
                font-weight: 900;
                line-height: 1;
                transition: text-shadow 0.3s ease;
            }

            .mult-x {
                font-family: 'Orbitron', sans-serif;
                font-size: 24px;
                font-weight: 700;
                margin-left: 3px;
                opacity: 0.7;
                align-self: flex-start;
                padding-top: 10px;
            }

            .tier-range-label {
                font-family: 'Orbitron', sans-serif;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                color: var(--cosmic-text-muted);
                margin-bottom: 18px;
            }

            .tier-price-range {
                font-family: 'Rajdhani', sans-serif;
                font-size: 19px;
                font-weight: 700;
                color: var(--cosmic-text);
                letter-spacing: 0.5px;
                margin-bottom: 28px;
                margin-top: auto;
            }

            .tier-power-bar {
                width: 100%;
                height: 5px;
                background: rgba(255,255,255,0.06);
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 7px;
            }

            .tier-power-fill {
                height: 100%;
                border-radius: 3px;
                width: 0;
                transition: width 1.4s cubic-bezier(0.25,1,0.5,1);
            }

            .tier-power-label {
                font-family: 'Orbitron', sans-serif;
                font-size: 8px;
                font-weight: 700;
                letter-spacing: 1px;
                color: var(--cosmic-text-muted);
                text-align: right;
                width: 100%;
            }

            .tier-best-badge {
                position: absolute;
                top: 14px;
                right: 14px;
                font-family: 'Orbitron', sans-serif;
                font-size: 9px;
                font-weight: 700;
                letter-spacing: 1px;
                z-index: 10;
                padding: 4px 9px;
                border-radius: 4px;
            }

            /* Dynamic Tier Styling */
            .tier-face.tier-1 .tier-inner { border-color: rgba(160,174,192,0.32); box-shadow: 0 12px 28px rgba(160,174,192,0.06); }
            .tier-face.tier-1:hover .tier-inner { border-color: rgba(160,174,192,0.65); box-shadow: 0 22px 44px rgba(160,174,192,0.14); }
            .tier-face.tier-1 .tier-roman { background: var(--cosmic-roman-bg); border: 1px solid rgba(160,174,192,0.25); color: #a0aec0; }
            .tier-face.tier-1 .mult-num, .tier-face.tier-1 .mult-x { color: #a0aec0; }
            .tier-face.tier-1:hover .mult-num { text-shadow: 0 0 20px rgba(160,174,192,0.5); }
            .tier-face.tier-1 .tier-power-fill { background: linear-gradient(90deg, #718096, #cbd5e0); }

            .tier-face.tier-2 .tier-inner { border-color: rgba(245,158,11,0.28); box-shadow: 0 12px 28px rgba(245,158,11,0.05); }
            .tier-face.tier-2:hover .tier-inner { border-color: rgba(245,158,11,0.7); box-shadow: 0 22px 44px rgba(245,158,11,0.14); }
            .tier-face.tier-2 .tier-roman { background: var(--cosmic-roman-bg); border: 1px solid rgba(245,158,11,0.3); color: var(--cyber-gold); }
            .tier-face.tier-2 .mult-num, .tier-face.tier-2 .mult-x { color: var(--cyber-gold); }
            .tier-face.tier-2 .tier-name { color: rgba(245,158,11,0.8); }
            .tier-face.tier-2:hover .mult-num { text-shadow: 0 0 20px rgba(245,158,11,0.6); }
            .tier-face.tier-2 .tier-power-fill { background: linear-gradient(90deg, #b45309, var(--cyber-gold)); box-shadow: 0 0 8px rgba(245,158,11,0.5); }

            .tier-face.tier-3 .tier-inner { border-color: rgba(0,242,254,0.28); box-shadow: 0 12px 28px rgba(0,242,254,0.05); }
            .tier-face.tier-3:hover .tier-inner { border-color: rgba(0,242,254,0.7); box-shadow: 0 22px 44px rgba(0,242,254,0.14); }
            .tier-face.tier-3 .tier-roman { background: var(--cosmic-roman-bg); border: 1px solid rgba(0,242,254,0.25); color: var(--aurora-cyan); }
            .tier-face.tier-3 .mult-num, .tier-face.tier-3 .mult-x { color: var(--aurora-cyan); }
            .tier-face.tier-3 .tier-name { color: var(--aurora-cyan); opacity: 0.85; }
            .tier-face.tier-3:hover .mult-num { text-shadow: 0 0 22px rgba(0,242,254,0.7); }
            .tier-face.tier-3 .tier-power-fill { background: linear-gradient(90deg, #0e7490, var(--aurora-cyan)); box-shadow: 0 0 10px rgba(0,242,254,0.6); }

            .tier-face.tier-4 .tier-inner { border-color: rgba(236,72,153,0.42); animation: tier4Pulse 3.5s infinite ease-in-out; }
            @keyframes tier4Pulse {
                0%,100% { border-color: rgba(236,72,153,0.32); box-shadow: 0 12px 28px rgba(236,72,153,0.06); }
                50%     { border-color: rgba(236,72,153,0.62); box-shadow: 0 0 30px rgba(236,72,153,0.14); }
            }
            .tier-face.tier-4:hover .tier-inner { border-color: rgba(236,72,153,0.85); box-shadow: 0 22px 44px rgba(236,72,153,0.2); animation: none; }
            .tier-face.tier-4 .tier-roman { background: var(--cosmic-roman-bg); border: 1px solid rgba(236,72,153,0.3); color: var(--aurora-pink); }
            .tier-face.tier-4 .mult-num, .tier-face.tier-4 .mult-x { color: var(--aurora-pink); }
            .tier-face.tier-4 .tier-name { color: rgba(236,72,153,0.8); }
            .tier-face.tier-4 .tier-price-range { color: var(--aurora-pink); }
            .tier-face.tier-4:hover .mult-num { text-shadow: 0 0 25px rgba(236,72,153,0.8); }
            .tier-face.tier-4 .tier-power-fill { background: linear-gradient(90deg, #9d174d, var(--aurora-pink)); box-shadow: 0 0 12px rgba(236,72,153,0.7); }
            .tier-face.tier-4 .tier-best-badge { color: var(--aurora-pink); background: rgba(236,72,153,0.1); border: 1px solid rgba(236,72,153,0.3); text-shadow: 0 0 6px rgba(236,72,153,0.6); }

            /* Recharge console wrapper */
            .epoint-form {
                padding: 40px 0;
                position: relative;
            }

            .point-winfo {
                background: var(--cosmic-card-bg);
                border: 1px solid var(--cosmic-border);
                border-radius: var(--ppf-radius);
                padding: 50px 40px;
                box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 40px rgba(139,92,246,0.1);
                position: relative;
                overflow: hidden;
                transition: background-color 0.3s ease, border-color 0.3s ease;
            }

            :host([theme="light"]) .point-winfo {
                box-shadow: 0 30px 60px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.8), 0 0 40px rgba(139,92,246,0.04);
            }

            .point-winfo::before {
                content: '[';
                font-family: 'Orbitron', sans-serif;
                font-size: 32px;
                font-weight: 300;
                color: var(--aurora-cyan);
                position: absolute;
                top: 15px;
                left: 20px;
                opacity: 0.4;
                pointer-events: none;
            }

            .point-winfo::after {
                content: ']';
                font-family: 'Orbitron', sans-serif;
                font-size: 32px;
                font-weight: 300;
                color: var(--aurora-cyan);
                position: absolute;
                top: 15px;
                right: 20px;
                opacity: 0.4;
                pointer-events: none;
            }

            .point-winfo .text-center {
                text-align: center;
                margin-bottom: 24px;
            }

            .point-winfo .text-center > p:first-child {
                font-family: var(--ppf-paragraph-font-family, 'Orbitron', sans-serif);
                font-size: var(--ppf-paragraph-size, 13px);
                font-weight: var(--ppf-paragraph-font-weight, 700);
                font-style: var(--ppf-paragraph-font-style, normal);
                text-transform: uppercase;
                letter-spacing: 2px;
                color: var(--ppf-paragraph-color, var(--aurora-pink));
                text-shadow: 0 0 8px rgba(236,72,153,0.5);
                margin-bottom: 12px;
                margin-top: 0;
            }

            .point-winfo h4 {
                font-family: var(--ppf-heading-font-family, 'Orbitron', sans-serif);
                font-size: var(--ppf-heading-size, 2.2rem);
                font-weight: var(--ppf-heading-font-weight, 900);
                font-style: var(--ppf-heading-font-style, normal);
                text-transform: uppercase;
                letter-spacing: 1px;
                color: var(--ppf-heading-color, var(--cosmic-text));
                margin: 0 0 10px 0;
                text-shadow: 0 0 15px rgba(139,92,246,0.3);
            }

            .point-winfo .text-center > p.sub-text {
                font-family: var(--ppf-subheading-font-family, 'Outfit', sans-serif);
                font-weight: var(--ppf-subheading-font-weight, 300);
                font-size: var(--ppf-subheading-size, 14px);
                font-style: var(--ppf-subheading-font-style, normal);
                color: var(--ppf-subheading-color, var(--cosmic-text-muted));
                margin: 0 0 20px 0;
            }

            .clck-winfo {
                display: inline-block;
                font-family: 'Rajdhani', sans-serif;
                font-size: 13px;
                font-weight: 700;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                color: var(--aurora-cyan);
                text-decoration: none;
                border-bottom: 1px solid rgba(0,242,254,0.35);
                padding-bottom: 2px;
                margin-bottom: 36px;
                transition: color 0.2s, border-color 0.2s;
            }

            .clck-winfo:hover {
                color: var(--aurora-purple);
                border-color: var(--aurora-purple);
            }

            /* Flex row for form controls */
            .cosmic-form-row {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                align-items: flex-end;
                justify-content: center;
                max-width: 800px;
                margin: 0 auto;
            }

            .curency-col {
                flex: 0 0 60px;
            }

            .curency_xicn {
                font-family: 'Orbitron', sans-serif;
                font-size: 20px;
                font-weight: 700;
                background: rgba(0,242,254,0.08);
                border: 1px solid rgba(0,242,254,0.3);
                color: var(--aurora-cyan);
                height: 52px;
                border-radius: 8px;
                text-shadow: 0 0 5px rgba(0,242,254,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
            }

            .input-col {
                flex: 1 1 200px;
                max-width: 300px;
            }

            .point-winfo label.form-label {
                font-family: var(--ppf-paragraph-font-family, 'Orbitron', sans-serif);
                font-size: var(--ppf-paragraph-size, 12px);
                font-weight: var(--ppf-paragraph-font-weight, 700);
                font-style: var(--ppf-paragraph-font-style, normal);
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: var(--ppf-paragraph-color, var(--cosmic-text-muted));
                margin-bottom: 8px;
                display: block;
            }

            .point-winfo input.form-control {
                width: 100%;
                background: var(--cosmic-input-bg);
                border: 1px solid var(--cosmic-border);
                border-radius: 8px;
                height: 52px;
                color: var(--cosmic-text);
                font-family: 'Orbitron', sans-serif;
                font-size: 18px;
                font-weight: 700;
                letter-spacing: 1px;
                padding: 10px 18px;
                transition: all 0.3s ease;
                outline: none;
                box-sizing: border-box;
            }

            .point-winfo input.form-control:focus {
                border-color: var(--aurora-purple);
                box-shadow: 0 0 12px rgba(139,92,246,0.4);
                background: var(--cosmic-input-focus-bg);
            }

            .point-winfo input.form-control.pnter-text {
                background: rgba(0,242,254,0.03);
                border-color: rgba(0,242,254,0.25);
                color: var(--aurora-cyan);
                text-shadow: 0 0 8px rgba(0,242,254,0.5);
            }

            .point-winfo input.form-control::placeholder {
                color: rgba(148,163,184,0.35);
                font-family: 'Outfit', sans-serif;
                font-size: 14px;
                font-weight: 300;
                letter-spacing: normal;
            }

            .point-winfo button.default-button {
                font-family: 'Orbitron', sans-serif;
                font-weight: 900;
                font-size: 15px;
                text-transform: uppercase;
                letter-spacing: 2px;
                padding: 14px 25px;
                border-radius: 4px;
                background: linear-gradient(135deg, var(--aurora-purple) 0%, var(--aurora-pink) 100%);
                color: #fff;
                border: none;
                box-shadow: 0 0 20px rgba(139,92,246,0.5);
                transition: all 0.3s cubic-bezier(0.25,0.8,0.25,1);
                cursor: pointer;
                margin-top: 0;
                width: 100%;
                max-width: 250px;
            }

            .point-winfo button.default-button:hover {
                transform: translateY(-3px) scale(1.02);
                box-shadow: 0 0 30px rgba(236,72,153,0.7);
                background: linear-gradient(135deg, var(--aurora-cyan) 0%, var(--aurora-purple) 100%);
            }

            .section-divider {
                height: 1px;
                background: linear-gradient(90deg, transparent 0%, rgba(139,92,246,0) 8%, var(--aurora-purple) 35%, var(--aurora-cyan) 50%, var(--aurora-purple) 65%, rgba(139,92,246,0) 92%, transparent 100%);
                box-shadow: 0 0 14px rgba(0,242,254,0.25);
                margin: 40px 0;
            }

            /* Layout styling for Horizontal / Vertical layouts */
            /* Layout styling for Horizontal / Vertical layouts */
            .cosmic-layout-horizontal .cosmic-content {
                display: grid;
                grid-template-columns: minmax(0, 1.25fr) minmax(320px, 1fr);
                gap: 40px;
                align-items: start;
                max-width: 1200px;
                margin: 0 auto;
            }

            .cosmic-layout-horizontal .section-divider {
                display: none;
            }

            .cosmic-layout-horizontal .pricing-section,
            .cosmic-layout-horizontal .epoint-form {
                padding: 0;
            }

            .cosmic-layout-horizontal .tier-cards-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
            }
            .cosmic-container {
                padding: 40px 30px;
                width: 100%;
                box-sizing: border-box;
            }

            .cosmic-layout-vertical {
                display: block;
            }

            @media (max-width: 1024px) {
                .cosmic-layout-horizontal .cosmic-content {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                .cosmic-layout-horizontal .section-divider {
                    display: block;
                }
                .cosmic-layout-horizontal .tier-cards-grid {
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                }
            }

            @media (max-width: 768px) {
                .cosmic-container { padding: 20px 15px; }
                .point-winfo { padding: 30px 20px; }
                .point-winfo::before, .point-winfo::after { display: none; }
                .cosmic-form-row { flex-direction: column; align-items: stretch; }
                .curency-col { flex: none; width: 100%; }
                .input-col { flex: none; width: 100%; max-width: none; }
                .point-winfo button.default-button { max-width: none; margin-top: 15px; }
            }
        </style>
    `;
}

function getSharedStyles({
    maxWidth = 'none',
    borderRadius = '12px',
    buttonBg = 'var(--ppf-primary)',
    buttonColor = 'var(--ppf-primary-text)',
    isAuth = false
} = {}) {
    return `
        <style>
            :host {
                --ppf-bg: #000f09;
                --ppf-card-bg: rgba(255, 255, 255, 0.04);
                --ppf-border: rgba(255, 255, 255, 0.08);
                --ppf-text: #ffffff;
                --ppf-muted: #949a98;
                --ppf-primary: #2df4a1;
                --ppf-primary-text: #000f09;
                --ppf-error: #ef4444;
                --ppf-success: #2df4a1;

                --button-bg: ${buttonBg};
                --button-color: ${buttonColor};
                --ppf-radius: ${borderRadius};

                display: block;
                max-width: ${maxWidth};
                width: 100%;
                ${maxWidth !== 'none' ? 'margin: 0 auto;' : ''}
                font-family: system-ui, sans-serif;
            }

            :host([theme="light"]) {
                --ppf-bg: #ffffff;
                --ppf-card-bg: #f8fafc;
                --ppf-border: #e2e8f0;
                --ppf-text: #111827;
                --ppf-muted: #6b7280;
                --ppf-primary: #10b981;
                --ppf-primary-text: #ffffff;
                --ppf-success: #10b981;
            }

            * {
                box-sizing: border-box;
            }

            form {
                color: var(--ppf-text);
            }

            .card {
                background: var(--ppf-card-bg);
                border: 1px solid var(--ppf-border);
                border-radius: var(--ppf-radius);
                padding: ${isAuth ? '32px' : '16px'};
                ${isAuth ? `
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                display: flex;
                flex-direction: column;
                gap: 20px;
                transition: all 0.3s ease;
                ` : ''}
            }

            .label {
                display: block;
                font-weight: 600;
                color: var(--ppf-text);
                ${isAuth ? `
                font-size: 14px;
                ` : `
                margin-bottom: 8px;
                `}
            }

            .input-wrap {
                display: flex;
                align-items: center;
                gap: ${isAuth ? '12px' : '10px'};
                background: ${isAuth ? 'var(--ppf-bg)' : 'var(--ppf-card-bg)'};
                border: 1px solid var(--ppf-border);
                border-radius: var(--ppf-radius);
                padding: ${isAuth ? '14px 18px' : '14px 16px'};
                transition: border-color 0.2s, box-shadow 0.2s;
            }

            .input-wrap:focus-within {
                border-color: var(--ppf-primary);
                box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.2);
            }

            :host([theme="light"]) .input-wrap:focus-within {
                box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
            }

            .input-wrap span {
                color: var(--ppf-text);
                font-weight: 600;
            }

            input {
                width: 100%;
                border: none;
                outline: none;
                background: transparent;
                color: var(--ppf-text);
                font-size: ${isAuth ? '15px' : '16px'};
            }

            input::placeholder {
                color: var(--ppf-muted);
                opacity: 0.8;
            }

            button {
                width: 100%;
                border: none;
                cursor: pointer;
                padding: 14px;
                border-radius: var(--ppf-radius);
                background: var(--button-bg);
                color: var(--button-color);
                font-weight: 700;
                font-size: ${isAuth ? '16px' : '15px'};
                ${!isAuth ? 'margin-top: 20px;' : ''}
                transition: transform 0.1s, opacity 0.2s;
            }

            button:hover {
                opacity: 0.9;
            }

            button:active {
                transform: scale(0.98);
            }

            ${!isAuth ? `
            .layout-horizontal {
                display: grid;
                grid-template-columns: 1fr auto;
            }

            .layout-vertical {
                display: grid;
                grid-template-columns: 1fr;
                gap: 16px;
            }

            .stats {
                margin-top: 16px;
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
            }

            .stat-title {
                color: var(--ppf-muted);
                font-size: 12px;
                text-transform: uppercase;
                margin-bottom: 8px;
            }

            .stat-value {
                font-size: 22px;
                font-weight: 700;
                color: var(--ppf-text);
            }

            .total-title {
                color: var(--ppf-muted);
                text-transform: uppercase;
                font-size: 12px;
            }

            .total-value {
                margin-top: 8px;
                font-size: 32px;
                font-weight: 700;
                color: var(--ppf-primary);
            }

            .table-wrap {
                overflow: auto;
                border-radius: var(--ppf-radius);
            }

            :host([theme="light"]) .table-wrap {
                border: 1px solid var(--ppf-border);
                padding: 16px;
            }

            :host([theme="dark"]) .table-wrap {
                background: transparent;
                border: none;
                padding: 0;
            }

            table {
                width: 100%;
                border-collapse: collapse;
            }

            th {
                text-align: left;
                padding: 12px;
                border-bottom: 1px solid var(--ppf-border);
                color: var(--ppf-text);
                font-weight: 600;
            }

            td {
                padding: 12px;
                color: var(--ppf-text);
            }

            .border-row td {
                border-bottom: 1px solid var(--ppf-border);
            }

            .component-layout-horizontal {
                display: grid;
                grid-template-columns: minmax(0, 1fr) minmax(350px, 500px);
                gap: 24px;
                align-items: start;
            }

            .component-layout-vertical {
                display: block;
            }

            .component-layout-vertical .table-wrap {
                margin-top: 24px;
            }

            @media (max-width: 768px) {
                .component-layout-horizontal {
                    grid-template-columns: 1fr;
                }
                .layout-horizontal {
                    grid-template-columns: 1fr;
                }
                .stats {
                    grid-template-columns: 1fr;
                }
            }

            .points-topup-container {
                width: 100%;
            }

            .topup-header {
                margin-bottom: 32px;
                text-align: left;
            }

            .section-title-wrap {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }

            .topup-title {
                font-size: var(--ppf-subheading-size, 18px);
                font-weight: var(--ppf-subheading-font-weight, 500);
                font-family: var(--ppf-subheading-font-family, inherit);
                font-style: var(--ppf-subheading-font-style, normal);
                text-transform: uppercase;
                margin: 0;
                color: var(--ppf-subheading-color, var(--ppf-primary));
            }

            .topup-icon {
                height: auto;
                max-width: 100%;
            }

            .topup-tagline {
                font-size: var(--ppf-title-size, clamp(28px, 4vw, 42px));
                text-transform: uppercase;
                margin: 0 0 20px 0;
                font-weight: var(--ppf-title-font-weight, 700);
                color: var(--ppf-title-color, #ffffff);
                font-family: var(--ppf-title-font-family, inherit);
                font-style: var(--ppf-title-font-style, normal);
                line-height: 1.2;
            }

            .topup-intro {
                font-size: var(--ppf-subheading-size, 16px);
                color: var(--ppf-subheading-color, #949a98);
                font-family: var(--ppf-subheading-font-family, inherit);
                font-weight: var(--ppf-subheading-font-weight, normal);
                font-style: var(--ppf-subheading-font-style, normal);
                margin: 0 0 16px 0;
                line-height: 1.6;
            }

            .topup-disclaimer {
                font-size: var(--ppf-paragraph-size, 14px);
                color: var(--ppf-paragraph-color, #949a98);
                font-family: var(--ppf-paragraph-font-family, inherit);
                font-weight: var(--ppf-paragraph-font-weight, normal);
                font-style: var(--ppf-paragraph-font-style, italic);
                margin: 0;
                line-height: 1.6;
            }

            .recharge-card {
                background: var(--ppf-card-bg);
                border: 1px solid var(--ppf-border);
                border-radius: var(--ppf-radius);
                padding: 28px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            }

            .recharge-header {
                margin-bottom: 24px;
            }

            .recharge-title {
                font-size: var(--ppf-heading-size, 24px);
                text-transform: uppercase;
                margin: 0 0 12px 0;
                font-weight: var(--ppf-heading-font-weight, 700);
                color: var(--ppf-heading-color, var(--ppf-text));
                font-family: var(--ppf-heading-font-family, inherit);
                font-style: var(--ppf-heading-font-style, normal);
            }

            .recharge-text {
                font-size: var(--ppf-subheading-size, 15px);
                color: var(--ppf-subheading-color, var(--ppf-muted));
                font-family: var(--ppf-subheading-font-family, inherit);
                font-weight: var(--ppf-subheading-font-weight, normal);
                font-style: var(--ppf-subheading-font-style, normal);
                margin: 0;
                line-height: 1.6;
            }

            @media (max-width: 576px) {
                .recharge-card {
                    padding: 16px;
                }
            }
            ` : ''}

            ${isAuth ? `
            :host(.auth-forms), .auth-forms { z-index: 2; padding:80px 0px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .form-group { display: flex; flex-direction: column; gap: 8px; }
            .captcha-row { display: grid; grid-template-columns: 1.8fr 1fr; gap: 16px; align-items: center; }
            .error-message { color: var(--ppf-error); font-size: 12px; margin-top: 4px; display: none; }
            .error-message.show { display: block; }
            .alert-error { background: rgba(239, 68, 68, 0.1); border: 1px solid var(--ppf-error); color: var(--ppf-error); padding: 12px 16px; border-radius: var(--ppf-radius); font-size: 14px; text-align: center; }
            .alert-success { background: rgba(16, 185, 129, 0.1); border: 1px solid var(--ppf-success); color: var(--ppf-success); padding: 12px 16px; border-radius: var(--ppf-radius); font-size: 14px; text-align: center; }
            .links-row { display: flex; justify-content: flex-end; font-size: 14px; }
            .link { color: var(--ppf-primary); text-decoration: none; font-weight: 500; }
            .link:hover { text-decoration: underline; }
            .footer-text { text-align: center; font-size: 14px; color: var(--ppf-muted); margin-top: 8px; }
            .terms-row { display: flex; align-items: center; gap: 8px; color: var(--ppf-text); font-size: 14px; cursor: pointer; }
            #terms { width: 25px; height: 25px; cursor: pointer; }
            ` : ''}
        </style>
    `;
}

class LoginForm extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.action = this.getAttribute('action') || '#';
        this.csrf = this.getAttribute('csrf') || '';
        this.theme = this.getAttribute('theme') || 'dark';
        this.borderRadius = this.getAttribute('border-radius') || this.getAttribute('radius') || '12px';
        
        this.lostPasswordUrl = this.getAttribute('lost-password-url') || '#';
        this.registerUrl = this.getAttribute('register-url') || '#';
        
        this.emailPlaceholder = this.getAttribute('email-placeholder') || 'Email';
        this.passwordPlaceholder = this.getAttribute('password-placeholder') || 'Password';
        
        this.buttonText = this.getAttribute('button-text') || 'Sign In';
        this.dontHaveAccountText = this.getAttribute('dont-have-account-text') || "Don't have an account?";
        this.signUpText = this.getAttribute('sign-up-text') || 'Sign Up';
        this.lostPasswordText = this.getAttribute('lost-password-text') || 'Lost Password?';
        this.errorMessage = this.getAttribute('error-message') || '';

        this.emailRequiredText = this.getAttribute('email-required-text') || 'Email is required';
        this.emailInvalidText = this.getAttribute('email-invalid-text') || 'Please enter a valid email address';
        this.passwordRequiredText = this.getAttribute('password-required-text') || 'Password is required';

        this.render();
        this.bindEvents();
    }

    render() {
        this.shadowRoot.innerHTML = `
        ${getSharedStyles({ maxWidth: '500px', borderRadius: this.borderRadius, isAuth: true })}
        
        <form name="loginForm" id="loginForm" action="${this.action}" method="POST">
            <input type="hidden" name="_token" value="${this.csrf}">
            
            <div class="card">
                ${this.errorMessage ? `
                <div class="alert-error">
                    ${this.errorMessage}
                </div>
                ` : ''}
                
                <div class="form-group">
                    <label class="label">Email</label>
                    <div class="input-wrap" id="email-wrap">
                        <input
                            type="text"
                            name="email"
                            id="email"
                            placeholder="${this.emailPlaceholder}"
                        />
                    </div>
                    <div class="error-message" id="email-error"></div>
                </div>

                <div class="form-group">
                    <label class="label">Password</label>
                    <div class="input-wrap" id="password-wrap">
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="${this.passwordPlaceholder}"
                        />
                    </div>
                    <div class="error-message" id="password-error"></div>
                </div>

                <div class="links-row">
                    <a href="${this.lostPasswordUrl}" class="link">${this.lostPasswordText}</a>
                </div>

                <button type="submit">
                    ${this.buttonText}
                </button>

                <div class="footer-text">
                    ${this.dontHaveAccountText}
                    <a href="${this.registerUrl}" class="link">${this.signUpText}</a>
                </div>
            </div>
        </form>
        `;
    }

    bindEvents() {
        const form = this.shadowRoot.querySelector('#loginForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        const emailInput = this.shadowRoot.querySelector('#email');
        const passwordInput = this.shadowRoot.querySelector('#password');

        emailInput.addEventListener('input', () => this.clearError('email'));
        passwordInput.addEventListener('input', () => this.clearError('password'));
    }

    handleSubmit(e) {
        let isValid = true;
        const emailInput = this.shadowRoot.querySelector('#email');
        const passwordInput = this.shadowRoot.querySelector('#password');

        const emailVal = emailInput.value.trim();
        const passwordVal = passwordInput.value;

        // Email validation
        if (!emailVal) {
            this.showError('email', this.emailRequiredText);
            isValid = false;
        } else if (!this.validateEmail(emailVal)) {
            this.showError('email', this.emailInvalidText);
            isValid = false;
        }

        // Password validation
        if (!passwordVal) {
            this.showError('password', this.passwordRequiredText);
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
        }
    }

    showError(field, message) {
        const inputWrap = this.shadowRoot.querySelector(`#${field}-wrap`);
        const errorEl = this.shadowRoot.querySelector(`#${field}-error`);
        if (inputWrap && errorEl) {
            inputWrap.classList.add('is-invalid');
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
    }

    clearError(field) {
        const inputWrap = this.shadowRoot.querySelector(`#${field}-wrap`);
        const errorEl = this.shadowRoot.querySelector(`#${field}-error`);
        if (inputWrap && errorEl) {
            inputWrap.classList.remove('is-invalid');
            errorEl.classList.remove('show');
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}

customElements.define('login-form', LoginForm);

class ForgetPwdForm extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.action = this.getAttribute('action') || '#';
        this.csrf = this.getAttribute('csrf') || '';
        this.theme = this.getAttribute('theme') || 'dark';
        this.borderRadius = this.getAttribute('border-radius') || this.getAttribute('radius') || '12px';
        
        this.registerUrl = this.getAttribute('register-url') || '#';
        this.emailPlaceholder = this.getAttribute('email-placeholder') || 'Email';
        this.captchaPlaceholder = this.getAttribute('captcha-placeholder') || 'Captcha';
        
        this.buttonText = this.getAttribute('button-text') || 'Submit';
        this.dontHaveAccountText = this.getAttribute('dont-have-account-text') || "Don't have an account?";
        this.signUpText = this.getAttribute('sign-up-text') || 'Sign Up';
        
        this.successMessage = this.getAttribute('success-message') || '';
        this.errorMessage = this.getAttribute('error-message') || '';
        this.captchaErrorMessage = this.getAttribute('captcha-error-message') || '';

        this.emailRequiredText = this.getAttribute('email-required-text') || 'Email is required';
        this.emailInvalidText = this.getAttribute('email-invalid-text') || 'Please enter a valid email address';
        this.captchaRequiredText = this.getAttribute('captcha-required-text') || 'Captcha is required';

        this.render();
        this.bindEvents();
    }

    render() {
        this.shadowRoot.innerHTML = `
        ${getSharedStyles({ maxWidth: '500px', borderRadius: this.borderRadius, isAuth: true })}
        
        <form name="forgetForm" id="forgetForm" action="${this.action}" method="POST">
            <input type="hidden" name="_token" value="${this.csrf}">
            
            <div class="card">
                ${this.successMessage ? `
                <div class="alert-success">
                    ${this.successMessage}
                </div>
                ` : ''}

                ${this.errorMessage ? `
                <div class="alert-error">
                    ${this.errorMessage}
                </div>
                ` : ''}
                
                <div class="form-group">
                    <label class="label">Email</label>
                    <div class="input-wrap" id="email-wrap">
                        <input
                            type="text"
                            name="email"
                            id="email"
                            placeholder="${this.emailPlaceholder}"
                        />
                    </div>
                    <div class="error-message" id="email-error"></div>
                </div>

                <div class="form-group">
                    <label class="label">Captcha</label>
                    <div class="captcha-row">
                        <div class="input-wrap" id="captcha-wrap">
                            <input
                                type="text"
                                name="captcha"
                                id="captcha"
                                placeholder="${this.captchaPlaceholder}"
                                autocomplete="off"
                            />
                        </div>
                        <div class="captcha-image-container">
                            <slot name="captcha"></slot>
                        </div>
                    </div>
                    <div class="error-message" id="captcha-error"></div>
                    ${this.captchaErrorMessage ? `
                    <div class="server-error">${this.captchaErrorMessage}</div>
                    ` : ''}
                </div>

                <button type="submit">
                    ${this.buttonText}
                </button>

                <div class="footer-text">
                    ${this.dontHaveAccountText}
                    <a href="${this.registerUrl}" class="link">${this.signUpText}</a>
                </div>
            </div>
        </form>
        `;
    }

    bindEvents() {
        const form = this.shadowRoot.querySelector('#forgetForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        const emailInput = this.shadowRoot.querySelector('#email');
        const captchaInput = this.shadowRoot.querySelector('#captcha');

        emailInput.addEventListener('input', () => this.clearError('email'));
        captchaInput.addEventListener('input', () => this.clearError('captcha'));
    }

    handleSubmit(e) {
        let isValid = true;
        const emailInput = this.shadowRoot.querySelector('#email');
        const captchaInput = this.shadowRoot.querySelector('#captcha');

        const emailVal = emailInput.value.trim();
        const captchaVal = captchaInput.value.trim();

        // Email validation
        if (!emailVal) {
            this.showError('email', this.emailRequiredText);
            isValid = false;
        } else if (!this.validateEmail(emailVal)) {
            this.showError('email', this.emailInvalidText);
            isValid = false;
        }

        // Captcha validation
        if (!captchaVal) {
            this.showError('captcha', this.captchaRequiredText);
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
        }
    }

    showError(field, message) {
        const inputWrap = this.shadowRoot.querySelector(`#${field}-wrap`);
        const errorEl = this.shadowRoot.querySelector(`#${field}-error`);
        if (inputWrap && errorEl) {
            inputWrap.classList.add('is-invalid');
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
    }

    clearError(field) {
        const inputWrap = this.shadowRoot.querySelector(`#${field}-wrap`);
        const errorEl = this.shadowRoot.querySelector(`#${field}-error`);
        if (inputWrap && errorEl) {
            inputWrap.classList.remove('is-invalid');
            errorEl.classList.remove('show');
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}

customElements.define('forget-pwd-form', ForgetPwdForm);

class RegisterForm extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.action = this.getAttribute('action') || '#';
        this.csrf = this.getAttribute('csrf') || '';
        this.theme = this.getAttribute('theme') || 'dark';
        this.borderRadius = this.getAttribute('border-radius') || this.getAttribute('radius') || '12px';
        
        this.loginUrl = this.getAttribute('login-url') || '#';
        this.termsUrl = this.getAttribute('terms-url') || '#';
        
        this.firstNamePlaceholder = this.getAttribute('first-name-placeholder') || 'First Name';
        this.lastNamePlaceholder = this.getAttribute('last-name-placeholder') || 'Last Name';
        this.emailPlaceholder = this.getAttribute('email-placeholder') || 'Email';
        this.phonePlaceholder = this.getAttribute('phone-placeholder') || 'Phone';
        this.passwordPlaceholder = this.getAttribute('password-placeholder') || 'Password';
        this.confirmPasswordPlaceholder = this.getAttribute('confirm-password-placeholder') || 'Confirm Password';
        this.captchaPlaceholder = this.getAttribute('captcha-placeholder') || 'Captcha';
        
        this.buttonText = this.getAttribute('button-text') || 'Sign Up';
        this.alreadyHaveAccountText = this.getAttribute('already-have-account-text') || 'Already have an account?';
        this.signInText = this.getAttribute('sign-in-text') || 'Sign In';
        
        this.errorMessage = this.getAttribute('error-message') || '';
        this.captchaErrorMessage = this.getAttribute('captcha-error-message') || '';

        this.firstNameRequiredText = this.getAttribute('first-name-required-text') || 'First name is required';
        this.lastNameRequiredText = this.getAttribute('last-name-required-text') || 'Last name is required';
        this.phoneRequiredText = this.getAttribute('phone-required-text') || 'Phone is required';
        this.emailRequiredText = this.getAttribute('email-required-text') || 'Email is required';
        this.emailInvalidText = this.getAttribute('email-invalid-text') || 'Please enter a valid email address';
        this.passwordRequiredText = this.getAttribute('password-required-text') || 'Password is required';
        this.confirmPasswordRequiredText = this.getAttribute('confirm-password-required-text') || 'Please confirm your password';
        this.passwordMismatchText = this.getAttribute('password-mismatch-text') || 'Passwords do not match';
        this.captchaRequiredText = this.getAttribute('captcha-required-text') || 'Captcha is required';
        this.termsRequiredText = this.getAttribute('terms-required-text') || 'Please accept the Terms & Conditions';

        this.render();
        this.bindEvents();
    }

    render() {
        this.shadowRoot.innerHTML = `
        ${getSharedStyles({ maxWidth: '650px', borderRadius: this.borderRadius, isAuth: true })}
        
        <form name="registerForm" id="registerForm" action="${this.action}" method="POST">
            <input type="hidden" name="_token" value="${this.csrf}">
            
            <div class="card">
                ${this.errorMessage ? `
                <div class="alert-error">
                    ${this.errorMessage}
                </div>
                ` : ''}

                <div class="grid-2">
                    <div class="form-group">
                        <label class="label">First Name</label>
                        <div class="input-wrap" id="first_name-wrap">
                            <input
                                type="text"
                                name="first_name"
                                id="first_name"
                                placeholder="${this.firstNamePlaceholder}"
                            />
                        </div>
                        <div class="error-message" id="first_name-error"></div>
                    </div>

                    <div class="form-group">
                        <label class="label">Last Name</label>
                        <div class="input-wrap" id="last_name-wrap">
                            <input
                                type="text"
                                name="last_name"
                                id="last_name"
                                placeholder="${this.lastNamePlaceholder}"
                            />
                        </div>
                        <div class="error-message" id="last_name-error"></div>
                    </div>
                </div>

                <div class="grid-2">
                    <div class="form-group">
                        <label class="label">Email</label>
                        <div class="input-wrap" id="email-wrap">
                            <input
                                type="text"
                                name="email"
                                id="email"
                                placeholder="${this.emailPlaceholder}"
                            />
                        </div>
                        <div class="error-message" id="email-error"></div>
                    </div>

                    <div class="form-group">
                        <label class="label">Phone</label>
                        <div class="input-wrap" id="phone-wrap">
                            <input
                                type="text"
                                inputmode="numeric"
                                minlength="10"
                                maxlength="12"
                                pattern="[0-9]{10,12}"
                                name="phone"
                                id="phone"
                                placeholder="${this.phonePlaceholder}"
                            />
                        </div>
                        <div class="error-message" id="phone-error"></div>
                    </div>
                </div>

                <div class="grid-2">
                    <div class="form-group">
                        <label class="label">Password</label>
                        <div class="input-wrap" id="password-wrap">
                            <input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="${this.passwordPlaceholder}"
                            />
                        </div>
                        <div class="error-message" id="password-error"></div>
                    </div>

                    <div class="form-group">
                        <label class="label">Confirm Password</label>
                        <div class="input-wrap" id="password_confirmation-wrap">
                            <input
                                type="password"
                                name="password_confirmation"
                                id="password_confirmation"
                                placeholder="${this.confirmPasswordPlaceholder}"
                            />
                        </div>
                        <div class="error-message" id="password_confirmation-error"></div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="label">Captcha</label>
                    <div class="captcha-row">
                        <div class="input-wrap" id="captcha-wrap">
                            <input
                                type="text"
                                name="captcha"
                                id="captcha"
                                placeholder="${this.captchaPlaceholder}"
                                autocomplete="off"
                            />
                        </div>
                        <div class="captcha-image-container">
                            <slot name="captcha"></slot>
                        </div>
                    </div>
                    <div class="error-message" id="captcha-error"></div>
                    ${this.captchaErrorMessage ? `
                    <div class="server-error">${this.captchaErrorMessage}</div>
                    ` : ''}
                </div>

                <div class="form-group">
                    <label class="terms-row" id="terms-row">
                        <input type="checkbox" id="terms" name="terms" value="1" />
                        <div class="terms-checkbox-custom"></div>
                        <span>I agree with the <a href="${this.termsUrl}" class="link" target="_blank">Terms & Conditions</a></span>
                    </label>
                    <div class="error-message" id="terms-error"></div>
                </div>

                <button type="submit">
                    ${this.buttonText}
                </button>

                <div class="footer-text">
                    ${this.alreadyHaveAccountText}
                    <a href="${this.loginUrl}" class="link">${this.signInText}</a>
                </div>
            </div>
        </form>
        `;
    }

    bindEvents() {
        const form = this.shadowRoot.querySelector('#registerForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        const fields = ['first_name', 'last_name', 'email', 'phone', 'password', 'password_confirmation', 'captcha'];
        fields.forEach(field => {
            const input = this.shadowRoot.querySelector(`#${field}`);
            input.addEventListener('input', () => this.clearError(field));
        });

        // Numeric filtering for phone field
        const phoneInput = this.shadowRoot.querySelector('#phone');
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        const termsInput = this.shadowRoot.querySelector('#terms');
        termsInput.addEventListener('change', () => this.clearError('terms'));
    }

    handleSubmit(e) {
        let isValid = true;
        
        const first_name = this.shadowRoot.querySelector('#first_name').value.trim();
        const last_name = this.shadowRoot.querySelector('#last_name').value.trim();
        const email = this.shadowRoot.querySelector('#email').value.trim();
        const phone = this.shadowRoot.querySelector('#phone').value.trim();
        const password = this.shadowRoot.querySelector('#password').value;
        const password_confirmation = this.shadowRoot.querySelector('#password_confirmation').value;
        const captcha = this.shadowRoot.querySelector('#captcha').value.trim();
        const terms = this.shadowRoot.querySelector('#terms').checked;

        if (!first_name) {
            this.showError('first_name', this.firstNameRequiredText);
            isValid = false;
        }

        if (!last_name) {
            this.showError('last_name', this.lastNameRequiredText);
            isValid = false;
        }

        if (!email) {
            this.showError('email', this.emailRequiredText);
            isValid = false;
        } else if (!this.validateEmail(email)) {
            this.showError('email', this.emailInvalidText);
            isValid = false;
        }

        if (!phone) {
            this.showError('phone', this.phoneRequiredText);
            isValid = false;
        }

        if (!password) {
            this.showError('password', this.passwordRequiredText);
            isValid = false;
        }

        if (!password_confirmation) {
            this.showError('password_confirmation', this.confirmPasswordRequiredText);
            isValid = false;
        } else if (password !== password_confirmation) {
            this.showError('password_confirmation', this.passwordMismatchText);
            isValid = false;
        }

        if (!captcha) {
            this.showError('captcha', this.captchaRequiredText);
            isValid = false;
        }

        if (!terms) {
            this.showError('terms', this.termsRequiredText);
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
        }
    }

    showError(field, message) {
        const inputWrap = this.shadowRoot.querySelector(`#${field}-wrap`) || this.shadowRoot.querySelector(`#${field}-row`);
        const errorEl = this.shadowRoot.querySelector(`#${field}-error`);
        if (inputWrap && errorEl) {
            inputWrap.classList.add('is-invalid');
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
    }

    clearError(field) {
        const inputWrap = this.shadowRoot.querySelector(`#${field}-wrap`) || this.shadowRoot.querySelector(`#${field}-row`);
        const errorEl = this.shadowRoot.querySelector(`#${field}-error`);
        if (inputWrap && errorEl) {
            inputWrap.classList.remove('is-invalid');
            errorEl.classList.remove('show');
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}

customElements.define('register-form', RegisterForm);
/**
 * BattlePass Premium Switcher Web Components
 * Natively supports glassmorphism theme, smooth animations, click-away closing, and active option checkmarks.
 */

// Shared Styles for both Web Components
const getSwitcherStyles = () => `
    <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css">
    <style>
        :host {
            display: inline-block;
            position: relative;
            font-family: 'Outfit', sans-serif;
            user-select: none;
        }

        .dropdown-container {
            position: relative;
        }

        .dropdown-trigger {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            height: 40px;
            padding: 0 14px;
            border: 1px solid rgba(45, 244, 161, 0.25);
            background: rgba(22, 40, 35, 0.88);
            color: #2df4a1;
            font-weight: 700;
            text-transform: uppercase;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: inherit;
            font-size: 14px;
            box-shadow: 0 0 10px rgba(45, 244, 161, 0.05);
            outline: none;
        }

        .dropdown-trigger:hover {
            border-color: #2df4a1;
            box-shadow: 0 0 15px rgba(45, 244, 161, 0.2);
            transform: translateY(-1px);
        }

        .dropdown-trigger:focus-visible {
            border-color: #2df4a1;
            box-shadow: 0 0 0 2px rgba(45, 244, 161, 0.4);
        }

        .dropdown-trigger:active {
            transform: translateY(0);
        }

        .trigger-label {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .caret-icon {
            font-size: 14px;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .caret-icon.rotated {
            transform: rotate(180deg);
        }

        .dropdown-menu {
            position: absolute;
            top: 48px;
            right: 0;
            background: rgba(7, 14, 11, 0.95);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(45, 244, 161, 0.2);
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(45, 244, 161, 0.08);
            display: flex;
            flex-direction: column;
            min-width: 150px;
            padding: 6px 0;
            z-index: 1000;
            visibility: hidden;
            opacity: 0;
            transform: translateY(8px);
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.25s;
        }

        .dropdown-menu.open {
            visibility: visible;
            opacity: 1;
            transform: translateY(0);
        }

        .dropdown-item {
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.85);
            padding: 10px 16px;
            font-size: 13px;
            font-weight: 600;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            text-transform: uppercase;
            outline: none;
        }

        .dropdown-item:hover {
            background: rgba(45, 244, 161, 0.1);
            color: #2df4a1;
        }

        .dropdown-item:focus-visible {
            background: rgba(45, 244, 161, 0.1);
            color: #2df4a1;
        }

        .dropdown-item.active {
            color: #2df4a1;
            background: rgba(45, 244, 161, 0.05);
        }

        .check-icon {
            font-size: 14px;
            color: #2df4a1;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .dropdown-item.active .check-icon {
            opacity: 1;
        }
    </style>
`;

// 1. Currency Switcher Custom Element
class CurrencySwitcher extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isOpen = false;
        this.currencies = [];
        this.activeCode = '';
        this.redirectPattern = '';
    }

    static get observedAttributes() {
        return ['active-code', 'currencies', 'redirect-pattern'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.updateProperties();
            this.render();
        }
    }

    connectedCallback() {
        this.updateProperties();
        this.render();
        this.setupEvents();
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.clickAwayHandler);
    }

    updateProperties() {
        this.activeCode = this.getAttribute('active-code') || 'USD';
        this.redirectPattern = this.getAttribute('redirect-pattern') || '';
        try {
            this.currencies = JSON.parse(this.getAttribute('currencies') || '[]');
        } catch (e) {
            console.error('Invalid JSON for currencies attribute', e);
            this.currencies = [];
        }
    }

    toggleDropdown() {
        this.isOpen = !this.isOpen;
        const menu = this.shadowRoot.querySelector('.dropdown-menu');
        const caret = this.shadowRoot.querySelector('.caret-icon');
        if (this.isOpen) {
            menu.classList.add('open');
            caret.classList.add('rotated');
        } else {
            menu.classList.remove('open');
            caret.classList.remove('rotated');
        }
    }

    closeDropdown() {
        this.isOpen = false;
        const menu = this.shadowRoot.querySelector('.dropdown-menu');
        const caret = this.shadowRoot.querySelector('.caret-icon');
        if (menu) menu.classList.remove('open');
        if (caret) caret.classList.remove('rotated');
    }

    setupEvents() {
        const trigger = this.shadowRoot.querySelector('.dropdown-trigger');
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Handle click away to close
        this.clickAwayHandler = (e) => {
            const path = e.composedPath();
            if (!path.includes(this)) {
                this.closeDropdown();
            }
        };
        document.addEventListener('click', this.clickAwayHandler);
    }

    handleSelect(code) {
        this.closeDropdown();
        if (this.redirectPattern) {
            const redirectUrl = this.redirectPattern.replace('__VALUE__', encodeURIComponent(code));
            window.location.href = redirectUrl;
        } else {
            // Fallback to custom event if redirect pattern is not provided
            this.dispatchEvent(new CustomEvent('currency-change', {
                detail: { code },
                bubbles: true,
                composed: true
            }));
            this.setAttribute('active-code', code);
        }
    }

    render() {
        const activeCurrency = this.currencies.find(c => c.code === this.activeCode) || { code: this.activeCode, symbol: '$' };
        
        const optionsHtml = this.currencies.map(c => `
            <button class="dropdown-item ${c.code === this.activeCode ? 'active' : ''}" data-code="${c.code}">
                <span>${c.symbol} ${c.code}</span>
                <i class="ph ph-check check-icon"></i>
            </button>
        `).join('');

        this.shadowRoot.innerHTML = `
            ${getSwitcherStyles()}
            <div class="dropdown-container">
                <button class="dropdown-trigger" aria-label="Select Currency">
                    <i class="ph ph-currency-circle-dollar"></i>
                    <span class="trigger-label">${activeCurrency.symbol} ${activeCurrency.code}</span>
                    <i class="ph ph-caret-down caret-icon"></i>
                </button>
                <div class="dropdown-menu">
                    ${optionsHtml}
                </div>
            </div>
        `;

        // Bind items click events
        this.shadowRoot.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                this.handleSelect(item.dataset.code);
            });
        });
    }
}

// 2. Language Switcher Custom Element
class LanguageSwitcher extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isOpen = false;
        this.languages = [];
        this.activeCode = '';
        this.redirectPattern = '';
    }

    static get observedAttributes() {
        return ['active-code', 'languages', 'redirect-pattern'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.updateProperties();
            this.render();
        }
    }

    connectedCallback() {
        this.updateProperties();
        this.render();
        this.setupEvents();
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.clickAwayHandler);
    }

    updateProperties() {
        this.activeCode = this.getAttribute('active-code') || 'en';
        this.redirectPattern = this.getAttribute('redirect-pattern') || '';
        try {
            this.languages = JSON.parse(this.getAttribute('languages') || '[]');
        } catch (e) {
            console.error('Invalid JSON for languages attribute', e);
            this.languages = [];
        }
    }

    toggleDropdown() {
        this.isOpen = !this.isOpen;
        const menu = this.shadowRoot.querySelector('.dropdown-menu');
        const caret = this.shadowRoot.querySelector('.caret-icon');
        if (this.isOpen) {
            menu.classList.add('open');
            caret.classList.add('rotated');
        } else {
            menu.classList.remove('open');
            caret.classList.remove('rotated');
        }
    }

    closeDropdown() {
        this.isOpen = false;
        const menu = this.shadowRoot.querySelector('.dropdown-menu');
        const caret = this.shadowRoot.querySelector('.caret-icon');
        if (menu) menu.classList.remove('open');
        if (caret) caret.classList.remove('rotated');
    }

    setupEvents() {
        const trigger = this.shadowRoot.querySelector('.dropdown-trigger');
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Handle click away to close
        this.clickAwayHandler = (e) => {
            const path = e.composedPath();
            if (!path.includes(this)) {
                this.closeDropdown();
            }
        };
        document.addEventListener('click', this.clickAwayHandler);
    }

    handleSelect(code) {
        this.closeDropdown();
        if (this.redirectPattern) {
            const redirectUrl = this.redirectPattern.replace('__VALUE__', encodeURIComponent(code));
            window.location.href = redirectUrl;
        } else {
            // Fallback to custom event
            this.dispatchEvent(new CustomEvent('language-change', {
                detail: { code },
                bubbles: true,
                composed: true
            }));
            this.setAttribute('active-code', code);
        }
    }

    render() {
        const activeLang = this.languages.find(l => l.code === this.activeCode) || { code: this.activeCode, label: this.activeCode.toUpperCase() };

        const optionsHtml = this.languages.map(l => `
            <button class="dropdown-item ${l.code === this.activeCode ? 'active' : ''}" data-code="${l.code}">
                <span>${l.label}</span>
                <i class="ph ph-check check-icon"></i>
            </button>
        `).join('');

        this.shadowRoot.innerHTML = `
            ${getSwitcherStyles()}
            <div class="dropdown-container">
                <button class="dropdown-trigger" aria-label="Select Language">
                    <i class="ph ph-translate"></i>
                    <span class="trigger-label">${activeLang.label}</span>
                    <i class="ph ph-caret-down caret-icon"></i>
                </button>
                <div class="dropdown-menu">
                    ${optionsHtml}
                </div>
            </div>
        `;

        // Bind items click events
        this.shadowRoot.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                this.handleSelect(item.dataset.code);
            });
        });
    }
}

// Define the Custom Elements in the global window context
customElements.define('currency-switcher', CurrencySwitcher);
customElements.define('language-switcher', LanguageSwitcher);
