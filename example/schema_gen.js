import { app as v1 } from './src/app.js'
import pkg from '@feathersjs/feathers';
import { buildServiceSpec, shared  } from './src/template.js';
import pluralize from 'pluralize';
import YAML, { parse, stringify } from 'yaml'
import swaggerMerger from 'swagger-merger'
import { cosmiconfig } from 'cosmiconfig'
import { promises as pfs } from "fs";


let config
let configPath
const explorer = cosmiconfig('feathers-openapi',{
  searchPlaces:[
    'package.json',
    '.feathers-openapi.json'
  ]
});

await explorer.search()
  .then((result) => {
    // console.log('explorer', result)
    config = result.config
    configPath = result.filepath
  })
  .catch((error) => {
    throw new Error ("Could not find config")
  });

  
/************** UTILITIES */
const isObject = value => value !== null && typeof value === 'object';

// A "plain" object is an object who's a direct instance of Object
// (or, who has a null prototype).
const isPlainObject = value => {
  if (!isObject(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
};

// NOTE: This mutates `object`.
// It also may mutate anything that gets attached to `object` during the merge.
function merge(object, ...sources) {
  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) {
        continue;
      }

      // These checks are a week attempt at mimicking the various edge-case behaviors
      // that Lodash's `_.merge()` exhibits. Feel free to simplify and
      // remove checks that you don't need.
      if (!isPlainObject(value) && !Array.isArray(value)) {
        object[key] = value;
      } else if (Array.isArray(value) && !Array.isArray(object[key])) {
        object[key] = value;
      } else if (!isObject(object[key])) {
        object[key] = value;
      } else {
        merge(object[key], value)
      }
    }
  }

  return object;
}




// ITERATE THE ABOVE

// when done, run swagger

class Generator{

  constructor(name){
    if(!name) throw new Error("Must use name with OAS generator.")
    this.name = name
    this.spec = null
    this.schema = null
    this.methods = null
    this.specExists = false
    this.schemaExists = false
    this.base = {}
    this.schemaLoc = `./src/services/${name}/${name}.js`
    this.specLoc = `./src/services/${name}/${name}.spec.yml`
    this.outputLoc = `./specifications/openai/`
    this.config = config
    this.freeze = config.freeze.includes(name)
    this.merge = config.merge.includes(name)
  }


  async importJson(path){
    let exists = await this.checkExists(path)
    if(!exists) return false
    // eslint-disable-next-line
    let json = await import(path,{assert:{ type: 'json' }})
    if(!json || !json.default) throw new Error(`JSON file does not exist at ${path}`)
    return json.default
  }

  async importYml(path){
    let exists = await this.checkExists(path)
    if(!exists) return false
    // if(!exists) throw new Error(`YAML file does not exist at ${path}`)
    let yml = await pfs.readFile(path,'utf-8')
    let json = YAML.parse(yml)
    return json
  }

  async importJs(path){
    let exists = await this.checkExists(path)
    if(!exists) return false
    let js = await import(path)
    if(!js) throw new Error(`JS file does not exist at ${path}`)
    return js
  }


  async checkExists(path){
    return pfs.access(path).then(() => true).catch(() => false)
  }

  setConfigOption(option, value){
    this.config = Object.assign(this.config,{[option]:value})
  }
  getConfigOption(option){
    return this.config[option]
  }

  async saveConfig(){
    return await pfs.writeFile(configPath,this.config)
  }


  async getSchema(force=false){
    if(!!this.schema && !force){
      // return this.schema
    //check if schemaLocation is set
    }else if(this.config?.serviceFiles[this.name]) {
      this.schema = await this.importJs(this.config?.serviceFiles[this.name])
    }else{
      this.schema = await this.importJs(this.schemaLoc)
    }
    if(this.schema){
      this.methods = this.schema[`${this.name}Methods`] || []
      this.properties = this.schema[`${this.name}Schema`].properties || {}
      this.support = this.schema.support || {}
    }
    return this.schema
  }

  async getSpec(force=false){
    if(!!this.spec && !force){
      return this.spec
    //check if specLocation is set
    }else if(this.config?.specFiles[this.name]) {
      this.spec = await this.importYml(this.config?.specFiles[this.name])
    }else{
      this.spec = await this.importYml(this.specLoc)
    }
    return this.spec
  }

  buildSpec(){
    return buildServiceSpec({
      name: config?.singular?.[this.name] || pluralize.singular(this.name),
      names: this.name,
      methods: this.methods,
      properties: this.properties,
      requiredFields: this.required,
      ...this.support
    })
  }

  async storeSpec(){
    let specLoc = this.config?.specFiles[this.name] || this.specLoc
    let baseLoc = this.config?.starterFile || this.outputLoc+'/spec.yml'
    await this.buildBase(specLoc)
    await pfs.writeFile(baseLoc, stringify(this.base))
    await pfs.writeFile(specLoc, stringify(this.spec))
  }

  async generate(){
    let schema = await this.getSchema()
    let spec = await this.getSpec()
    let newSpec = this.buildSpec()

    if(!spec){
      this.spec = newSpec
    }else{
      if(this.freeze){
        return null
      }else{
        if(this.merge){
          this.spec = merge(spec, newSpec)
        }else{
          this.spec = newSpec
        }
      }
    }
    await this.storeSpec()
  }

  async buildBase(specLoc){
    let base = (await this.importYml(this.config.starterFile)) || {}
    base = merge(base,
    {
      openapi: '3.0.0',
      info: {},
      security: {},
      paths: {},
      components:{
        securitySchemes:{},
        requestBodies:{},
        responses:{},
        examples:{},
        schemas:{
          "$ref#errors": "./errors.yml#/components/schemas",
          "$ref#shared": "./shared.yml#/components/schemas"
        }
      }
    })
    if(this.spec.security){
      base.security[`$ref#${this.name}`] = base.security[`$ref#${this.name}`] || `../.${this.specLoc}#/security`
    }
    if(this.spec.paths){
      base.paths[`$ref#${this.name}`] = base.paths[`$ref#${this.name}`] || `../.${this.specLoc}#/paths`
    }
    if(this.spec.components?.securitySchemes){
      base.components.securitySchemes[`$ref#${this.name}`] = base.components.securitySchemes[`$ref#${this.name}`] || `../.${this.specLoc}#/components/securitySchemes`
    }
    if(this.spec.components?.requestBodies){
      base.components.requestBodies[`$ref#${this.name}`] = base.components.requestBodies[`$ref#${this.name}`] || `../.${this.specLoc}#/components/requestBodies`
    }
    if(this.spec.components?.responses){
      base.components.responses[`$ref#${this.name}`] = base.components.responses[`$ref#${this.name}`]  || `../.${this.specLoc}#/components/responses`
    }
    if(this.spec.components?.examples){
      base.components.examples[`$ref#${this.name}`] = base.components.examples[`$ref#${this.name}`]  || `../.${this.specLoc}#/components/examples`
    }
    if(this.spec.components?.schemas){
      base.components.schemas[`$ref#${this.name}`] = base.components.schemas[`$ref#${this.name}`] || `../.${this.specLoc}#/components/schemas`
    }
    this.base = base
  }
}

let generators = config.entities.map(async name=>{
  let gen = new Generator(name)
  await gen.generate()
})

await Promise.all(generators)

// swagger-merger -i ./specifications/openapi/spec.yml -o ./specifications/openapi/_merged.yml
swaggerMerger({
    input: './specifications/openapi/spec.yml',
    output: './specifications/openapi/_merged.yml',
    compact: false
}).catch(e => {
    console.error(e)
})

