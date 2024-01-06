import ServerConfiguration from "./ServerConfiguration";

/**
 * @class Server
 */
export default class Server {

    /** @type {ServerConfiguration} */
    #serverConfiguration = null;
    #capabilities = null;
    #fhirReferences = null;
    #serverReferences = null;
    #headers = {};
    /** @type {String} */
    #code;

    /**
     * @param {String} code
     * @param {ServerConfiguration} serverConfiguration
     */
    constructor(code = '', serverConfiguration = null) {
        if (serverConfiguration == null) return;
        this.#code = code;
        this.#serverConfiguration = serverConfiguration;
        Object.assign(this.#headers, serverConfiguration.headers);
    }

    /**
     * @returns {string}
     */
    get serverCode() {
        return this.#code;
    }

    /**
     * @returns {string}
     */
    get url() {
        return this.#serverConfiguration.url;
    }

    /**
     * @returns {object}
     */
    get headers() {
        return this.#headers
    }

    /**
     * @returns {object}
     */
    get capabilities() {
        return this.#capabilities
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
        return release[this.#capabilities.fhirVersion] || null;
    }

    connect = async () => {
        switch (this.#serverConfiguration.method) {
            case ServerConfiguration.METHODS.APIKey:
                this.#headers[this.#serverConfiguration.apiKey] = this.#serverConfiguration.apiValue;
                break;
            case ServerConfiguration.METHODS.Basic:
                let auth = btoa(`${this.#serverConfiguration.basicUsername}:${this.#serverConfiguration.basicPassword}`);
                this.#headers['Authorization'] = `Basic ${auth}`;
                break;
            case ServerConfiguration.METHODS.OAuth2:
                this.#oauth2_getToken().then(response => {
                    this.#headers['Authorization'] = `${response.token_type} ${response.access_token}`;
                });
                break;
            case ServerConfiguration.METHODS.None:
            default:
                break;
        }
        this.#capabilities = await this.#fetchCapabilities();
        this.#serverReferences = await this.#parseReferences(this.#capabilities);
    }

    fetch = async (href, searchParams = {}) => {
        const url = new URL(`${this.#serverConfiguration.url}${href}`);
        Object.entries(searchParams).forEach(([key, value]) => url.searchParams.set(key, value));
        const response = await fetch(url, {
            "headers": this.#headers
        });
        return response.json();
    }

    #oauth2_getToken = async () => {
        const headers = {
            'Content-type': 'application/x-www-form-urlencoded'
        }
        if ('client_credentials' == this.#serverConfiguration.oauthGrantType) {
            const auth = btoa(`${this.#serverConfiguration.oauthClientId}:${this.#serverConfiguration.oauthClientSecret}`);
            headers['Authorization'] = `Basic ${auth}`;
        }
        const urlParams = {
            "grant_type": this.#serverConfiguration.oauthGrantType
        }

        const response = await fetch(this.#serverConfiguration.oauthTokenUrl, {
            "headers": headers,
            "method": "POST",
            "body": new URLSearchParams(urlParams).toString()
        });
        return response.json();
    }

    #fetchCapabilities = async () => {
        const url = new URL(`${this.#serverConfiguration.url}/metadata`);
        url.searchParams.set("_format", "json");
        try {
            const response = await fetch(url, {
                "cache": "reload",
                "headers": this.#headers
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
        return this.#serverReferences[resourceType];
    }

    #parseReferences = async (metadata) => {
        const serverReferences = {};
        const serverResources = metadata.rest[0].resource;
        const fhirReferences = await this.#fetchAllReferences();
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

    #fetchAllReferences = async () => {
        if (!this.#fhirReferences) {
            const response = await fetch('./assets/references.json');
            this.#fhirReferences = await response.json();
        }
        return this.#fhirReferences;
    }

    /**
     * @param {('json'|'xml'|'ttl')} format
     * @returns {Boolean}
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
        return this.#capabilities.format.some(format => formats.includes(format));
    }
}