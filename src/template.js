let paths = ({ Name, Names, name, names, path, properties, requiredFields, examples, patchedFields, methods }) => ({
    [`/${path}`]: {
        get: (!methods?.includes('find')) ? {} : {
            tags: [names],
            summary: `Returns ${name} based on query parameters`,
            operationId: `get${Names}`,
            description: `By including the appropriate query string parameters, search & return relevant ${names} records.`,
            responses: {
                "200": {
                    "$ref": `#/components/responses/${Name}_FJS_Array`
                },
                "400": {
                    "description": "bad input parameter"
                },
                default: {
                    "description": "default response if no query string parameters are sent",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": `#/components/schemas/Error`
                            }
                        }
                    }
                }
            }
        },
        post: (!methods?.includes('create')) ? {} : {
            tags: [names],
            summary: `adds a new ${name}`,
            operationId: `post${Name}`,
            description: `Creates a new ${name}`,
            requestBody: {
                content: {
                    "application/json": {
                        "schema": {
                            "oneOf": [
                                {
                                    "$ref": `#/components/schemas/${Name}`
                                },
                                {
                                    "type": "array",
                                    "items": {
                                        "$ref": `#/components/schemas/${Name}`
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            responses: {
                "201": {
                    "description": `${Name} created.`,
                    "content": {
                        "application/json": {
                            "schema": {
                                "oneOf": [
                                    {
                                        "$ref": `#/components/schemas/${Name}`
                                    },
                                    {
                                        "type": "array",
                                        "items": {
                                            "$ref": `#/components/schemas/${Name}`
                                        }
                                    }
                                ]
                            },
                            "examples": {
                                "${names}_post_default": {
                                    "$ref": `#/components/examples/${names}_post_default`
                                },
                                "${names}_post_array": {
                                    "$ref": `#/components/examples/${names}_post_array`
                                }
                            }
                        }
                    }
                },
                "400": {
                    "description": "invalid input, object invalid",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/Error"
                            }
                        }
                    }
                },
                "409": {
                    "description": `that ${name} already exists`
                },
                "default": {
                    "description": "unexpected error",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/Error"
                            }
                        }
                    }
                }
            }
        },
    },
    [`/${path}/{${name}Id}`]: {
        get: (!methods?.includes('get')) ? undefined : {
            tags: [names],
            "summary": `Returns ${name} based id`,
            "operationId": `get${Name}`,
            "description": `By including the id, get a single ${name}`,
            "parameters": [
                {
                    "in": "path",
                    "name": `${name}Id`,
                    "description": `the id of a specific ${name}`,
                    "required": true,
                    "schema": {
                        "$ref": "#/components/schemas/IntegerId"
                    }
                }
            ],
            "responses": {
                "200": {
                    "description": "includes the results matching query string criteria",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "array",
                                "items": {
                                    "$ref": `#/components/schemas/${Name}`
                                }
                            },
                            "examples": {
                                [`${names}_id_default`]: {
                                    "$ref": `#/components/examples/${names}_id_default`
                                }
                            }
                        }
                    }
                },
                "default": {
                    "description": "unexpected error",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/Error"
                            }
                        }
                    }
                }
            },
        },
        delete: (!methods?.includes('remove')) ? undefined : {
            tags: [names],
            "summary": `soft deletes multiple ${names}`,
            "operationId": `delete${Names}`,
            "parameters": [
                {
                    "in": "path",
                    "name": `${name}Id`,
                    "description": `the id of a specific ${name}`,
                    "required": true,
                    "schema": {
                        "$ref": "#/components/schemas/IntegerId"
                    }
                }
            ],
            "responses": {
                "405": {
                    "description": "multiple deletes not allowed",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object"
                            },
                            "examples": {
                                [`${names}_delete`]: {
                                    "$ref": `#/components/examples/${names}_id_delete_default`
                                }
                            }
                        }
                    }
                }
            }
        },
        put: (!methods?.includes('update')) ? undefined : {
            tags: [names],
            "summary": `updates a whole ${name}`,
            "operationId": `put${Name}`,
            "description": `Updates a whole ${name}`,
            "parameters": [
                {
                    "in": "path",
                    "name": `${name}Id`,
                    "description": `the id of a specific ${name}`,
                    "required": true,
                    "schema": {
                        "$ref": "#/components/schemas/IntegerId"
                    }
                }
            ],
            "requestBody": {
                "content": {
                    "application/json": {
                        "schema": {
                            "oneOf": [
                                {
                                    "$ref": `#/components/schemas/${Name}`
                                }
                            ]
                        }
                    }
                }
            },
            "responses": {
                "200": {
                    "description": `${name} updated`,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": `#/components/schemas/${Name}`
                            },
                            "examples": {
                                [`${names}_id_put_default`]: {
                                    "$ref": `#/components/examples/${names}_id_put_default`
                                }
                            }
                        }
                    }
                },
                "400": {
                    "description": "invalid input, object invalid"
                }
            }
        },
        patch: (!methods?.includes('patch')) ? undefined : {
            tags: [names],
            "summary": `patches a subset of fields on a ${name}`,
            "operationId": `patch${Name}`,
            "description": `Patches a ${name} by field`,
            "parameters": [
                {
                    "in": "path",
                    "name": `${name}Id`,
                    "description": `the id of a specific ${name}`,
                    "required": true,
                    "schema": {
                        "$ref": "#/components/schemas/IntegerId"
                    }
                }
            ],
            "requestBody": {
                "content": {
                    "application/json": {
                        "schema": {
                            "$ref": `#/components/schemas/${Name}`
                        }
                    }
                }
            },
            "parameters": [
                {
                    "in": "path",
                    "name": `${name}Id`,
                    "description": `the id of a specific ${name}`,
                    "schema": {
                        "$ref": "#/components/schemas/IntegerId"
                    },
                    "required": true
                }
            ],
            "responses": {
                "200": {
                    "description": `${name} patched`,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": `#/components/schemas/${Name}`
                            },
                            "examples": {
                                [`${names}_id_patch_default`]: {
                                    "$ref": `#/components/examples/${names}_id_patch_default`
                                }
                            }
                        }
                    }
                },
                "400": {
                    "description": "invalid input, object invalid",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/Error"
                            }
                        }
                    }
                }
            }
        }
    }
})
let components = ({ Name, Names, name, names, properties, requiredFields, examples, patchedFields }) => ({
    responses: {
        [`${Name}_FJS_Array`]: {
            "description": "includes the results matching query string criteria",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "required": [
                            "total",
                            "limit",
                            "skip",
                            "data"
                        ],
                        "properties": {
                            "total": {
                                "type": "integer"
                            },
                            "limit": {
                                "type": "integer"
                            },
                            "skip": {
                                "type": "integer"
                            },
                            "data": {
                                "type": "array",
                                "items": {
                                    "$ref": `#/components/schemas/${Name}`
                                }
                            }
                        }
                    },
                    "examples": {
                        [`${names}_default`]: {
                            "$ref": `#/components/examples/${names}_default`
                        },
                        [`${names}_zero`]: {
                            "$ref": `#/components/examples/${names}_zero`
                        }
                    }
                }
            }
        }
    },
    schemas: {
        [`${Name}`]: {
            "type": "object",
            "required": requiredFields,
            "properties": {
                "id": {
                    "$ref": "#/components/schemas/IntegerId"
                },
                ...properties
            }
        }
    },
    examples: {
        [`${names}_zero`]: {
            "value": {
                "total": 0,
                "limit": 10,
                "skip": 0,
                "data": []
            }
        },
        [`${names}_default`]: {
            "value": {
                "total": 2,
                "limit": 10,
                "skip": 0,
                "data": examples.map(o => Object.assign({}, o))
            }
        },
        [`${names}_post_default`]: {
            "value": {
                ...examples[0]
            }
        },
        [`${names}_post_array`]: {
            "value": examples.map(o => Object.assign({}, o))
        },
        [`${names}_id_default`]: {
            "$ref": `#/components/examples/${names}_post_default`
        },
        [`${names}_id_patch_default`]: {
            "value": {
                ...examples[0],
                ...patchedFields
            }
        },
        [`${names}_id_put_default`]: {
            "value": Object.assign({}, examples[0])
        },
        [`${names}_id_delete_default`]: {
            "value": Object.assign({}, examples[0])
        }
    }
})

// let spec = ({ securitySchemes, requestBodies, responses, examples, schemas }) => ({
//     "openapi": "3.0.0",
//     "info": {},
//     "security": [
//         {
//             "$ref": "./authentication.yml#/security"
//         }
//     ],
//     "paths": {
//         "$ref#keys": "./keys.yml#/paths",
//         "$ref#obsv": "./observations.yml#/paths",
//         "$ref#auth": "./authentication.yml#/paths"
//     },
//     "components": {
//         "securitySchemes": {
//             "$ref#auth": "./authentication.yml#/components/securitySchemes"
//         },
//         "requestBodies": {
//             "$ref#auth": "./authentication.yml#/components/requestBodies"
//         },
//         "responses": {
//             "$ref#keys": "./keys.yml#/components/responses",
//             "$ref#obsv": "./observations.yml#/components/responses",
//             "$ref#auth": "./authentication.yml#/components/responses"
//         },
//         "examples":

//         {
//             "$ref#keys": "./keys.yml#/components/examples",
//             "$ref#obsv": "./observations.yml#/components/examples",
//             "$ref#auth": "./authentication.yml#/components/examples"
//         },
//         "schemas": {
//             "$ref#keys": "./keys.yml#/components/schemas",
//             "$ref#obsv": "./observations.yml#/components/schemas",
//             "$ref#erro": "./errors.yml#/components/schemas",
//             "$ref#shar": "./shared.yml#/components/schemas"
//         },
//         "schemas": schemas.reduce((a, v) => {
//             a[`$ref#${names}`] = (`./${names}.yml#/components/schemas`)
//         }, {})
//     }
// });




export const buildServiceSpec = (options) => {
    options = Object.assign(
        {},
        options,
        {
            name: options.name,
            Name: options.name.charAt(0).toUpperCase() + options.name.slice(1),
            names: options.plural || options.name + 's',
            requiredFields: options.requiredFields || [],
            properties: options.properties || {},
            examples: options.examples || [],
            patchedFields: options.patchedFields || {}
        }
    )
    options.Names = options.names.charAt(0).toUpperCase() + options.names.slice(1);

    let c = components(options)
    let p = paths(options)

    return { paths: p, components: c }
}

// export const shared = {
//     "components": {
//         "schemas": {
//             "Error": {
//                 "type": "object",
//                 "required": [
//                     "code",
//                     "message"
//                 ],
//                 "properties": {
//                     "code": {
//                         "type": "integer",
//                         "format": "int32",
//                         "minimum": 0
//                     },
//                     "message": {
//                         "type": "string"
//                     },
//                     "name": {
//                         "type": "string"
//                     },
//                     "className": {
//                         "type": "string"
//                     }
//                 }
//             },
//             "IntegerId": {
//                 "type": "integer",
//                 "readOnly": true,
//                 "minimum": 0,
//                 "maximum": 100000000
//             },
//             "ISODate": {
//                 "type": "string",
//                 "format": "date-time",
//                 "example": "2017-07-21T17:32:28.000Z"
//             }
//         }
//     }
// }
