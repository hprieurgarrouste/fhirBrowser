import template from "./templates/ListFilter.html";

class ListFilter extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._text = this._shadow.getElementById("text");
        this._shadow.querySelector("main").addEventListener('mousedown', (event) => {
            this._text.focus();
        });
        this._shadow.getElementById("clear").onclick = this.clearClick;
        this._text.addEventListener("input", () => { this._onChange(this._text.value) });
    }

    clearClick = () => {
        if (this._text.value) {
            this._text.value = '';
            this._onChange(this._text.value);
        }
    }

    clear() {
        this._shadow.getElementById("clear").click();
    }

    _onChange = () => { };
    get onChange() {
        return this._onChange;
    }
    set onChange(changeFct) {
        this._onChange = changeFct;
    }
};

customElements.define('list-filter', ListFilter)
