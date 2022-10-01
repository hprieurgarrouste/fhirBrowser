import "./appRoundButton.js";

customElements.define('fhir-resource-json', class FhirResourceJson extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = `
            <link rel="stylesheet" href="./material.css">
            <style>
                #wrapper {
                    display:flex;
                    flex-direction:column;
                    height:100%;
                }
                #content {
                    background-color: var(--background-color, inherit);
                    color: var(--text-color-normal, black);
                    flex: 1 1 auto;
                    font-family: monospace;
                    height:0;
                    overflow: auto;
                    padding: 1em;
                    white-space: nowrap;
                }
                dl {
                    margin: 0;
                    padding-left: 1.5em;
                }
                dt {
                    list-style-type: none;
                }
                span:first-of-type {
                    color: var(--json-viewer-properties-color, black);
                }
                span {
                    color: var(--json-viewer-values-color, black);
                }
            </style>
            <div id="wrapper">
                <div id="content"></div>
            </div>
        `;
    }
    /**
     * @param {object} resource
     */
    set source(resource) {
        const content = this._shadow.getElementById("content");
        while (content.firstChild) content.removeChild(content.lastChild);
        content.scrollTo(0, 0);
        parse(content, resource);
        function parse(parent, obj) {
            let isArray = Array.isArray(obj);
            parent.appendChild(document.createTextNode(isArray ? '[' : '{'));
            let dl = document.createElement('dl');
            for (const [key, value] of Object.entries(obj)) {
                const dt = document.createElement('dt');
                if (!isArray) {
                    const elm = document.createElement('span');
                    elm.innerText = `"${key}"`;
                    dt.appendChild(elm);
                    dt.appendChild(document.createTextNode(": "));
                }
                if (typeof value === 'object') {
                    parse(dt, value);
                } else {
                    const elm = document.createElement('span');
                    elm.innerText = (typeof (value) === 'string' ? `"${value}"` : value);
                    dt.appendChild(elm);
                }
                const prev = dl.lastElementChild;
                if (prev && prev.nodeName == dt.nodeName) {
                    prev.appendChild(document.createTextNode(","));
                }
                dl.appendChild(dt);
            }
            parent.appendChild(dl);
            parent.appendChild(document.createTextNode(isArray ? ']' : '}'));
        }
    }
});
