class FhirService {
    #server_url = "https://hl7.org/fhir";
    #fhirReferences;
    #release = {
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

    /**
     * Get resource type help url
     * @param {String} resourceType
     * @param {String} release
     * @returns {String}
     */
    resourceHelpUrl = (resourceType, release) => {
        return `${this.#server_url}/${release}/${resourceType.toLowerCase()}.html`;
    }

    /**
     * Get history help url
     * @param {string} release
     * @returns {string}
     */
    historyHelpUrl = (release) => {
        return `${this.#server_url}/${release}//http.html#history.html`;
    }

    /**
     * get structureDefinition from hl7 server
     * @param {string} resourceType
     * @returns {object}
     */
    structureDefinition = async (resourceType, release) => {
        const url = new URL(`${this.#server_url}/${release}/${resourceType.toLowerCase()}.profile.json`);
        const response = await fetch(url, {
            "cache": "force-cache"
        });
        return response.json();
    }

    /**
     * get schema from hl7 server
     * @param {String} release
     * @returns
     */
    fetchSchema = async (release) => {
        const url = new URL(`${this.#server_url}/${release}/fhir.schema.json`);
        const response = await fetch(url, {
            "cache": "force-cache"
        });
        return response.json();
    }

    fetchAllReferences = async () => {
        if (!this.#fhirReferences) {
            const response = await fetch('./assets/references.json');
            this.#fhirReferences = await response.json();
        }
        return this.#fhirReferences;
    }

    /**
     * Returns Fhir release from server fhirVersion
     * http://hl7.org/fhir/directory.html
     * @returns {string} release or null
     */
    release = (serverVersion) => {
        return this.#release[serverVersion] || null;
    }
}

export default new FhirService();