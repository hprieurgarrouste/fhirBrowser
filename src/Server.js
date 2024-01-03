import ServerConfiguration from "./ServerConfiguration";

/**
 * @class Server
 */
export default class Server {

    _code = null;
    /**
     * @type ServerConfiguration
     */
    _serverConfiguration = null;
    _capabilities = null;
    _fhirReferences = null;
    _headers = {};

    /**
     * @param {code} code
     * @param {ServerConfiguration} serverConfiguration
     */
    constructor(code = '', serverConfiguration = null) {
        if (serverConfiguration == null) return;
        this._code = code;
        this._serverConfiguration = serverConfiguration;
        Object.assign(this._headers, serverConfiguration.headers);
    }

    /**
     * @returns {string}
     */
    get serverCode() {
        return this._code;
    }

    /**
     * @returns {string}
     */
    get url() {
        return this._serverConfiguration.url;
    }

    /**
     * @returns {object}
     */
    get headers() {
        return this._headers
    }

    /**
     * @returns {object}
     */
    get capabilities() {
        return this._capabilities
    }

    /**
     * Returns Fhir release from server fhirVersion
     * http://hl7.org/fhir/directory.html
     * @returns {string} release or null
     */
    get release() {
        const release = {
            "5.0.0": "R5",
            "4.6.0": "R5",
            "4.5.0": "R5",
            "4.4.0": "R5",
            "4.3.0": "R4B",
            "4.2.0": "R5",
            "4.1.0": "R4B",
            "4.0.1": "R4",
            "3.5.0": "R4",
            "3.3.0": "R4",
            "3.2.0": "R4",
            "3.0.2": "STU3",
            "3.0.1": "STU3",
            "3.0.0": "STU3"
        }
        return release[this._capabilities.fhirVersion] || null;
    }

    connect = async () => {
        switch (this._serverConfiguration.method) {
            case ServerConfiguration.METHODS.APIKey:
                this._headers[this._serverConfiguration.apiKey] = this._serverConfiguration.apiValue;
                break;
            case ServerConfiguration.METHODS.Basic:
                let auth = btoa(`${this._serverConfiguration.basicUsername}:${this._serverConfiguration.basicPassword}`);
                this._headers['Authorization'] = `Basic ${auth}`;
                break;
            case ServerConfiguration.METHODS.OAuth2:
                this._oauth2_getToken().then(response => {
                    this._headers['Authorization'] = `${response.token_type} ${response.access_token}`;
                });
                break;
            case ServerConfiguration.METHODS.None:
            default:
                break;
        }
        this._capabilities = await this._fetchCapabilities();
        this._references = await this._parseReferences(this._capabilities);
    }

    fetch = async (href, searchParams = {}) => {
        const url = new URL(`${this._serverConfiguration.url}${href}`);
        Object.entries(searchParams).forEach(([key, value]) => url.searchParams.set(key, value));
        const response = await fetch(url, {
            "headers": this._headers
        });
        return response.json();
    }

    _oauth2_getToken = async () => {
        const headers = {
            'Content-type': 'application/x-www-form-urlencoded'
        }
        if ('client_credentials' == this._serverConfiguration.oauthGrantType) {
            const auth = btoa(`${this._serverConfiguration.oauthClientId}:${this._serverConfiguration.oauthClientSecret}`);
            headers['Authorization'] = `Basic ${auth}`;
        }
        const urlParams = {
            "grant_type": this._serverConfiguration.oauthGrantType
        }

        const response = await fetch(this._serverConfiguration.oauthTokenUrl, {
            "headers": headers,
            "method": "POST",
            "body": new URLSearchParams(urlParams).toString()
        });
        return response.json();
    }

    _fetchCapabilities = async () => {
        const url = new URL(`${this._serverConfiguration.url}/metadata`);
        url.searchParams.set("_format", "json");
        try {
            const response = await fetch(url, {
                "cache": "reload",
                "headers": this._headers
            });
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(response);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * returns all resourceTypes that have a reference to the resourceType passed as a parameter
     * @param {string} resourceType
     * @returns
     */
    references = (resourceType) => {
        return this._references[resourceType];
    }

    _parseReferences = async (metadata) => {
        const serverReferences = {};
        const serverResources = metadata.rest[0].resource;
        const fhirReferences = await this._fetchAllReferences();
        metadata.rest[0].resource.forEach((serverResource) => {
            const fhirReference = fhirReferences[this.release][serverResource.type];
            if (fhirReference) {
                //clone fhirReference
                const serverReference = structuredClone(fhirReference);
                //remove unsupported resource target
                Object.entries(serverReference).forEach(([key, value]) => {
                    let serverTarget = serverResources.find(target => key == target.type);
                    if (!serverTarget) {
                        delete serverReference[key];
                    } else if (!serverTarget.searchParam) {
                        delete serverReference[key];
                    } else {
                        //remove unsupported search parameter
                        serverReference[key].forEach((searchCode, index) => {
                            const searchParam = serverTarget.searchParam.find(searchParam => searchCode == searchParam.name);
                            if (searchParam) {
                                serverReference[key][index] = {
                                    "name": searchCode,
                                    "documentation": searchParam.documentation
                                }
                            } else {
                                serverReference[key].splice(index, 1);
                            }
                        });
                        if (serverReference[key].length === 0) {
                            delete serverReference[key];
                        }
                    }
                });
                if (Object.keys(serverReference).length !== 0) {
                    serverReferences[serverResource.type] = serverReference;
                }
            }
        })
        return serverReferences;
    }

    _fetchAllReferences = async () => {
        if (!this._fhirReferences) {
            const response = await fetch('./assets/references.json');
            this._fhirReferences = await response.json();
        }
        return this._fhirReferences;
    }

    /**
     *
     * @param {('json'|'xml'|'ttl')} format
     * @returns
     */
    isFormatEnable(format) {
        let formats = [];
        switch (format) {
            case "json":
                formats.push("json");
                formats.push("application/fhir+json");
                formats.push("html/json");
                break;
            case "xml":
                formats.push("xml");
                formats.push("application/fhir+xml");
                formats.push("html/xml");
                break;
            case "ttl":
                formats.push("ttl");
                formats.push("application/x-turtle");
                formats.push("html/turtle");
                break;
        }
        return this._capabilities.format.some(format => formats.includes(format));
    }
}