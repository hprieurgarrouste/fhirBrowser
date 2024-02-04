export default class ServerConfiguration {
    #url = ''
    #method = ServerConfiguration.None
    #headers = {}
    #apiKey = null
    #apiValue = null
    #basicUsername = null
    #basicPassword = null
    #oauthTokenurl = null
    #oauthclientid = null
    #oauthClientsecret = null
    #oauthGranttype = null

    static METHODS = {
        None: 'noauth',
        APIKey: 'apikey',
        Basic: 'basic',
        OAuth2: 'oauth2'
    }

    constructor (conf = null) {
        if (conf == null) return

        this.url = conf.url
        this.method = conf.auth?.method || ServerConfiguration.METHODS.None
        this.headers = conf.headers
        switch (this.#method) {
        case ServerConfiguration.METHODS.APIKey:
            this.apiKey = conf.auth.setup?.key
            this.apiValue = conf.auth.setup?.value
            break
        case ServerConfiguration.METHODS.Basic:
            this.basicUsername = conf.auth.setup?.username
            this.basicPassword = conf.auth.setup?.password
            break
        case ServerConfiguration.METHODS.OAuth2:
            this.oauthTokenUrl = conf.auth.setup?.access_token_url
            this.oauthClientId = conf.auth.setup?.client_id
            this.oauthClientSecret = conf.auth.setup?.client_secret
            this.oauthGrantType = conf.auth.setup?.grant_type
            break
        case ServerConfiguration.METHODS.None:
        default:
            break
        }
    }

    toString = () => {
        const ret = {
            url: this.#url,
            auth: {
                method: this.#method,
                setup: {}
            }
        }
        switch (this.#method) {
        case ServerConfiguration.METHODS.APIKey:
            ret.auth.setup.key = this.#apiKey
            ret.auth.setup.value = this.#apiValue
            break
        case ServerConfiguration.METHODS.Basic:
            ret.auth.setup.username = this.#basicUsername
            ret.auth.setup.password = this.#basicPassword
            break
        case ServerConfiguration.METHODS.OAuth2:
            ret.auth.setup.access_token_url = this.#oauthTokenurl
            ret.auth.setup.client_id = this.#oauthclientid
            ret.auth.setup.client_secret = this.#oauthClientsecret
            ret.auth.setup.grant_type = this.#oauthGranttype
            break
        case ServerConfiguration.METHODS.None:
        default:
            break
        }
        return ret
    }

    get url () {
        return this.#url
    }

    /**
     * @param {url} value
     */
    set url (value) {
        const url = new URL(value)
        this.#url = value
    }

    get method () {
        return this.#method
    }

    /**
     * @param {ServerConfiguration.METHODS} value
     */
    set method (value = ServerConfiguration.METHODS.None) {
        if (!Object.entries(ServerConfiguration.METHODS).find(([, methodValue]) => methodValue === value)) {
            throw new Error(`authentication method '${value}' not supported`)
        }
        this.#method = value
    }

    get headers () {
        return this.#headers
    }

    /**
     * @param {object} value
     */
    set headers (value) {
        this.#headers = value
    }

    get apiKey () {
        return this.#apiKey
    }

    /**
     * @param {string} value
     */
    set apiKey (value) {
        this.#apiKey = value
    }

    get apiValue () {
        return this.#apiValue
    }

    /**
     * @param {string} value
     */
    set apiValue (value) {
        this.#apiValue = value
    }

    get basicUsername () {
        return this.#basicUsername
    }

    /**
     * @param {string} value
     */
    set basicUsername (value) {
        this.#basicUsername = value
    }

    get basicPassword () {
        return this.#basicPassword
    }

    /**
     * @param {string} value
     */
    set basicPassword (value) {
        this.#basicPassword = value
    }

    get oauthTokenUrl () {
        return this.#oauthTokenurl
    }

    /**
     * @param {href} value
     */
    set oauthTokenUrl (value) {
        this.#oauthTokenurl = value
    }

    get oauthClientId () {
        return this.#oauthclientid
    }

    /**
     * @param {string} value
     */
    set oauthClientId (value) {
        this.#oauthclientid = value
    }

    get oauthClientSecret () {
        return this.#oauthClientsecret
    }

    /**
     * @param {string} value
     */
    set oauthClientSecret (value) {
        this.#oauthClientsecret = value
    }

    get oauthGrantType () {
        return this.#oauthGranttype
    }

    /**
     * @param {string} value
     */
    set oauthGrantType (value) {
        this.#oauthGranttype = value
    }
}
