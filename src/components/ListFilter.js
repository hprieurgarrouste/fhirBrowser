import template from "./templates/ListFilter.html";

class ListFilter extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._onChange = () => { };
    }
    connectedCallback() {
        const text = this._shadow.getElementById("text");
        this._shadow.querySelector("main").addEventListener('mousedown', (event) => {
            text.focus();
        });
        this._shadow.getElementById("clear").addEventListener('click', () => {
            if (text.value) {
                text.value = '';
                this._onChange(text.value);
            }
        });
        text.addEventListener("input", () => { this._onChange(text.value) });
    }
    clear() {
        this._shadow.getElementById("clear").click();
    }
    get onChange() {
        return this._onChange;
    }
    set onChange(changeFct) {
        this._onChange = changeFct;
    }
};

customElements.define('list-filter', ListFilter)
