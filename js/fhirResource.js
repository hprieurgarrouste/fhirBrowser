customElements.define('fhir-resource', class FhirResource extends HTMLElement {
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
                #toolbar {
                    padding: 0.5em;                    
                    text-align: right;
                }
                #content {
                    background-color: var(--background-color, inherit);
                    color: var(--text-color-normal, black);
                    flex: 1 1 auto;
                    font-family: monospace;
                    height:0;
                    overflow: auto;
                    padding: 0 8px;
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
                <div id = "toolbar" >
                    <app-round-button id="share" title="Share">share</app-round-button>
                    <app-round-button id="copy" title="Copy to clipboard">content_copy</app-round-button>
                    <app-round-button id="download" title="Download">download</app-round-button>
                </div>
                <div id="content"></div>
            </div>
        `;
    }
    connectedCallback() {
        this._shadow.getElementById('download').addEventListener("click", () => {
            const file = new File([JSON.stringify(this._resource)], this._resource.id, {
                type: 'data:text/json;charset=utf-8',
            });
            const url = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${this._resource.resourceType}#${file.name}.json`;
            this._shadow.appendChild(link);
            link.click();
            this._shadow.removeChild(link);
            window.URL.revokeObjectURL(url);
        });
        this._shadow.getElementById('copy').addEventListener("click", () => {
            navigator.clipboard.writeText(JSON.stringify(this._resource)).then(function () {
                console.log('Async: Copying to clipboard was successful!');
            }, function (err) {
                console.error('Async: Could not copy text: ', err);
            });
        });
        this._shadow.getElementById('share').addEventListener("click", () => {
            const fileName = `${this._resource.resourceType}.${this._resource.id}.txt`;
            const file = new File([JSON.stringify(this._resource)], fileName, { type: 'text/plain' });
            navigator.share({
                "title": fileName,
                "files": [file]
            }).then(() => {
                console.log('sharing was successful!');
            }, (err) => {
                console.error('Could not share resource: ', err);
            });;
        });
    }
    /**
     * @param {object} object
     */
    set source(object) {
        parse(this._shadow.getElementById("content"), object);
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
