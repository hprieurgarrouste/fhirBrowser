import template from "./templates/M2Badge.html"

class M2Badge extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template;
        this._content = shadow.querySelector("main");
        this._value = null;
    }

    connectedCallback() {
        this.render();
    }

    render = () => {
        if (!this._content) return;
        if (this._value == null || this._value == undefined || this._value.length == 0) {
            this._content.innerText = '?';
            this.title = this._value;
            return;
        }
        const formatted = formatNumber(this._value);
        this._content.innerText = formatted;
        this.title = (this._value != formatted) ? this._value : '';

        function formatNumber(num, precision = 0) {
            const map = [
                { suffix: 'T', threshold: 1e12 },
                { suffix: 'B', threshold: 1e9 },
                { suffix: 'M', threshold: 1e6 },
                { suffix: 'K', threshold: 1e3 },
                { suffix: '', threshold: 1 },
            ];

            const found = map.find((x) => Math.abs(num) >= x.threshold);
            if (found) {
                const formatted = (num / found.threshold).toFixed(precision) + found.suffix;
                return formatted;
            }
            return num;
        }
    }

    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
        this.render();
    }
}
window.customElements.define('m2-badge', M2Badge);