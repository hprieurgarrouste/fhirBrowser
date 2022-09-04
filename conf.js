export default {
    "ans": {
        "url": "https://gateway.preprod.api.esante.gouv.fr/fhir",
        "headers": {
            "ESANTE-API-KEY": "80133b02-e74a-47b1-81bb-1111f8b7081f"
        }
    },
    "firely": {
        "url": "https://server.fire.ly"
    },
    "hapi": {
        "url": "http://hapi.fhir.org/baseR4"
    },
    "edr": {
        "url": "http://10.42.12.149:8080/edr/fhir",
        "auth": {
            "method": "oauth2",
            "setup": {
                "access_token_url": "https://auth.forge.enovacom.cloud/auth/realms/enovacom/protocol/openid-connect/token",
                "client_id": "app-edr",
                "client_secret": "c92eaf3e-2d6a-4ab9-b29c-cd9cf31cd82b",
                "grant_type": "password",
                "username": "hprieur",
                "password": "Julie260996*"
            }
        },
        "headers": {}
    }
};