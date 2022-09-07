customElements.define('fhir-server-selector', class FhirServerSelector extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = `
            <link href="./material.css" rel="stylesheet"/>
            <style>
                #wrapper {
                    padding:25px;
                }
                #server {
                    background-color: var(--background-color, white);
                    border: 1px solid rgba(0,0,0,38%);
                    border-radius: 4px;
                    color: var(--text-color-normal, rgb(0,0,0,87%));
                    font-family: inherit;
                    font-size: 1em;
                    padding: 8px 5px 5px 5px;
                    width: 100%;
                }
                #server:hover {
                    border-color: rgba(0,0,0,87%);
                }
                #server:active {
                    outline-style: auto;
                    outline-color: var(--primary-color, black);
                }
                #server:focus-visible {
                    outline-color: var(--primary-color, black);
                }
                #server-wrapper {
                    position:relative;
                }
                #server-label {
                    position: absolute;
                    top: -0.8em;
                    left: 0.5em;
                    background-color: var(--background-color, white);
                    font-size: 0.7em;   
                    font-family: inherit;
                    padding: 0 5px;"
                }
                #server-url {
                    overflow-wrap: break-word;
                    color: var(--text-color-disabled);
                    font-size: 0.9em;
                    margin-top: 0.5em;
                }
            </style>
            <div id="wrapper">
                <div id="server-wrapper">
                    <label id="server-label">FHIR server</label>
                    <select id="server"><option/></select>
                </div>
                <div id="server-url"></div>
            </div>
        `;
        this._server = this._shadow.getElementById("server");
        this._server.addEventListener("change", () => {
            this._shadow.getElementById("server-url").innerText = this._conf[this._server.value].url;
            this.dispatchEvent(new CustomEvent("serverchanged", {
                bubbles: false,
                cancelable: false,
                'detail': {
                    server: this._server.value
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
            this._server.appendChild(opt);
        }
    }

});
