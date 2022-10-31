customElements.define('fhir-resource-json', class FhirResourceJson extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(FhirResourceJsonTemplate.content.cloneNode(true));
    }
    connectedCallback() {
        this._shadow.getElementById("content").addEventListener('click', ({ target }) => {
            const dt = target.closest('dt');
            if (dt && (dt.classList.contains("array") || dt.classList.contains("object")))
                dt.classList.toggle("collapsed");
        });
    }
    /**
     * @param {object} resource
     */
    set source(resource) {
        const content = this._shadow.getElementById("content");
        content.scrollTo(0, 0);
        content.innerHTML = "";
        content.appendChild(document.createTextNode("{"));
        content.appendChild(parse(resource));
        content.appendChild(document.createTextNode("}"));

        function parse(obj) {
            let dl = document.createElement('dl');
            for (const [key, value] of Object.entries(obj)) {
                const dt = document.createElement('dt');

                const keyElm = document.createElement('span');
                keyElm.className = "key";
                keyElm.innerText = key;
                dt.appendChild(keyElm);

                const valueElm = document.createElement('span');
                valueElm.classList.add("value");
                if ("string" === typeof (value)) {
                    valueElm.classList.add("string");
                    valueElm.innerText = value;
                } else if ("object" === typeof (value)) {
                    dt.classList.add(Array.isArray(value) ? "array" : "object");
                    valueElm.appendChild(parse(value));
                } else {
                    valueElm.innerText = value;
                }
                dt.appendChild(valueElm);

                dl.appendChild(dt);
            }
            return dl;
        }
    }
});

const FhirResourceJsonTemplate = document.createElement('template');
FhirResourceJsonTemplate.innerHTML = `
    <link rel="stylesheet" href="./assets/material.css">
    <style>
        main {
            --indent: 1.3em;
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
            white-space: nowrap;
        }
        dl {
            margin: 0;
            padding-left: var(--indent);
        }
        dt {
            list-style-type: none;
        }
        span {
            color: var(--json-viewer-values-color, black);
            cursor: inherit;
        }
        span.key {
            color: var(--json-viewer-properties-color, black);
        }
        span.key::before {
            content: '"';
        }
        span.key::after {
            content: '": ';
        }
        dt.array > span.value > dl > dt > span.key::before {
            content: '';
        }
        dt.array > span.value > dl > dt > span.key::after {
            content: ': ';
        }
        span.value.string::before {
            content: '"';
        }
        span.value.string::after {
            content: '"';
        }
        dt.array > span.value::before {
            content: '[';
        }
        dt.array > span.value::after {
            content: ']';
        }
        dt.object > span.value::before {
            content: '{';
        }
        dt.object > span.value::after {
            content: '}';
        }
        dt,
        dt.array > span.value::after,
        dt.object > span.value::after {
            padding-left: var(--indent);
        }
        dt.array,
        dt.object {
            cursor: pointer;
            padding-left: 0;
        }
        dt.array::before,
        dt.object::before {
            content: 'expand_less ';
            font-family: 'Material Icons';
            font-weight: bold;
            line-height: inherit;
            vertical-align: middle;
            color: var(--text-color-disabled, black);
        }
        dt:not(:last-child)::after {
            content: ",";
        }
        dt.collapsed::before {
            content: 'expand_more ';
        }
        dt.collapsed > span dl {
            display: none;
        }
        dt.array.collapsed span.value::after {
            content: '...]';
            padding-left: 0;
        }
        dt.object.collapsed span.value::after {
            content: '...}';
            padding-left: 0;
        }
        @media (max-width:480px){
            #content {
                line-height: 2em;
            }
        }
    </style>
    <main>
        <div id="content"></div>
    </main>
`;