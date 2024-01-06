import template from "./templates/BundleSearchItem.html";

import BundleSearchDate from "./BundleSearchDate"
import BundleSearchModifier from "./BundleSearchModifier"
import BundleSearchPrefix from "./BundleSearchPrefix"
import BundleSearchText from "./BundleSearchText"

export default class BundleSearchItem extends HTMLElement {
    #shadow;
    /** @type {()} */
    #searchItem;
    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'closed' })
        this.#shadow.innerHTML = template;
    }

    clear() {
        const fields = this.#shadow.querySelectorAll("bundle-search-text, bundle-search-date, bundle-search-modifier, bundle-search-prefix");
        fields.forEach(field => field.value = "");
    }

    set value(oValue) {
        let field;
        const aValue = oValue.value.split('|');
        const aName = oValue.name.split(':');
        switch (this.#searchItem.type) {
            case "token":
                field = this.#shadow.querySelector('bundle-search-text:not([data-type])');
                if (aValue[1]) {
                    const system = this.#shadow.querySelector('bundle-search-text[data-type="system"]');
                    system.value = aValue[0];
                    field.value = aValue[1];
                } else {
                    field.value = aValue[0];
                }
                break;
            case "string":
            case "reference":
                if (aName[1]) {
                    const modifier = this.#shadow.querySelector('bundle-search-modifier');
                    modifier.value = aName[1];
                }
                field = this.#shadow.querySelector('bundle-search-text');
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
        switch (this.#searchItem.type) {
            case "token":
                let value = '';
                const system = this.#shadow.querySelector('bundle-search-text[data-type="system"]');
                if (system?.value) value = `${system.value}|`;
                field = this.#shadow.querySelector('bundle-search-text:not([data-type])');
                if (field?.value) value += field.value;
                if (!value) return null;
                return {
                    "name": this.#searchItem.name,
                    "value": value
                };
            case "string":
            case "reference":
                field = this.#shadow.querySelector('bundle-search-text');
                if (field?.value) {
                    let name = this.#searchItem.name;
                    const modifier = this.#shadow.querySelector('bundle-search-modifier');
                    if (modifier?.value) name += `:${modifier.value}`;
                    return {
                        "name": name,
                        "value": field.value
                    };
                }
                break;
            case "date":
            case "datetime":
                field = this.#shadow.querySelector('bundle-search-date');
                if (field?.value) {
                    let value = field.value;
                    const prefix = this.#shadow.querySelector('bundle-search-prefix');
                    if (prefix?.value) value = prefix.value + value;
                    return {
                        "name": this.#searchItem.name,
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
        return this.#searchItem.name;
    }

    init(search) {
        function addModifier(search) {
            let field = new BundleSearchModifier();
            field.setAttribute("data-name", search.name);
            content.appendChild(field);
        }
        function addSystem(search) {
            let field = new BundleSearchText();
            field.setAttribute("placeholder", 'System');
            field.setAttribute("data-type", 'system');
            field.setAttribute("name", search.name);
            content.appendChild(field);
        }
        function addText(search, placeholder) {
            let field = new BundleSearchText();
            field.setAttribute("name", search.name);
            if (placeholder) field.setAttribute("placeholder", placeholder);
            content.appendChild(field);
        }
        //remove format selector, only json supported
        if ("_format" === search.name) return false;

        this.#searchItem = search;
        this.#shadow.querySelector("legend").innerText = search.name;
        this.#shadow.querySelector("span").innerText = search.documentation || '';
        const content = this.#shadow.querySelector("fieldset");

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
                    field = new BundleSearchPrefix();
                    field.setAttribute("data-name", search.name);
                    content.appendChild(field);

                    field = new BundleSearchDate();
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
