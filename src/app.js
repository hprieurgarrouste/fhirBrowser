import "./components/AppBar.js";
import "./appLeftPanel.js";
import { PreferencesService } from "./services/Preferences.js";
import { SnackbarsService } from "./services/Snackbars.js";
import "./fhirBundle.js";
import "./fhirResource.js";
import "./fhirServer.js";

/* Only register a service worker if it's supported */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js');
}

const AppTemplate = document.createElement('template');
AppTemplate.innerHTML = `
    <link rel="stylesheet" href="./assets/material.css">
    <style>
        :host {
            background-color: var(--background-color, rgb(255,255,255));
            color: var(--text-color-normal, rgb(0,0,0,87%));
            display: flex;
            flex-direction: column;
            font-family: Roboto, Arial, monospace;
            font-size: 1rem;
            font-weight: 400;
            height: 100vh;
            line-height: 1.5;
        }
        header {
            background-color: var(--primary-color, #000);
            color:#FFF;
        }
        h3 {
            margin:0;
        }
        main {
            flex:1 1 auto;
            height : 0;
            overflow: hidden;
        }
        main > div {
            display:flex;
            flex-direction: row;
            height : 100%;
        }
        #leftPanel {
            border-right:1px solid var(--border-color, gray);
            flex: none;
            transition: all 0.3s;
            margin-left: 0;
            width:300px;
        }
        #leftPanel.hidden {
            transition: all 0.3s;
            margin-left: -300px;
        }
        #bdy {
            flex: 1 1 auto;
            block-size: 100%;
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: 100%;
            overflow: hidden;
        }
        @media (max-width:480px){
            #leftPanel {
                background-color: var(--background-color, rgb(255,255,255));
                position: static;
                width:100%;
            }
            #leftPanel.hidden {
                margin-left: -100%;
            }
        }
    </style>
    <header>
        <app-bar id="header" caption="">
            <round-button slot="left" id="navigation" title="Menu" data-icon="menu"></round-button>
            <h3 slot="middle">FHIR Browser</h3>
            <round-button slot="right" id="colorScheme" title="Theme" data-icon="brightness_auto"></round-button>
            <round-button slot="right" id="serverSelectorToggle" title="Connections" data-icon="public"></round-button>
        </app-bar>
    </header>
    <main>
        <div>
            <app-left-panel id="leftPanel"></app-left-panel>
            <div id="bdy" style="visibility:hidden;">
                <fhir-bundle id="bundle"></fhir-bundle>
                <fhir-resource id="resource"></fhir-resource>
            </div>
        </div>
    </main>
    <fhir-server id="serverSelector" hidden></fhir-server>
`;

customElements.define('fhir-browser', class App extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(AppTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        SnackbarsService.container = this._shadow;
        const leftPanel = this._shadow.getElementById("leftPanel");
        const bdy = this._shadow.getElementById("bdy");
        bdy.scrollTo(0, 0);
        const bundle = this._shadow.getElementById("bundle");
        const resource = this._shadow.getElementById("resource");

        this._shadow.getElementById("navigation").addEventListener('click', () => {
            leftPanel.classList.toggle("hidden");
        });

        this._shadow.getElementById("leftPanel").addEventListener('resourceTypeSelected', ({ detail }) => {
            if (window.matchMedia("(max-width: 480px)").matches) {
                leftPanel.classList.add("hidden");
            }
            bundle.load(detail.resourceType);
            bdy.scrollTo({ top: 0, left: 0, behavior: "smooth" });
            bdy.style.visibility = "visible";
        });

        this._shadow.getElementById("serverSelector").addEventListener('serverchanged', ({ detail }) => {
            SnackbarsService.show(`Connected to "${detail.serverCode}" server.`);
            leftPanel.load();
            leftPanel.classList.remove("hidden");
        });

        resource.addEventListener('back', () => {
            bdy.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        });

        bundle.addEventListener('resourceSelected', ({ detail }) => {
            bdy.scrollTo({ top: 0, left: resource.offsetLeft, behavior: "smooth" });
            resource.load({
                "resourceType": detail.resourceType,
                "resourceId": detail.resourceId
            });
        });

        this.setColorScheme(PreferencesService.get("colorScheme", "auto"));

        this._shadow.getElementById("colorScheme").addEventListener('click', () => {
            let colorScheme = PreferencesService.get("colorScheme", "auto");
            switch (colorScheme) {
                case "dark":
                    colorScheme = "auto";
                    break;
                case "light":
                    colorScheme = "dark";
                    break;
                case "auto":
                default:
                    colorScheme = "light";
                    break;
            }
            PreferencesService.set("colorScheme", colorScheme);
            this.setColorScheme(colorScheme);
        });

        this._shadow.getElementById('serverSelectorToggle').addEventListener("click", () => {
            this._shadow.getElementById('serverSelector').hidden = false;
        });
    }

    setColorScheme(colorScheme) {
        let colorSchemeIcon = "";
        let scheme = colorScheme;
        switch (colorScheme) {
            case "dark":
                colorSchemeIcon = "brightness_4";
                break;
            case "light":
                colorSchemeIcon = "light_mode";
                break;
            case "auto":
            default:
                if ("auto" === colorScheme) {
                    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        scheme = "dark";
                    } else {
                        scheme = "light";
                    }
                }
                colorSchemeIcon = "brightness_auto";
                break;
        }
        const themeButton = this._shadow.getElementById("colorScheme");
        themeButton.setAttribute("data-icon", colorSchemeIcon);
        themeButton.title = `Theme ${colorScheme}`;
        document.body.setAttribute("color-scheme", scheme);
    }

});
