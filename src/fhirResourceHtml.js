import Mustache from "mustache";

customElements.define('fhir-resource-html', class FhirResourceHtml extends HTMLElement {
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
                    padding: 1em;
                    flex: 1 1 auto;
                    height:0;
                    overflow: auto;
                }
                #content pre {
                    background-color:#fff;
                    border-radius: 4px;
                    box-shadow: 0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);
                    font-family: monospace;
                    padding: 0.5em;
                }
                #content pre code {
                    color: black;
                }
                #content img {
                    background-color:#fff;
                    border-radius: 4px;
                    box-shadow: 0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);
                }
            </style>
            <div id="wrapper">
                <div id="content"></div>
            </div>
        `;
    }

    connectedCallback() {

    }

    /**
     * @param {Object} resource
     */
    set source(resource) {
        let result = "<i>Work in progress : Mustache template</i>";
        if (resource.resourceType === 'Binary') {
            result = parseBinary();
        }
        this._shadow.getElementById('content').innerHTML = result;

        function parseBinary() {
            const templates = {
                "image": `<img src="data:{{contentType}};base64,{{data}}"/>`,
                "xml": `<label>Id: </label><span>{{id}}</span><br/>
                            <label>Version: </label><span>{{meta.versionId}}</span><br/>
                            <label>lastUpdated: </label><span>{{meta.lastUpdated}}</span><br/>
                            <pre><code>{{data}}</code></pre>`,
                "default": `<label>Id: </label><span>{{id}}</span><br/>
                            <label>Version: </label><span>{{meta.versionId}}</span><br/>
                            <label>lastUpdated: </label><span>{{meta.lastUpdated}}</span><br/>
                            <pre>{{data}}</pre>`,
            }
            let template = templates.default;
            let source = Object.assign({}, resource);
            if (source.data) {
                switch (resource.contentType) {
                    case 'application/xml':
                        template = templates.xml;
                        source.data = window.atob(source.data);
                        break;
                    case 'image/jpeg':
                        template = templates.image;
                        break;
                    case 'text/plain':
                    default:
                        source.data = window.atob(source.data);
                }
            }
            return Mustache.render(template, source);
        }
    }
});
