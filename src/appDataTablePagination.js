customElements.define('app-data-table-pagination', class AppDataTablePagination extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(AppDataTablePaginationTemplate.content.cloneNode(true));
    }
    connectedCallback() {
        this._shadow.getElementById('wrapper').addEventListener('click', (event) => {
            let target = event.target;
            while (target && target.nodeName !== 'BUTTON') target = target.parentNode;
            if (target && !target.disabled) {
                this.dispatchEvent(new CustomEvent("pagination", {
                    bubbles: false,
                    cancelable: false,
                    "detail": {
                        "button": target.id
                    }
                }))
            }
        });
    }
    /**
     * @param {boolean} enable
     */
    set first(enable) {
        this._shadow.getElementById('first').disabled = !enable;
    }
    /**
     * @param {boolean} enable
     */
    set previous(enable) {
        this._shadow.getElementById('previous').disabled = !enable;
    }
    /**
     * @param {boolean} enable
     */
    set next(enable) {
        this._shadow.getElementById('next').disabled = !enable;
    }
    /**
     * @param {boolean} enable
     */
    set last(enable) {
        this._shadow.getElementById('last').disabled = !enable;
    }
    /**
     * @param {string} text
     */
    set text(text) {
        this._shadow.getElementById('text').innerText = text;
    }
});

const AppDataTablePaginationTemplate = document.createElement('template');
AppDataTablePaginationTemplate.innerHTML = `
    <link rel="stylesheet" href="./material.css">
    <style>
        #wrapper {
            padding: 12px;
            font-family: inherit;
            font-size: .875rem;
        }
        button {
            border:0;
            background:none;
            vertical-align:middle;
            cursor:pointer;
            color:var(--text-color-normal);
        }
        button[disabled] {
            cursor: default;
            color:var(--text-color-disabled);
        }
        span {
            vertical-align:middle;
            margin: 0 24px;
        }
    </style>
    <div id="wrapper">
        <span id="text"></span>
        <button id="first" title="first" disabled><i class="material-icons">first_page</i></button>
        <button id="previous" title="previous" disabled><i class="material-icons">chevron_left</i></button>
        <button id="next" title="next" disabled><i class="material-icons">chevron_right</i></button>
        <button id="last" title="last" disabled><i class="material-icons">last_page</i></button>
    </div>
`;