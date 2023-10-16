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

    static async readXml(type, id) {
        const url = new URL(`${this._server.url}/${type}/${id}`);
        url.searchParams.set("_format", "xml");
        url.searchParams.set("_pretty", "true");
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

    static async connect(code, server) {
        if (server.auth) {
            switch (server.auth.method) {
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
                default:
                    break;
            }
        }
        await FhirService.capabilities(server).then(metadata => {
            server.serverCode = code;
            server.capabilities = metadata;
            FhirService.server = server;
        });
    }

    static async oauth2_getToken(setup) {
        let urlParams = {
            "client_id": setup.client_id,
            "client_secret": setup.client_secret,
            "grant_type": setup.grant_type,
            "username": setup.username,
            "password": setup.password
        }
        let result = new URLSearchParams(urlParams);
        const response = await fetch(setup.access_token_url, {
            "headers": {
                "Content-type": "application/x-www-form-urlencoded"
            },
            "method": "POST",
            "body": result.toString()
        });
        return response.json();
    }


    static ResourceIcon(resource) {
        const fhirIconSet = {
            'account': 'account_balance_wallet',
            'accountreport': 'account_balance_wallet',
            'activitydefinition': 'quiz',
            'adverseevent': 'emergency_home',
            'allergyintolerance': 'allergy',
            'appointment': 'today',
            'appointmentresponse': 'event_available',
            'auditevent': 'browse_activity',
            'basic': 'shapes',
            'binary': 'data_object',
            'biologicallyderivedproduct': 'fork_right',
            'bodystructure': 'skeleton',
            'bundle': 'format_paragraph',
            'capabilitystatement': 'campaign',
            'careplan': 'flowsheet',
            'careteam': 'groups',
            'catalogentry': 'description',
            'chargeitem': 'sell',
            'chargeitemdefinition': 'sell',
            'claim': 'request_quote',
            'claimresponse': 'task',
            'clinicalimpression': 'comment',
            'codesystem': 'data_array',
            'communication': 'mail',
            'communicationrequest': 'outgoing_mail',
            'compartmentdefinition': 'category',
            'composition': 'blender',
            'conceptmap': 'integration_instructions',
            'condition': 'coronavirus',
            'consent': 'done',
            'contract': 'contract',
            'coverage': 'shield',
            'coverageeligibilityrequest': 'policy',
            'coverageeligibilityresponse': 'verified_user',
            'detectedissue': 'bug_report',
            'device': 'electrical_services',
            'devicedefinition': 'inventory_2',
            'devicemetric': 'health_metrics',
            'devicerequest': 'unknown_document',
            'deviceusestatement': 'home_iot_device',
            'diagnosticreport': 'diagnosis',
            'documentmanifest': 'dataset',
            'documentreference': 'bookmarks',
            'effectevidencesynthesis': 'clinical_notes',
            'encounter': 'medical_services',
            'enrollmentrequest': 'contact_support',
            'enrollmentresponse': 'support_agent',
            'endpoint': 'location_on',
            'episodeofcare': 'blood_pressure',
            'evidence': 'search_check',
            'evidencevariable': 'troubleshoot',
            'eventdefinition': 'event_note',
            'examplescenario': 'video_library',
            'explanationofbenefit': 'speaker_notes',
            'familymemberhistory': 'family_restroom',
            'familimemberhistory': 'history',
            'flag': 'flag',
            'goal': 'sports_score',
            'graphdefinition': 'bar_chart',
            'group': 'group',
            'guidanceresponse': 'mark_email_read',
            'healthcareservice': 'mixture_med',
            'implementationguide': 'developer_guide',
            'imagingstudy': 'radiology',
            'immunization': 'immunology',
            'immunizationevaluation': 'microbiology',
            'immunizationrecommendation': 'mixture_med',
            'insuranceplan': 'payments',
            'invoice': 'receipt_long',
            'library': 'local_library',
            'linkage': 'link',
            'list': 'list',
            'location': 'pin_drop',
            'manifest': 'dataset',
            'measure': 'scale',
            'measurereport': 'lab_profile',
            'media': 'perm_media',
            'medicinalproduct': 'pill',
            'medicinalproductauthorization': 'pill',
            'medicinalproductcontraindication': 'pill_off',
            'medicinalproductindication': 'pill',
            'medicinalproductingredient': 'pill',
            'medicinalproductinteraction': 'pill',
            'medicinalproductmanufactured': 'pill',
            'medicinalproductpackaged': 'pill',
            'medicinalproductpharmaceutical': 'pill',
            'medicinalproductundesirableeffect': 'sick',
            'medication': 'medication',
            'medicationadministration': 'medication_liquid',
            'medicationdispense': 'prescriptions',
            'medicationknowledge': 'medication',
            'medicationrequest': 'medication',
            'medicationstatement': 'medication',
            'messagedefinition': 'developer_guide',
            'messageheader': 'code',
            'molecularsequence': 'genetics',
            'namingsystem': 'import_contacts',
            'nutritionorder': 'restaurant',
            'observation': 'description',
            'observationdefinition': 'file_present',
            'operationdefinition': 'function',
            'operationoutcome': 'function',
            'organization': 'local_hospital',
            'organizationaffiliation': 'account_tree',
            'parameters': 'settings',
            'patient': 'personal_injury',
            'paymentnotice': 'credit_card',
            'paymentreconciliation': 'credit_score',
            'person': 'person',
            'plandefinition': 'view_list',
            'practitioner': 'stethoscope',
            'practitionerrole': 'medical_information',
            'procedure': 'checklist',
            'provenance': 'deployed_code_history',
            'questionnaire': 'assignment',
            'questionnaireresponse': 'assignment_turned_in',
            'relatedperson': 'family_restroom',
            'requestgroup': 'group_work',
            'researchdefinition': 'lab_panel',
            'researchelementdefinition': 'labs',
            'researchstudy': 'biotech',
            'researchsubject': 'biotech',
            'resource': 'description',
            'riskevidencesynthesis': 'feedback',
            'riskassessment': 'problem',
            'schedule': 'calendar_month',
            'searchparameter': 'screen_search_desktop',
            'servicerequest': 'ecg',
            'slot': 'view_agenda',
            'specimen': 'colorize',
            'specimendefinition': 'colorize',
            'structuredefinition': 'developer_guide',
            'structuremap': 'table',
            'subscription': 'loyalty',
            'substance': 'science',
            'substancenucleicacid': 'science',
            'substancepolymer': 'science',
            'substanceprotein': 'science',
            'substancereferenceinformation': 'science',
            'substancesourcematerial': 'science',
            'substancespecification': 'science',
            'supplydelivery': 'deployed_code',
            'supplyrequest': 'deployed_code_history',
            'task': 'task',
            'terminologycapabilities': 'developer_guide',
            'testreport': 'integration_instructions',
            'testscript': 'code_blocks',
            'valueset': 'data_array',
            'verificationresult': 'new_releases',
            'visionprescription': 'ophthalmology'
        };
        return fhirIconSet[resource.toLowerCase()] || 'unknown_med';
    }
}