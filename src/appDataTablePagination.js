import "./appRoundButton.js";

customElements.define('app-data-table-pagination', class AppDataTablePagination extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(AppDataTablePaginationTemplate.content.cloneNode(true));
    }
    connectedCallback() {
        this._shadow.querySelector('main').addEventListener('click', ({ target }) => {
            const btn = target.closest("app-round-button");
            if (btn) {
                this.dispatchEvent(new CustomEvent("pagination", {
                    bubbles: false,
                    cancelable: false,
                    "detail": {
                        "button": btn.id
                    }
                }))
            }
        });
    }
    /**
     * @param {boolean} enable
     */
    set first(enable) {
        this.setDisabled('first', !enable);
    }
    /**
     * @param {boolean} enable
     */
    set previous(enable) {
        this.setDisabled('previous', !enable);
    }
    /**
     * @param {boolean} enable
     */
    set next(enable) {
        this.setDisabled('next', !enable);
    }
    /**
     * @param {boolean} enable
     */
    set last(enable) {
        this.setDisabled('last', !enable);
    }

    /**
     * @param {string} text
     */
    set text(text) {
        this._shadow.getElementById('text').innerText = text;
    }

    setDisabled(name, value) {
        const elm = this._shadow.getElementById(name);
        if (value) {
            elm.setAttribute('disabled', '');
        } else {
            elm.removeAttribute('disabled');
        }
    }
});

const AppDataTablePaginationTemplate = document.createElement('template');
AppDataTablePaginationTemplate.innerHTML = `
    <link rel="stylesheet" href="./material.css">
    <style>
        main {
            align-items: center;
            display: flex;
            flex-direction:row;
            font-family: inherit;
            font-size: .875rem;
            padding: 0.5em;
        }
        span {
            margin: 0 24px;
            flex: auto;
        }
    </style>
    <main>
        <span id="text"></span>
        <app-round-button id="first" title="first" disabled app-icon="first_page"></app-round-button>
        <app-round-button id="previous" title="previous" disabled app-icon="chevron_left"></app-round-button>
        <app-round-button id="next" title="next" disabled app-icon="chevron_right"></app-round-button>
        <app-round-button id="last" title="last" disabled app-icon="last_page"></app-round-button>
    </main>
`;