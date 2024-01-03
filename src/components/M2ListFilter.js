import template from "./templates/M2ListFilter.html"

class M2ListFilter extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this._text = shadow.getElementById("text");
        this._text.addEventListener("input", () => {
            this._onChange(this._text.value)
        });

        shadow.querySelector("main").addEventListener('mousedown', (event) => {
            this._text.focus();
        });

        shadow.getElementById("clear").onclick = this.clearClick;
    }

    clearClick = () => {
        if (this._text.value) {
            this._text.value = '';
            this._onChange(this._text.value);
        }
    }

    clear() {
        this.clearClick();
    }

    _onChange = () => { };
    get onChange() {
        return this._onChange;
    }
    set onChange(changeFct) {
        this._onChange = changeFct;
    }
};

customElements.define('m2-list-filter', M2ListFilter)
