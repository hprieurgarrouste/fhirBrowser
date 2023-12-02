import fhirIconSet from '../assets/fhirIconSet.json';
import fhirReferences from '../assets/references.json';

export class FhirService {
    static {
        this._server = null;
        this._references = {};
    }

    /**
         * Returns Fhir release from server fhirVersion
         * http://hl7.org/fhir/directory.html
         * @returns release or null
         */
    static get release() {
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
        return release[this._server.capabilities.fhirVersion] || null;
    }

    static set server(srv) {
        this._server = srv;
    }
    static get server() {
        return this._server;
    }

    static helpUrl(resourceType) {
        return `https://hl7.org/fhir/${this.release}/${resourceType.toLowerCase()}.html`;
    }

    static references(resourceType) {
        return this._references[resourceType];
    }

    static formatEnable(format) {
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
        let x = this.server.capabilities.format.some(f => {
            return formats.includes(f);
        });
        return x;
    }
    static async capabilities(server) {
        const url = new URL(`${server.url}/metadata`);
        url.searchParams.set("_format", "json");
        try {
            const response = await fetch(url, {
                "cache": "reload",
                "headers": server.headers
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
     * get structureDefinition from hl7 server
     * @param {*} resourceType
     * @returns
     */
    static async structureDefinition(resourceType) {
        const url = new URL(`https://hl7.org/fhir/${this.release}/${resourceType.toLowerCase()}.profile.json`);
        const response = await fetch(url, {
            "cache": "force-cache"
        });
        return response.json();
    }

    static async read(type, id) {
        const url = new URL(`${this._server.url}/${type}/${id}`);
        url.searchParams.set("_format", "json");
        const response = await fetch(url, {
            "headers": this._server.headers
        });
        return response.json();
    }

    static async readHistory(type, id) {
        const url = new URL(`${this._server.url}/${type}/${id}/_history`);
        url.searchParams.set("_summary", "text");
        url.searchParams.set("_format", "json");
        const response = await fetch(url, {
            "headers": this._server.headers
        });
        return response.json();
    }

    static async readXml(type, id) {
        const url = new URL(`${this._server.url}/${type}/${id}`);
        url.searchParams.set("_format", "xml");
        const response = await fetch(url, {
            "headers": this._server.headers
        });
        return response.text();
    }

    static async readTtl(type, id) {
        const url = new URL(`${this._server.url}/${type}/${id}`);
        url.searchParams.set("_format", "ttl");
        const response = await fetch(url, {
            "headers": this._server.headers
        });
        return response.text();
    }

    static async searchByLink(linkUrl, parameters = []) {
        const url = new URL(linkUrl);
        url.searchParams.set("_summary", "true");
        url.searchParams.set("_format", "json");
        parameters.forEach(parameter => {
            url.searchParams.set(parameter.name, parameter.value);
        });
        try {
            const response = await fetch(url, {
                "headers": this._server.headers
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

    static async searchCount(type, parameters = []) {
        const url = new URL(`${this._server.url}/${type}`);
        url.searchParams.set("_summary", "count");
        url.searchParams.set("_format", "json");
        parameters.forEach(parameter => {
            url.searchParams.set(parameter.name, parameter.value);
        });
        const response = await fetch(url, {
            "headers": this._server.headers
        });
        if (!response.ok) {
            throw response
        }
        return response.json();
    }

    static async execute(request) {
        const url = new URL(`${this._server.url}/${request}`);
        url.searchParams.set("_format", "json");
        const response = await fetch(url, {
            "headers": this._server.headers
        });
        if (!response.ok) {
            throw response
        }
        return response.json();
    }

    static async connect(code, server) {
        switch (server.auth?.method) {
            case "oauth2":
                this.oauth2_getToken(server.auth.setup).then(response => {
                    if (!server.headers) server.headers = {};
                    server.headers.Authorization = `${response.token_type} ${response.access_token}`;
                });
                break;
            case "basic":
                let auth = btoa(`${server.auth.setup.username}:${server.auth.setup.password}`);
                if (!server.headers) server.headers = {};
                server.headers.Authorization = `Basic ${auth}`;
                break;
            case "apikey":
                if (!server.headers) server.headers = {};
                server.headers[server.auth.setup.key] = server.auth.setup.value;
                break;
            case "noauth":
            default:
                break;
        }
        await FhirService.capabilities(server).then(metadata => {
            server.serverCode = code;
            server.capabilities = metadata;
            FhirService.server = server;
            this._references = this.parseReferences(metadata);
        });

    }

    static parseReferences(metadata) {
        const serverReferences = {};
        const serverResources = metadata.rest[0].resource;
        metadata.rest[0].resource.forEach((serverResource) => {
            const fhirReference = fhirReferences[this.release][serverResource.type];
            if (fhirReference) {
                //clone fhirReference
                const serverReference = JSON.parse(JSON.stringify(fhirReference));
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
        });
        return serverReferences;
    }

    static async oauth2_getToken(setup) {
        let urlParams = {
            "grant_type": setup.grant_type
            //"client_id": setup.client_id,
            //"client_secret": setup.client_secret,
            //"username": setup.username,
            //"password": setup.password
        }
        const headers = {
            "Content-type": "application/x-www-form-urlencoded"
        };
        if ("client_credentials" == setup.grant_type) {
            const auth = btoa(`${setup.client_id}:${setup.client_secret}`);
            headers.Authorization = `Basic ${auth}`;
        }

        let result = new URLSearchParams(urlParams);
        const response = await fetch(setup.access_token_url, {
            "headers": headers,
            "method": "POST",
            "body": result.toString()
        });
        return response.json();
    }

    static ResourceIcon(resource) {
        return fhirIconSet[resource.toLowerCase()] || 'unknown_med';
    }
}