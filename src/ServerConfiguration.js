export class ServerConfiguration {
    _url = '';
    _method = ServerConfiguration.None;
    _headers = {};
    _apiKey = null;
    _apiValue = null;
    _basicUsername = null;
    _basicPassword = null;
    _oauthTokenurl = null;
    _oauthclientid = null;
    _oauthClientsecret = null;
    _oauthGranttype = null;

    static METHODS = {
        'None': 'noauth',
        'APIKey': 'apikey',
        'Basic': 'basic',
        'OAuth2': 'oauth2'
    }

    constructor(conf = null) {
        if (conf == null) return;

        this.url = conf.url;
        this.method = conf.auth.method;
        this.headers = conf.headers;
        switch (this._method) {
            case ServerConfiguration.METHODS.APIKey:
                this.apiKey = conf.auth.setup?.key;
                this.apiValue = conf.auth.setup?.value;
                break;
            case ServerConfiguration.METHODS.Basic:
                this.basicUsername = conf.auth.setup?.username;
                this.basicPassword = conf.auth.setup?.password;
                break;
            case ServerConfiguration.METHODS.OAuth2:
                this.oauthTokenUrl = conf.auth.setup?.access_token_url;
                this.oauthClientId = conf.auth.setup?.client_id;
                this.oauthClientSecret = conf.auth.setup?.client_secret;
                this.oauthGrantType = conf.auth.setup?.grant_type;
                break;
            case ServerConfiguration.METHODS.None:
            default:
                break;
        }
    }

    toString = () => {
        const ret = {
            "url": this._url,
            "auth": {
                "method": this._method,
                "setup": {}
            }
        }
        switch (this._method) {
            case ServerConfiguration.METHODS.APIKey:
                ret.auth.setup['key'] = this._apiKey;
                ret.auth.setup['value'] = this._apiValue;
                break;
            case ServerConfiguration.METHODS.Basic:
                ret.auth.setup['username'] = this._basicUsername;
                ret.auth.setup['password'] = this._basicPassword;
                break;
            case ServerConfiguration.METHODS.OAuth2:
                ret.auth.setup['access_token_url'] = this._oauthTokenurl;
                ret.auth.setup['client_id'] = this._oauthclientid;
                ret.auth.setup['client_secret'] = this._oauthClientsecret;
                ret.auth.setup['grant_type'] = this._oauthGranttype;
                break;
            case ServerConfiguration.METHODS.None:
            default:
                break;
        }
        return ret;
    }


    get url() {
        return this._url
    }
    /**
     * @param {url} value
     */
    set url(value) {
        const url = new URL(value);
        this._url = value
    }

    get method() {
        return this._method
    }
    /**
     * @param {ServerConfiguration.METHODS} value
     */
    set method(value = ServerConfiguration.METHODS.None) {
        if (!Object.entries(ServerConfiguration.METHODS).find(([, methodValue]) => methodValue == value)) {
            throw new Error(`authentication method '${value}' not supported`)
        }
        this._method = value
    }

    get headers() {
        return this._headers;
    }
    /**
     * @param {object} value
     */
    set headers(value) {
        this._headers = value;
    }

    get apiKey() {
        return this._apiKey
    }
    /**
     * @param {string} value
     */
    set apiKey(value) {
        this._apiKey = value
    }

    get apiValue() {
        return this._apiValue
    }
    /**
     * @param {string} value
     */
    set apiValue(value) {
        this._apiValue = value
    }

    get basicUsername() {
        return this._basicUsername
    }
    /**
     * @param {string} value
     */
    set basicUsername(value) {
        this._basicUsername = value
    }

    get basicPassword() {
        return this._basicPassword
    }
    /**
     * @param {string} value
     */
    set basicPassword(value) {
        this._basicPassword = value
    }

    get oauthTokenUrl() {
        return this._oauthTokenurl
    }
    /**
     * @param {href} value
     */
    set oauthTokenUrl(value) {
        this._oauthTokenurl = value
    }

    get oauthClientId() {
        return this._oauthclientid
    }
    /**
     * @param {string} value
     */
    set oauthClientId(value) {
        this._oauthclientid = value
    }

    get oauthClientSecret() {
        return this._oauthClientsecret
    }
    /**
     * @param {string} value
     */
    set oauthClientSecret(value) {
        this._oauthClientsecret = value
    }

    get oauthGrantType() {
        return this._oauthGranttype
    }
    /**
     * @param {string} value
     */
    set oauthGrantType(value) {
        this._oauthGranttype = value
    }

}