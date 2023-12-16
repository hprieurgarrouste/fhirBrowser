import template from "./templates/BundleSearchItem.html";

import "./BundleSearchDate"
import "./BundleSearchModifier"
import "./BundleSearchPrefix"
import "./BundleSearchText"

class BundleSearchItem extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.innerHTML = template;
    }

    clear() {
        const fields = this._shadow.querySelectorAll("bundle-search-text, bundle-search-date, bundle-search-modifier, bundle-search-prefix");
        fields.forEach(field => field.value = "");
    }

    set value(oValue) {
        let field;
        const aValue = oValue.value.split('|');
        const aName = oValue.name.split(':');
        switch (this._search.type) {
            case "token":
                field = this._shadow.querySelector('bundle-search-text:not([data-type])');
                if (aValue[1]) {
                    const system = this._shadow.querySelector('bundle-search-text[data-type="system"]');
                    system.value = aValue[0];
                    field.value = aValue[1];
                } else {
                    field.value = aValue[0];
                }
                break;
            case "string":
            case "reference":
                if (aName[1]) {
                    const modifier = this._shadow.querySelector('bundle-search-modifier');
                    modifier.value = aName[1];
                }
                field = this._shadow.querySelector('bundle-search-text');
                field.value = oValue.value;
                break;
            case "date":
            case "datetime":
                break;
            default:
                break;
        }
    }

    get value() {
        let field;
        switch (this._search.type) {
            case "token":
                let value = '';
                const system = this._shadow.querySelector('bundle-search-text[data-type="system"]');
                if (system?.value) value = `${system.value}|`;
                field = this._shadow.querySelector('bundle-search-text:not([data-type])');
                if (field?.value) value += field.value;
                if (!value) return null;
                return {
                    "name": this._search.name,
                    "value": value
                };
            case "string":
            case "reference":
                field = this._shadow.querySelector('bundle-search-text');
                if (field?.value) {
                    let name = this._search.name;
                    const modifier = this._shadow.querySelector('bundle-search-modifier');
                    if (modifier?.value) name += `:${modifier.value}`;
                    return {
                        "name": name,
                        "value": field.value
                    };
                }
                break;
            case "date":
            case "datetime":
                field = this._shadow.querySelector('bundle-search-date');
                if (field?.value) {
                    let value = field.value;
                    const prefix = this._shadow.querySelector('bundle-search-prefix');
                    if (prefix?.value) value = prefix.value + value;
                    return {
                        "name": this._search.name,
                        "value": value
                    };
                }
                break;
            default:
                break;
        }
        return null;
    }

    get name() {
        return this._search.name;
    }

    init(search) {
        function addModifier(search) {
            let field = document.createElement("bundle-search-modifier");
            field.setAttribute("data-name", search.name);
            content.appendChild(field);
        }
        function addSystem(search) {
            let field = document.createElement("bundle-search-text");
            field.setAttribute("placeholder", 'System');
            field.setAttribute("data-type", 'system');
            field.setAttribute("name", search.name);
            content.appendChild(field);
        }
        function addText(search, placeholder) {
            let field = document.createElement("bundle-search-text");
            field.setAttribute("name", search.name);
            if (placeholder) field.setAttribute("placeholder", placeholder);
            content.appendChild(field);
        }
        //remove format selector, only json supported
        if ("_format" === search.name) return false;

        this._search = search;
        this._shadow.querySelector("legend").innerText = search.name;
        this._shadow.querySelector("span").innerText = search.documentation || '';
        const content = this._shadow.querySelector("fieldset");

        let field;
        if ('_id' == search.name) {
            addText(search);
        } else if ('_filter' == search.name) {
            addText(search);
        } else {
            switch (search.type) {
                case "token":
                    addSystem(search);
                    addText(search, 'code');
                    break;
                case "string":
                case "reference":
                    addModifier(search);
                    addText(search);
                    break;
                case "date":
                case "datetime":
                    field = document.createElement("bundle-search-prefix");
                    field.setAttribute("data-name", search.name);
                    content.appendChild(field);

                    field = document.createElement("bundle-search-date");
                    field.setAttribute("name", search.name);
                    content.appendChild(field);
                    break;
                default:
                    return false;
            }
        }
        return true;
    }
};
customElements.define('bundle-search-item', BundleSearchItem)
