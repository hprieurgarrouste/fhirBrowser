customElements.define('fhir-server-info', class FhirServerInfo extends HTMLElement {
    constructor() {
        super();
        this.serverChangeEvent = new CustomEvent("serverchange", {
            bubbles: false,
            cancelable: false,
        });
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = `
            <link href="./material.css" rel="stylesheet"/>
            <style>
                #wrapper {
                    padding:25px;
                }
                #store {
                    border: 1px solid rgba(0,0,0,38%);
                    font-family: inherit;
                    font-size: 1em;
                    color: var(--text-color-normal, rgb(0,0,0,87%));
                    border-radius: 4px;
                    padding: 8px 5px 5px 5px;
                    width: 100%;
                }
                #store:hover {
                    border-color: rgba(0,0,0,87%);
                }
                #store:active {
                    outline-style: auto;
                    outline-color: var(--primary-color, black);
                }
                #store:focus-visible {
                    outline-color: var(--primary-color, black);
                }
                #store-wrapper {
                    position:relative;
                }
                #store-label {
                    position: absolute;
                    top: -0.8em;
                    left: 0.5em;
                    background-color: var(--background-color, white);
                    font-size: 0.7em;   
                    font-family: inherit;
                    padding: 0 5px;"
                }
                #url {
                    overflow-wrap: break-word;
                    color: var(--text-color-disabled);
                    font-size: 0.9em;
                    margin-top: 0.5em;
                }
            </style>
            <div id="wrapper">
                <div id="store-wrapper">
                    <label id="store-label">FHIR store</label>
                    <select id="store"><option/></select>
                </div>
                <div id="url"></div>
            </div>
        `;
        this._store = this._shadow.getElementById("store");
        this._store.addEventListener("change", () => {
            this._shadow.getElementById("url").innerText = this._conf[this._store.value].url;
            this.dispatchEvent(new CustomEvent("serverchange", {
                bubbles: false,
                cancelable: false,
                'detail': {
                    server: this._store.value
                }
            }));
        });
    }
    /**
     * @param {object} conf
     */
    setup(conf) {
        this._conf = conf;
        for (const key of Object.keys(conf).sort()) {
            const opt = document.createElement('OPTION');
            opt.setAttribute("value", key);
            opt.appendChild(document.createTextNode(key));
            this._store.appendChild(opt);
        }
    }

});
