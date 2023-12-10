import template from "./templates/ColorScheme.html";

import { PreferencesService } from "../services/Preferences"

class ColorScheme extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.innerHTML = template;
    }

    connectedCallback() {
        this._shadow.addEventListener('click', this.onClick);
        this.setColorScheme(PreferencesService.get("colorScheme", "auto"));
    }
    disconnectedCallback() {
        this._shadow.removeEventListener('click', this.onClick);
    }

    onClick = (event) => {
        const schemes = ["light", "dark", "auto"];
        let colorScheme = PreferencesService.get("colorScheme", "auto");
        let i = schemes.findIndex((elm) => elm === colorScheme) + 1;
        colorScheme = schemes[i % 3];
        PreferencesService.set("colorScheme", colorScheme);
        this.setColorScheme(colorScheme);
    }

    setColorScheme = (colorScheme) => {
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
                    if (window?.matchMedia('(prefers-color-scheme: dark)').matches) {
                        scheme = "dark";
                    } else {
                        scheme = "light";
                    }
                }
                colorSchemeIcon = "brightness_auto";
                break;
        }
        const themeButton = this._shadow.querySelector("round-button");
        themeButton.setAttribute("data-icon", colorSchemeIcon);
        themeButton.title = `Theme ${colorScheme}`;
        document.body.setAttribute("color-scheme", scheme);
    }

    get value() {
        return PreferencesService.get("colorScheme", "auto");
    }

}

customElements.define('color-scheme', ColorScheme);
