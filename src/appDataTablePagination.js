customElements.define('app-data-table-pagination', class AppDataTablePagination extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(AppDataTablePaginationTemplate.content.cloneNode(true));
    }
    connectedCallback() {
        this._shadow.querySelector('main').addEventListener('click', ({ target }) => {
            const btn = target.closest("i");
            if (btn && !btn.hasAttribute("disabled")) {
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
        i {
            background:none;
            border:0;
            color:var(--text-color-normal);
            padding:8px;
            text-align:center;
        }
        i:not([disabled]):hover {
            background-color:var(--hover-color, rgba(0,0,0,5%));
            border-radius: 50%;
            cursor:pointer;
        }
        i[disabled] {
            color:var(--text-color-disabled);
            cursor: default;
        }
        span {
            vertical-align:middle;
            margin: 0 24px;
            flex: auto;
        }
    </style>
    <main>
        <span id="text"></span>
        <i id="first" title="first" disabled class="material-icons">first_page</i>
        <i id="previous" title="previous" disabled class="material-icons">chevron_left</i>
        <i id="next" title="next" disabled class="material-icons">chevron_right</i>
        <i id="last" title="last" disabled class="material-icons">last_page</i>
    </main>
`;