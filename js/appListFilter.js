customElements.define('app-list-filter', class AppListFilter extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = `
            <link href="./material.css" rel="stylesheet"/>
            <style>
                #wrapper {
                    background-color: rgba(var(--text-color, black), 4%);
                    border: 1px solid transparent;
                    display: flex;
                    padding: 0.7em;
                    font-size: smaller;
                }
                #wrapper:focus-within {
                    border-bottom-color: var(--primary-color, black);
                }
                #text {
                    background: none;
                    border: 0 none;
                    color: var(--text-color-normal);
                    flex: 1 1 auto;
                    font-family: inherit;
                    font-size: inherit;
                }
                #text:focus {
                    outline: none; 
                }
                #clear {
                    cursor: pointer;
                    font-size: inherit;
                    line-height: unset;
                }
            </style>
            <div id="wrapper">
                <input id="text" type="text" placeholder="Type to filter"/>
                <i id="clear" class="material-icons" title="clear">close</i>
            </div>
        `;
    }
    connectedCallback() {
        const text = this._shadow.getElementById("text");
        this._shadow.getElementById("clear").addEventListener('click', () => {
            if (text.value) {
                text.value = '';
                fireChange.call(this);
            }
        });
        this._shadow.getElementById("wrapper").addEventListener('mousedown', (event) => {
            event.preventDefault();
            event.stopPropagation();
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
});
