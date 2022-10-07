import Mustache from "mustache";

customElements.define('fhir-resource-html', class FhirResourceHtml extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(FhirResourceHtmlTemplate.content.cloneNode(true));
    }

    /**
     * @param {Object} resource
     */
    set source(resource) {
        let result = "<i>Work in progress</i>";
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
                    case 'image/png':
                    case 'image/webp':
                    case 'image/tiff':
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


const FhirResourceHtmlTemplate = document.createElement('template');
FhirResourceHtmlTemplate.innerHTML = `
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
            min-width: 50%;
        }
        #content pre {
            background-color:#fff;
            border-radius: 4px;
            box-shadow: 0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);
            font-family: monospace;
            padding: 0.5em;
            color: black;
            overflow:auto;
        }
        #content img {
            background-color:#fff;
            border-radius: 4px;
            box-shadow: 0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);
            max-width: 100%;
        }
    </style>
    <div id="wrapper">
        <div id="content"></div>
    </div>
`;