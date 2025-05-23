import template from './templates/ServerForm.html'

import '../components/M2Button'
// eslint-disable-next-line no-unused-vars
import M2Dialog from '../components/M2Dialog'
// eslint-disable-next-line no-unused-vars
import M2Confirm from '../components/M2Confirm'
// eslint-disable-next-line no-unused-vars
import M2RoundButton from '../components/M2RoundButton'
// eslint-disable-next-line no-unused-vars
import M2TextField from '../components/M2TextField'
import ServerConfiguration from './ServerConfiguration'

export default class ServerForm extends HTMLElement {
    /** @type {M2Dialog} */
    #appDialog
    /** @type {HTMLElement} */
    #content
    /** @type {M2TextField} */
    #key
    /** @type {M2TextField} */
    #url
    /** @type {HTMLInputElement} */
    #authNo
    /** @type {HTMLInputElement} */
    #authApi
    /** @type {HTMLInputElement} */
    #authBasic
    /** @type {HTMLInputElement} */
    #authOauth
    /** @type {HTMLElement} */
    #apiSection
    /** @type {M2TextField} */
    #apiKey
    /** @type {M2TextField} */
    #apiValue
    /** @type {HTMLElement} */
    #basicSection
    /** @type {M2TextField} */
    #basicUsername
    /** @type {M2TextField} */
    #basicPassword
    /** @type {HTMLElement} */
    #oauthSection
    /** @type {M2TextField} */
    #oauthTokenurl
    /** @type {M2TextField} */
    #oauthClientid
    /** @type {M2TextField} */
    #oauthClientsecret
    /** @type {M2TextField} */
    #oauthScope
    /** @type {M2TextField} */
    #oauthCredentialsHeader
    /** @type {M2TextField} */
    #oauthCredentialsBody
    /** @type {M2TextField} */
    #oauthGranttype
    /** @type {M2Confirm} */
    #appConfirm
    /** @type {M2RoundButton} */
    #formDelete

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template

        this.#appDialog = shadow.querySelector('m2-dialog')
        this.#appDialog.onClose = this.appDialogClose
        this.#content = shadow.getElementById('content')

        shadow.querySelectorAll('input[name="authMethod"]').forEach((input) => { input.addEventListener('change', this.authMethodChange) })

        shadow.querySelector('main').onkeydown = this.mainKeyDown

        this.#key = shadow.getElementById('key')
        this.#url = shadow.getElementById('url')

        this.#authNo = shadow.getElementById('authNo')
        this.#authApi = shadow.getElementById('authApi')
        this.#authBasic = shadow.getElementById('authBasic')
        this.#authOauth = shadow.getElementById('authOauth')

        this.#apiSection = shadow.getElementById('apiSection')
        this.#apiKey = shadow.getElementById('apiKey')
        this.#apiValue = shadow.getElementById('apiValue')

        this.#basicSection = shadow.getElementById('basicSection')
        this.#basicUsername = shadow.getElementById('basicUsername')
        this.#basicPassword = shadow.getElementById('basicPassword')

        this.#oauthSection = shadow.getElementById('oauthSection')
        this.#oauthTokenurl = shadow.getElementById('oauthTokenurl')
        this.#oauthClientid = shadow.getElementById('oauthClientid')
        this.#oauthClientsecret = shadow.getElementById('oauthClientsecret')
        this.#oauthScope = shadow.getElementById('oauthScope')
        this.#oauthGranttype = shadow.getElementById('oauthGranttype')
        this.#oauthCredentialsHeader = shadow.getElementById('oauthCredentialsHeader')
        this.#oauthCredentialsBody = shadow.getElementById('oauthCredentialsBody')

        this.#appConfirm = shadow.querySelector('m2-confirm')
        this.#appConfirm.onValidate = this.deleteConfirm

        shadow.getElementById('formOk').onclick = this.formOkClick
        shadow.getElementById('formCancel').onclick = this.formCancelClick
        this.#formDelete = shadow.getElementById('formDelete')
        this.#formDelete.onclick = this.formDeleteClick
    }

    static get observedAttributes () { return ['data-title'] }

    attributeChangedCallback (name, oldValue, newValue) {
        if (name === 'data-title') {
            this.#appDialog.setAttribute('data-title', newValue)
        }
    }

    appDialogClose = (event) => {
        this.onCancel(event)
        event.preventDefault()
        event.stopPropagation()
    }

    formOkClick = (event) => {
        if (this.checkValidity()) {
            if (this.onOk(event)) this.hidden = true
        }
    }

    formCancelClick = (event) => {
        this.onCancel(event)
    }

    formDeleteClick = () => {
        this.#appConfirm.hidden = false
    }

    deleteConfirm = (event) => {
        this.onDelete(event)
        this.hidden = true
    }

    mainKeyDown = (event) => {
        if (['Enter', 'NumpadEnter'].includes(event.code) && this.checkValidity()) {
            if (this.onOk(event)) this.hidden = true
        }
    }

    authMethodChange = () => {
        const value = this.#content.querySelector("input[name='authMethod']:checked").value
        this.#apiSection.hidden = (value !== 'API Key')
        this.#basicSection.hidden = (value !== 'Basic')
        this.#oauthSection.hidden = (value !== 'OAuth 2')
    }

    #onOk = (event) => {
        this.hidden = true
    }

    get onOk () {
        return this.#onOk
    }

    /** @param {Function} callback */
    set onOk (callback) {
        this.#onOk = callback
    }

    #onCancel = (event) => {
        this.hidden = true
    }

    get onCancel () {
        return this.#onCancel
    }

    /** @param {Function} callback */
    set onCancel (callback) {
        this.#onCancel = callback
    }

    #onDelete = () => {
        this.hidden = true
    }

    get onDelete () {
        return this.#onDelete
    }

    /** @param {Function} callback */
    set onDelete (callback) {
        this.#onDelete = callback
    }

    checkValidity = () => {
        if (check(this.#key) && check(this.#url)) {
            const method = this.#content.querySelector("input[name='authMethod']:checked")
            switch (method) {
            case this.#authNo:
                return true
            case this.#authApi:
                return check(this.#apiKey) && check(this.#apiValue)
            case this.#authBasic:
                return check(this.#basicUsername) && check(this.#basicPassword)
            case this.#authOauth:
                return check(this.#oauthTokenurl) && check(this.#oauthClientid) && check(this.#oauthClientsecret) && check(this.#oauthGranttype)
            default:
                break
            }
        }
        return false

        function check (field) {
            if (!field.checkValidity()) {
                field.focus(true)
                return false
            }
            return true
        }
    }

    get value () {
        const method = this.#content.querySelector("input[name='authMethod']:checked")
        const server = {
            serverCode: this.#key.value,
            url: this.#url.value,
            auth: {
                method: 'noauth',
                setup: {}
            }
        }
        switch (method) {
        case this.#authApi:
            server.auth.method = 'apikey'
            server.auth.setup.key = this.#apiKey.value
            server.auth.setup.value = this.#apiValue.value
            break
        case this.#authBasic:
            server.auth.method = 'basic'
            server.auth.setup.username = this.#basicUsername.value
            server.auth.setup.password = this.#basicPassword.value
            break
        case this.#authOauth:
            server.auth.method = 'oauth2'
            server.auth.setup.access_token_url = this.#oauthTokenurl.value
            server.auth.setup.client_id = this.#oauthClientid.value
            server.auth.setup.client_secret = this.#oauthClientsecret.value
            server.auth.setup.scope = this.#oauthScope.value
            server.auth.setup.grant_type = this.#oauthGranttype.value
            server.auth.setup.credentials = this.#content.querySelector("input[name='oauthCredentials']:checked")?.value
            break
        default:
            break
        }
        return server
    }

    set value ({ serverCode, server }) {
        if (serverCode) {
            this.#appDialog.setAttribute('data-title', serverCode)
            this.#formDelete.hidden = false
        } else {
            this.#appDialog.setAttribute('data-title', 'New')
            this.#formDelete.hidden = true
        }
        this.clear()
        this.#key.value = serverCode
        const config = new ServerConfiguration(server)
        this.#url.value = config.url
        switch (config.method) {
        case 'apikey':
            this.#authApi.checked = true
            this.#apiKey.value = config.apiKey
            this.#apiValue.value = config.apiValue
            break
        case 'basic':
            this.#authBasic.checked = true
            this.#basicUsername.value = config.basicUsername
            this.#basicPassword.value = config.basicPassword
            break
        case 'oauth2':
            this.#authOauth.checked = true
            this.#oauthTokenurl.value = config.oauthTokenUrl
            this.#oauthClientid.value = config.oauthClientId
            this.#oauthClientsecret.value = config.oauthClientSecret
            this.#oauthScope.value = config.oauthScope
            this.#oauthGranttype.value = config.oauthGrantType
            if (config.oauthCredentials === ServerConfiguration.CREDENTIALS.Body) {
                this.#oauthCredentialsBody.checked = true
            } else {
                this.#oauthCredentialsHeader.checked = true
            }
            break
        default:
            this.#authNo.checked = true
            break
        }
        this.authMethodChange()
    }

    clear () {
        const fields = this.#content.querySelectorAll('m2-textfield')
        fields.forEach(field => { field.value = '' })
        // only grant type allowed
        this.#oauthGranttype.value = 'client_credentials'
    }
}
customElements.define('server-form', ServerForm)
