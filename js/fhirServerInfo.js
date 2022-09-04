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
                i {
                    color: var(--primary-color);
                    background-color: var(--hover-color, rgba(0, 0, 0, 5%));
                    border-radius: 50%;
                    padding: 15px;
                    float: left;
                    margin: 0 16px 16px 0;
                    max-width:54px;
                }
                select {
                    border: 1px solid rgba(0,0,0,38%);
                    font-family: inherit;
                    font-size: 1em;
                    color: var(--text-color-normal, rgb(0,0,0,87%));
                    border-radius: 4px;
                    padding: 5px;
                    width: 10em;
                }
                select:hover {
                    border-color: rgba(0,0,0,87%);
                }
                select:active {
                    outline-style: auto;
                    outline-color: var(--primary-color, black);
                }
                select:focus-visible {
                    outline-color: var(--primary-color, black);
                }
            </style>
            <div>
                <i class="material-icons">storage</i>
                <select id="server"><option/></select>
                <div id="title"></div>
                <div id="subtitle"></div>
            </div>
        `;
        this._server = this._shadow.getElementById("server");
        this._server.addEventListener("change", () => {
            this._shadow.getElementById("title").innerText = '';
            this._shadow.getElementById("subtitle").innerText = '';
            this.dispatchEvent(new CustomEvent("serverchange", {
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
     * @param {string} serverKey
     */
    setup(conf) {
        for (const key of Object.keys(conf).sort()) {
            const opt = document.createElement('OPTION');
            opt.setAttribute("value", key);
            opt.appendChild(document.createTextNode(key));
            this._server.appendChild(opt);
        }
    }

    /**
     * @param {string} server
     */
    set server(server) {
        this._shadow.getElementById("title").innerText = server.metadata.software ? server.metadata.software.name : server.metadata.publisher;
        this._shadow.getElementById("subtitle").innerText = server.version;
    }
});
