import "./appJsonViewer.js";

customElements.define('fhir-json-viewer', class FhirJsonViewer extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = `
            <link rel="stylesheet" href="./material.css">
            <style>
                #wrapper {
                    display:flex;
                    height:100%;
                    flex-direction:column;
                }
                #toolbar {
                    text-align: right;
                    padding: 0.5em;                    
                }
                #toolbar > i {
                    vertical-align: middle;
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    padding: 5px;
                }
                #toolbar > i:hover {
                    cursor: pointer;
                    background-color: var(--hover-color, rgba(0, 0, 0, 5%));
                }
                #viewer {
                    flex: 1 1 auto;
                    height:0;
                    overflow:auto;
                }
            </style>
            <div id="wrapper">
                <div id = "toolbar" >
                    <app-round-button id="copy" title="copy to clipboard">content_copy</app-round-button>
                    <app-round-button id="download" title="download">download</app-round-button>
                </div >
                <json-viewer id="viewer"/>
            </div>
        `;
        this._resource = null;
        this._structureDefinition = null;
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
    }
    /**
     * @param {object} FhirResource
     */
    set source(FhirResource) {
        this._resource = FhirResource;
        this._shadow.getElementById('viewer').source = FhirResource;
    }
    /**
     * @param {object} json
     */
    set structureDefinition(json) {
        this._structureDefinition = json;
    }

    buildKey(key) {
        const target = super.buildKey(key);
        if (this._structureDefinition) {
            this._structureDefinition.snapshot.element.some(element => {
                if (element.id == `${this._resource.resourceType}.${key}`) {
                    target.title = element.definition;
                    target.style.cursor = "help";
                    target.style.fontWeight = "bold";
                    return true;
                }
            });
        }
        return target;
    }

});