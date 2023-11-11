import template from "./templates/ListFilter.html";

class ListFilter extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }
    connectedCallback() {
        const text = this._shadow.getElementById("text");
        this._shadow.getElementById("clear").addEventListener('click', () => {
            if (text.value) {
                text.value = '';
                fireChange.call(this);
            }
        });
        this._shadow.querySelector("main").addEventListener('mousedown', (event) => {
            text.focus();
        });
        text.addEventListener("input", fireChange.bind(this));
        function fireChange(event) {
            this.dispatchEvent(new CustomEvent("filterChanged", {
                bubbles: false,
                cancelable: false,
                'detail': {
                    'text': text.value
                }
            }));
        }
    }
    clear() {
        this._shadow.getElementById("clear").click();
    }
};

customElements.define('list-filter', ListFilter)
