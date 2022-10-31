customElements.define('fhir-resource-html', class FhirResourceHtml extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(FhirResourceHtmlTemplate.content.cloneNode(true));
    }

    set source(resource) {
        let result = "<i>Coming soon</i>";
        this._shadow.getElementById('content').innerHTML = result;
    }
});


const FhirResourceHtmlTemplate = document.createElement('template');
FhirResourceHtmlTemplate.innerHTML = `
    <link rel="stylesheet" href="./assets/material.css">
    <style>
        main {
            display:flex;
            flex-direction:column;
            height:100%;
            border-top: 1px solid var(--border-color);
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
    <main>
        <div id="content"></div>
    </main>
`;