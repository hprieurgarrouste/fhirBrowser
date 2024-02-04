export default class Schema {
    #schema

    constructor (schema) {
        this.#schema = schema
    }

    getRefByResourceType = (resourceType) => {
        if (this.#schema.discriminator) {
            return this.#schema.discriminator.mapping[resourceType]
        }
        return this.#schema.definitions[resourceType]
    }

    getDefinitionByResourceType = (resourceType) => {
        return this.getDefinitionByRef(this.getRefByResourceType(resourceType))
    }

    getDefinitionByRef = (ref) => {
        return this.#evalRef(ref)
    }

    /** @param {String} name */
    getDefinitionByName = (name) => {
        return this.#schema.definitions[name]
    }

    #evalRef = (ref) => {
        const path = ref.replace(/^#\//, '')
        return path.split('/').reduce((a, b) => a[b], this.#schema)
    }
}
