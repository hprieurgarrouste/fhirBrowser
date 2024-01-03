import template from "./templates/ServerForm.html"

import "./components/M2Button"
import "./components/M2Confirm"
import "./components/M2TextField"

class ServerForm extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this._appDialog = shadow.querySelector('m2-dialog');
        this._appDialog.onClose = this.appDialogClose;
        this._content = shadow.getElementById('content');

        shadow.querySelectorAll('input[name="authMethod"]').forEach((input) => { input.addEventListener("change", this.authMethodChange) });

        shadow.querySelector('main').onkeydown = this.mainKeyDown;

        this._key = shadow.getElementById('key');
        this._url = shadow.getElementById('url');

        this._authNo = shadow.getElementById("authNo");
        this._authApi = shadow.getElementById("authApi");
        this._authBasic = shadow.getElementById("authBasic");
        this._authOauth = shadow.getElementById("authOauth");

        this._apiSection = shadow.getElementById("apiSection");
        this._apiKey = shadow.getElementById('apiKey');
        this._apiValue = shadow.getElementById('apiValue');

        this._basicSection = shadow.getElementById('basicSection');
        this._basicUsername = shadow.getElementById('basicUsername');
        this._basicPassword = shadow.getElementById('basicPassword');

        this._oauthSection = shadow.getElementById('oauthSection');
        this._oauthTokenurl = shadow.getElementById('oauthTokenurl');
        this._oauthClientid = shadow.getElementById('oauthClientid');
        this._oauthClientsecret = shadow.getElementById('oauthClientsecret');
        this._oauthGranttype = shadow.getElementById('oauthGranttype');

        this._appConfirm = shadow.querySelector('m2-confirm');
        this._appConfirm.onValidate = this.deleteConfirm;

        shadow.getElementById('formOk').onclick = this.formOkClick;
        shadow.getElementById('formCancel').onclick = this.formCancelClick;
        this._formDelete = shadow.getElementById('formDelete');
        this._formDelete.onclick = this.formDeleteClick;
    }

    static get observedAttributes() { return ["data-title"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ("data-title" == name) {
            this._appDialog.setAttribute("data-title", newValue);
        }
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
        this._appConfirm.hidden = false;
    }

    deleteConfirm = (event) => {
        this.onDelete(event);
        this.hidden = true;
    }

    mainKeyDown = (event) => {
        if (['Enter', 'NumpadEnter'].includes(event.code) && this.checkValidity()) {
            if (this.onOk(event)) this.hidden = true;
        }
    }

    authMethodChange = () => {
        const value = this._content.querySelector("input[name='authMethod']:checked").value;
        this._apiSection.hidden = ("API Key" !== value);
        this._basicSection.hidden = ("Basic" !== value);
        this._oauthSection.hidden = ("OAuth 2" !== value);
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
        if (check(this._key) && check(this._url)) {
            const method = this._content.querySelector("input[name='authMethod']:checked");
            switch (method) {
                case this._authNo:
                    return true;
                case this._authApi:
                    return check(this._apiKey) && check(this._apiValue);
                case this._authBasic:
                    return check(this._basicUsername) && check(this._basicPassword);
                case this._authOauth:
                    return check(this._oauthTokenurl) && check(this._oauthClientid) && check(this._oauthClientsecret) && check(this._oauthGranttype);
                default:
                    break;
            }
        }
        return false;

        function check(field) {
            if (!field.checkValidity()) {
                field.focus(true);
                return false;
            }
            return true;
        }

    }

    get value() {
        const method = this._content.querySelector("input[name='authMethod']:checked");
        let server = {
            serverCode: this._key.value,
            url: this._url.value,
            auth: {
                method: "noauth",
                setup: {}
            }
        };
        switch (method) {
            case this._authApi:
                server.auth.method = "apikey";
                server.auth.setup.key = this._apiKey.value;
                server.auth.setup.value = this._apiValue.value;
                break;
            case this._authBasic:
                server.auth.method = "basic";
                server.auth.setup.username = this._basicUsername.value;
                server.auth.setup.password = this._basicPassword.value;
                break;
            case this._authOauth:
                server.auth.method = "oauth2";
                server.auth.setup.access_token_url = this._oauthTokenurl.value;
                server.auth.setup.client_id = this._oauthClientid.value;
                server.auth.setup.client_secret = this._oauthClientsecret.value;
                server.auth.setup.grant_type = this._oauthGranttype.value;
                break;
            default:
                break;
        }
        return server;
    }

    set value({ serverCode, server }) {
        if (serverCode) {
            this._appDialog.setAttribute("data-title", serverCode);
            this._formDelete.hidden = false;
        } else {
            this._appDialog.setAttribute("data-title", "New");
            this._formDelete.hidden = true;
        }
        this.clear();
        this._key.value = serverCode;
        this._url.value = server.url;
        switch (server?.auth?.method) {
            case "apikey":
                this._authApi.checked = true;
                this._apiKey.value = server.auth.setup.key;
                this._apiValue.value = server.auth.setup.value;
                break;
            case "basic":
                this._authBasic.checked = true;
                this._basicUsername.value = server.auth.setup.username;
                this._basicPassword.value = server.auth.setup.password;
                break;
            case "oauth2":
                this._authOauth.checked = true;
                this._oauthTokenurl.value = server.auth.setup.access_token_url;
                this._oauthClientid.value = server.auth.setup.client_id;
                this._oauthClientsecret.value = server.auth.setup.client_secret;
                this._oauthGranttype.value = server.auth.setup.grant_type;
                break;
            default:
                this._authNo.checked = true;
                break;
        }
        this.authMethodChange();
    }

    clear() {
        const fields = this._content.querySelectorAll("m2-textfield");
        fields.forEach(field => field.value = '');
        // only grant type allowed
        this._oauthGranttype.value = "client_credentials";
    }

};
customElements.define('server-form', ServerForm);
