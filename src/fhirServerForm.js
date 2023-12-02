import template from "./templates/fhirServerForm.html"

import "./components/AppButton.js"
import "./components/AppConfirm.js"
import "./components/TextField.js"
import "./fhirServerNewAuth.js"

class FhirServerForm extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }

    static get observedAttributes() { return ["data-title"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ("data-title" == name) {
            this._shadow.querySelector("app-dialog").setAttribute("data-title", newValue);
        }
    }

    connectedCallback() {
        this._shadow.querySelector('app-dialog').onClose = this.appDialogClose;

        this._shadow.getElementById("authMethod").addEventListener("change", this.authMethodChange);

        this._shadow.getElementById("formCancel").onclick = this.formCancelClick;

        this._shadow.getElementById("formDelete").onclick = this.formDeleteClick;

        this._shadow.getElementById("formOk").onclick = this.formOkClick;

        this._shadow.querySelector("main").onkeydown = this.mainKeyDown;

        this._shadow.querySelector("app-confirm").onValidate = this.deleteConfirm;
    }

    appDialogClose = (event) => {
        this.onCancel(event);
        event.preventDefault();
        event.stopPropagation();
    }

    formOkClick = (event) => {
        if (this.checkValidity()) {
            if (this.onOk(event)) this.hidden = true;
        }
    }

    formCancelClick = (event) => {
        this.onCancel(event);
    }

    formDeleteClick = () => {
        this._shadow.querySelector('app-confirm').hidden = false;
    }

    deleteConfirm = (event) => {
        this.onDelete(event);
        this.hidden = true;
    }

    mainKeyDown = (event) => {
        if (('Enter' === event.code || 'NumpadEnter' === event.code) && this.checkValidity()) {
            if (this.onOk(event)) this.hidden = true;
        }
    }

    authMethodChange = ({ detail }) => {
        this._shadow.getElementById("apiSection").hidden = ("API Key" !== detail.value);
        this._shadow.getElementById("basicSection").hidden = ("Basic" !== detail.value);
        this._shadow.getElementById("oauthSection").hidden = ("OAuth 2" !== detail.value);
    }

    _onOk = (event) => {
        this.hidden = true;
    }
    get onOk() {
        return this._onOk;
    }
    set onOk(okFct) {
        this._onOk = okFct;
    }

    _onCancel = (event) => {
        this.hidden = true;
    }
    get onCancel() {
        return this._onCancel;
    }
    set onCancel(cancelFct) {
        this._onCancel = cancelFct;
    }

    _onDelete = () => {
        this.hidden = true;
    }
    get onDelete() {
        return this._onDelete;
    }
    set onDelete(deleteFct) {
        this._onDelete = deleteFct;
    }

    checkValidity = function () {
        let self = this;
        if (check("key") && check("url") && check("authMethod")) {
            const method = this._shadow.getElementById("authMethod").value;
            switch (method) {
                case "No Auth":
                    return true;
                case "API Key":
                    return checkApi();
                case "Basic":
                    return checkBasic();
                case "OAuth 2":
                    return checkOAuth2();
                default:
                    break;
            }
        }
        return false;

        function checkBasic() {
            return check("basicUsername")
                && check("basicPassword");
        }

        function checkApi() {
            return check("apiKey")
                && check("apiValue");
        }
        function checkOAuth2() {
            return check("oauthTokenurl")
                && check("oauthClientid")
                && check("oauthClientsecret")
                && check("oauthGranttype");
        }

        function check(name) {
            let field = self._shadow.getElementById(name);
            if (!field.checkValidity()) {
                field.focus(true);
                return false;
            }
            return true;
        }

    }

    get value() {
        const method = this._shadow.getElementById("authMethod").value;
        let server = {
            serverCode: this._shadow.getElementById("key").value,
            url: this._shadow.getElementById("url").value,
            auth: {
                method: "noauth",
                setup: {}
            }
        };
        switch (method) {
            case "API Key":
                server.auth.method = "apikey";
                server.auth.setup.key = this._shadow.getElementById("apiKey").value;
                server.auth.setup.value = this._shadow.getElementById("apiValue").value;
                break;
            case "Basic":
                server.auth.method = "basic";
                server.auth.setup.username = this._shadow.getElementById("basicUsername").value;
                server.auth.setup.password = this._shadow.getElementById("basicPassword").value;
                break;
            case "OAuth 2":
                server.auth.method = "oauth2";
                server.auth.setup.access_token_url = this._shadow.getElementById("oauthTokenurl").value;
                server.auth.setup.client_id = this._shadow.getElementById("oauthClientid").value;
                server.auth.setup.client_secret = this._shadow.getElementById("oauthClientsecret").value;
                server.auth.setup.grant_type = this._shadow.getElementById("oauthGranttype").value;
                break;
            default:
                break;
        }
        return server;
    }

    set value({ serverCode, server }) {
        if (serverCode) {
            this._shadow.querySelector("app-dialog").setAttribute("data-title", serverCode);
            this._shadow.getElementById("formDelete").hidden = false;
        } else {
            this._shadow.querySelector("app-dialog").setAttribute("data-title", "New");
            this._shadow.getElementById("formDelete").hidden = true;
        }
        this.clear();
        this._shadow.getElementById("key").value = serverCode;
        this._shadow.getElementById("url").value = server.url;
        switch (server?.auth?.method) {
            case "apikey":
                this._shadow.getElementById("authMethod").value = "API Key";
                this._shadow.getElementById("apiKey").value = server.auth.setup.key;
                this._shadow.getElementById("apiValue").value = server.auth.setup.value;
                break;
            case "basic":
                this._shadow.getElementById("authMethod").value = "Basic";
                this._shadow.getElementById("basicUsername").value = server.auth.setup.username;
                this._shadow.getElementById("basicPassword").value = server.auth.setup.password;
                break;
            case "oauth2":
                this._shadow.getElementById("authMethod").value = "OAuth 2";
                this._shadow.getElementById("oauthTokenurl").value = server.auth.setup.access_token_url;
                this._shadow.getElementById("oauthClientid").value = server.auth.setup.client_id;
                this._shadow.getElementById("oauthClientsecret").value = server.auth.setup.client_secret;
                this._shadow.getElementById("oauthGranttype").value = server.auth.setup.grant_type;
                break;
            default:
                this._shadow.getElementById("authMethod").value = "No Auth";
                break;
        }
    }

    clear() {
        const content = this._shadow.getElementById("content");
        const fields = content.querySelectorAll("text-field");
        fields.forEach(field => field.value = '');
        // only grant type allowed
        this._shadow.getElementById("oauthGranttype").value = "client_credentials";
    }

};
customElements.define('fhir-server-form', FhirServerForm);
