(function () {
    class FhirResourceXml extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
        }
        connectedCallback() {
            // todo
        }
        /**
         * @param {object} resource
         */
        set source(resource) {
            const content = this._shadow.getElementById("content");
            const serializer = new XMLSerializer();
            content.scrollTo(0, 0);
            content.innerText = serializer.serializeToString(resource);
        }
    };

    const template = document.createElement('template');
    template.innerHTML = `
        <link rel="stylesheet" href="./assets/material.css">
        <style>
            main {
                display:flex;
                flex-direction:column;
                height:100%;
            }
            #content {
                box-shadow: inset 0px 2px 4px 0px var(--border-color);
                color: var(--text-color-normal, black);
                flex: 1 1 auto;
                font-family: monospace;
                height:0;
                overflow: auto;
                padding: 1em;
                white-space: pre-wrap;
                margin:0;
            }
            @media (max-width:480px){
                #content {
                    line-height: 2em;
                }
            }
        </style>
        <main>
            <pre id="content"></pre>
        </main>
    `;

    window.customElements.define('fhir-resource-xml', FhirResourceXml);
})();

