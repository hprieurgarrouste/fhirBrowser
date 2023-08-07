export class FhirService {
    static {
        this._server = null;
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
            "3.0.2": "R3"
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
        const ref = [];
        this._server.capabilities.rest[0].resource
            .filter(resource => resource?.searchParam?.find((searchParam) => searchParam.type === 'reference' && searchParam.name === resourceType.type.toLowerCase()))
            .forEach(resource => ref.push(resource.type));
        return ref;
    }

    static async capabilities() {
        const url = new URL(`${this._server.url}/metadata`);
        url.searchParams.set("_format", "json");
        try {
            const response = await fetch(url, {
                "cache": "reload",
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

    static async readXml(type, id) {
        const url = new URL(`${this._server.url}/${type}/${id}`);
        url.searchParams.set("_format", "xml");
        url.searchParams.set("_pretty", "true");
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
        const response = await fetch(url, {
            "headers": this._server.headers
        });
        return response.json();
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
        return response.json();
    }

}