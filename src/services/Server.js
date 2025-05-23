import ServerConfiguration from '../server/ServerConfiguration'

import fhirService from './Fhir'
import Schema from './Schema'

/**
 * @class Server
 */
export default class Server {
    /** @type {ServerConfiguration} */
    #serverConfiguration = null
    /** @type {fhir4.CapabilityStatement} */
    #capabilities = null
    #serverReferences = null
    #headers = {}
    /** @type {String} */
    #code
    /** @type {Schema} */
    #schema
    /** @type {number} */
    #tokenExpires

    /**
     * @param {String} code
     * @param {ServerConfiguration} serverConfiguration
     */
    constructor (code = '', serverConfiguration = null) {
        if (serverConfiguration == null) return
        this.#code = code
        this.#serverConfiguration = serverConfiguration
        Object.assign(this.#headers, serverConfiguration.headers)
    }

    /**
     * @returns {string}
     */
    get serverCode () {
        return this.#code
    }

    /**
     * @returns {string}
     */
    get url () {
        return this.#serverConfiguration.url
    }

    /**
     * @returns {object}
     */
    get headers () {
        return this.#headers
    }

    /**
     * @returns {fhir4.CapabilityStatement}
     */
    get capabilities () {
        return this.#capabilities
    }

    /**
     * Returns Fhir release from server fhirVersion
     * http://hl7.org/fhir/directory.html
     * @returns {string} release or null
     */
    get release () {
        return fhirService.release(this.#capabilities.fhirVersion) || null
    }

    /** @returns {Schema} */
    get schema () {
        return this.#schema
    }

    connect = async () => {
        switch (this.#serverConfiguration.method) {
        case ServerConfiguration.METHODS.APIKey:
            this.#headers[this.#serverConfiguration.apiKey] = this.#serverConfiguration.apiValue
            break
        case ServerConfiguration.METHODS.Basic:
            const auth = window.btoa(`${this.#serverConfiguration.basicUsername}:${this.#serverConfiguration.basicPassword}`)
            this.#headers.Authorization = `Basic ${auth}`
            break
        case ServerConfiguration.METHODS.OAuth2:
            this.#oauth2_getToken().then(response => {
                this.#headers.Authorization = `${response.token_type} ${response.access_token}`
                this.#tokenExpires = new Date().getTime() + (response.expires_in * 1000)
            })
            break
        case ServerConfiguration.METHODS.None:
        default:
            break
        }
        this.#capabilities = await this.#fetchCapabilities()
        this.#serverReferences = await this.#parseReferences(this.#capabilities)
        this.#schema = new Schema(await fhirService.fetchSchema(this.release))
    }

    /**
     *
     * @param {String} hash
     * @returns {Promise}
     */
    fetchHash = async (hash) => {
        const url = new URL(`${this.url}${hash}`)
        if (this.#serverConfiguration.method === ServerConfiguration.METHODS.OAuth2 && (
            !this.#tokenExpires || this.#tokenExpires - new Date().getTime() < 1)) {
            this.#oauth2_getToken().then(response => {
                this.#headers.Authorization = `${response.token_type} ${response.access_token}`
                this.#tokenExpires = new Date().getTime() + (response.expires_in * 1000)
                const headers = headersAddAccept(this.#headers)
                return this.fetch(url, { headers })
            })
        }
        const headers = headersAddAccept(this.#headers)
        return fetch(url, { headers })

        function headersAddAccept (serverHeaders) {
            const headers = {}
            Object.assign(headers, serverHeaders)
            switch (url.searchParams.get('_format')) {
            case 'xml':
                headers.Accept = 'application/fhir+xml'
                break
            case 'ttl':
                headers.Accept = 'application/x-turtle'
                break
            case 'json':
            default:
                headers.Accept = 'application/fhir+json'
            }
            return headers
        }
    }

    fetch = async (href, searchParams = {}) => {
        const url = new URL(`${this.#serverConfiguration.url}${href}`)
        Object.assign(url.searchParams, searchParams)
        const response = await fetch(url, {
            headers: this.#headers
        })
        return response.json()
    }

    #oauth2_getToken = async () => {
        const headers = {
            'Content-type': 'application/x-www-form-urlencoded',
            Accept: 'application/json'
        }
        const urlParams = {
            grant_type: this.#serverConfiguration.oauthGrantType
        }
        if (this.#serverConfiguration.oauthCredentials === ServerConfiguration.CREDENTIALS.Header) {
            const auth = window.btoa(`${this.#serverConfiguration.oauthClientId}:${this.#serverConfiguration.oauthClientSecret}`)
            headers.Authorization = `Basic ${auth}`
        } else {
            urlParams.client_id = this.#serverConfiguration.oauthClientId
            urlParams.client_secret = this.#serverConfiguration.oauthClientSecret
        }
        if (this.#serverConfiguration.oauthScope) {
            urlParams.scope = this.#serverConfiguration.oauthScope
        }

        const response = await fetch(this.#serverConfiguration.oauthTokenUrl, {
            headers,
            method: 'POST',
            body: new URLSearchParams(urlParams).toString()
        })
        return response.json()
    }

    /** @returns {fhir4.CapabilityStatement} */
    #fetchCapabilities = async () => {
        const url = new URL(`${this.#serverConfiguration.url}/metadata`)
        url.searchParams.set('_format', 'json')
        try {
            const response = await fetch(url, {
                cache: 'reload',
                headers: this.#headers
            })
            if (response.ok) {
                return response.json()
            } else {
                return Promise.reject(response)
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }

    /**
     * returns all resourceTypes that have a reference to the resourceType passed as a parameter
     * @param {string} resourceType
     * @returns
     */
    references = (resourceType) => {
        return this.#serverReferences[resourceType]
    }

    #parseReferences = async (metadata) => {
        const serverReferences = {}
        const serverResources = metadata.rest[0].resource
        const fhirReferences = await fhirService.fetchAllReferences()

        metadata.rest[0].resource.forEach((serverResource) => {
            const fhirReference = fhirReferences[this.release][serverResource.type]
            if (fhirReference) {
                // clone fhirReference
                const serverReference = structuredClone(fhirReference)
                // remove unsupported resource target
                Object.entries(serverReference).forEach(([key, value]) => {
                    const serverTarget = serverResources.find(target => key === target.type)
                    if (!serverTarget) {
                        delete serverReference[key]
                    } else if (!serverTarget.searchParam) {
                        delete serverReference[key]
                    } else {
                        // remove unsupported search parameter
                        serverReference[key].forEach((searchCode, index) => {
                            const searchParam = serverTarget.searchParam.find(searchParam => searchCode === searchParam.name)
                            if (searchParam) {
                                serverReference[key][index] = {
                                    name: searchCode,
                                    documentation: searchParam.documentation
                                }
                            } else {
                                serverReference[key].splice(index, 1)
                            }
                        })
                        if (serverReference[key].length === 0) {
                            delete serverReference[key]
                        }
                    }
                })
                if (Object.keys(serverReference).length !== 0) {
                    serverReferences[serverResource.type] = serverReference
                }
            }
        })
        return serverReferences
    }

    /**
     * @param {('json'|'xml'|'ttl')} format
     * @returns {Boolean}
     */
    isFormatEnable (format) {
        const formats = []
        switch (format) {
        case 'json':
            formats.push('json')
            formats.push('application/fhir+json')
            formats.push('html/json')
            break
        case 'xml':
            formats.push('xml')
            formats.push('application/fhir+xml')
            formats.push('html/xml')
            break
        case 'ttl':
            formats.push('ttl')
            formats.push('application/x-turtle')
            formats.push('html/turtle')
            break
        }
        return this.#capabilities.format.some(format => formats.includes(format))
    }

    /** @returns {String} URL of the validate operation help page  */
    validateHelpUrl = () => {
        return fhirService.validateHelpUrl(this.release)
    }

    /** @returns {String} Help url */
    historyHelpUrl = () => {
        return fhirService.historyHelpUrl(this.release)
    }

    /**
     * @param {String} resourceType
     * @returns {String} Help urls
     */
    resourceHelpUrl = (resourceType) => {
        return fhirService.resourceHelpUrl(resourceType, this.release)
    }

    structureDefinition = async (resourceType) => {
        return fhirService.structureDefinition(resourceType, this.release)
    }
}
