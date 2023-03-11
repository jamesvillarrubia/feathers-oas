import { buildServiceSpec } from './template.js';
import pluralize from 'pluralize';
import YAML, { stringify } from 'yaml'
import fs, { promises as pfs } from "fs";
import { merge, snakeToCamel } from './utils.js'
import Path from 'path';
import debug from 'debug';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);


export const getDirectories = async (source)=>{    
  return (
    await pfs.readdir(
      Path.join(process.cwd(), source), { withFileTypes: true }
    ).catch(e=>{
      throw new Error(`There is no FeathersJS ${Path.join(process.cwd(), source)} folder.  Are you sure you are in the right spot?`, e)
    })
  ).filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}

export class Generator{

    constructor(name, fullConfig){
      let { config, filePath } = fullConfig
      if(!name) throw new Error("Must use name with OAS generator.")
      this.name = name
      this.spec = null
      this.schema = null
      this.methods = null
      this.specExists = false
      this.schemaExists = false
      this.base = {}
      this.path = name
      this.pwd = process.cwd()
      this.fileType = config?.fileType || 'js'
      this.mainFolder = config?.mainFolder || 'src'
      this.schemaLoc = `./${this.mainFolder}/services/${name}/${name}.${this.fileType}`
      this.specLoc = `./${this.mainFolder}/services/${name}/${name}.spec.yml`
      this.outputLoc = `./specifications/openapi/`
      this.config = config
      this.freeze = config ? !!config.freeze?.includes(name) : false
      this.merge = config ? !!config.merge?.includes(name) : true
      debug('initialized', this);
    }

    rebuildLocations(){
      this.schemaLoc = `./${this.mainFolder}/services/${this.name}/${this.name}.${this.fileType}`
      this.specLoc = `./${this.mainFolder}/services/${this.name}/${this.name}.spec.yml`
    }

    async init(){
      let specDir = Path.join(this.pwd, 'specifications')
      let openDir = Path.join(this.pwd, 'specifications/openapi')
      let errorPath = Path.join(this.pwd, 'specifications/openapi/errors.yml')
      let sharedPath = Path.join(this.pwd, 'specifications/openapi/shared.yml')

      if (!fs.existsSync(specDir)){
        fs.mkdirSync(specDir);
      }

      if (!fs.existsSync(openDir)){
        fs.mkdirSync(openDir);
      }

      if (!fs.existsSync(errorPath)){
        pfs.copyFile(Path.join(__dirname,'./errors.yml'), errorPath)
      }

      if (!fs.existsSync(sharedPath)){
        pfs.copyFile(Path.join(__dirname,'./shared.yml'), sharedPath)
      } 
    } 


    async importJson(path){
      debug('importJson', path);
      let exists = await this.checkExists(path)
      if(!exists) return false
      let json = await import(Path.join(this.pwd, path),{assert:{ type: 'json' }})
      if(!json || !json.default) throw new Error(`JSON file does not exist at ${path}`)
      return json.default``
    }
  
    async importYml(path){
      try{
        debug('importYml', path);
        let exists = await this.checkExists(path)
        if(!exists) return false
        // if(!exists) throw new Error(`YAML file does not exist at ${path}`)
        let yml = await pfs.readFile(Path.join(this.pwd, path),'utf-8')
        let json = YAML.parse(yml)
        return json
      }catch(e){
        console.log(e)
      }
    }
  
    async importJs(path){
      try{
        debug('importJS', path);
        let ts_exists = await this.checkExists(path.slice(0,-3)+'.ts')
        if(ts_exists){
          console.log(`Found a .ts file. Using the ./lib folder for service '${this.name}'.`)
          // this.mainFolder = 'lib'
          // this.rebuildLocations()
          path = path.replace('/src/','/lib/')
        }
        let js_exists = await this.checkExists(path)
        if(!js_exists && !ts_exists) return false
        
        if(js_exists){
          let js = await import(Path.join(this.pwd, path))
          if(!js) throw new Error(`JS file does not exist at ${path}`)
          return js
        }
      }catch(e){
        console.log(e)
      }
    }
   

      
    async checkExists(path){
      return pfs.access(Path.join(this.pwd, path)).then(() => true).catch(() => false)
    }
  
    async getSchema(force=false){
      if(!!this.schema && !force) return this.schema;

      let schemaLocation = this.config?.serviceFiles?.[this.name] || this.schemaLoc;
      this.schema = await this.importJs(schemaLocation);
      let shared = await this.importJs(schemaLocation.slice(0,-3)+'.shared'+schemaLocation.slice(-3))

      if(this.schema){
        this.methods = this.schema[`${snakeToCamel(this.name)}Methods`] || [];
        this.properties = this.schema?.[`${snakeToCamel(this.name)}Schema`]?.properties || {};
        this.support = this.schema?.support || {};
        this.path = this.schema[`${snakeToCamel(this.name)}Path`]
      }
      if(shared){
        this.methods = shared[`${snakeToCamel(this.name)}Methods`] || [];
        this.path = shared[`${snakeToCamel(this.name)}Path`]
      }

      debug('getSchema', this.schema);
      return this.schema;
    } 
  
    async getSpec(force=false){
      if(!!this.spec && !force) return this.spec;
    
      const specLocation = this.config?.specFiles?.[this.name] || this.specLoc;
      this.spec = await this.importYml(specLocation);
    
      debug('getSpec', this.spec);
      return this.spec;
    }
  
    buildSpec(){
      debug('buildSpec');
      return buildServiceSpec({
        name: this.config?.singular?.[this.name] || pluralize.singular(this.name),
        names: this.name,
        methods: this.methods,
        properties: this.properties,
        path: this.path,
        requiredFields: this.required,
        ...this.support
      })
    }
  
    async storeSpec(){
      debug('storeSpec');
      let specLoc = this.config?.specFiles?.[this.name] || this.specLoc
      await pfs.writeFile(Path.join(this.pwd, specLoc), stringify(this.spec))
    }
    async storeBase(){
      let baseLoc = this.config?.starterFile || this.outputLoc+'spec.yml'
      let path = Path.join(this.pwd, baseLoc)
      await pfs.writeFile(path, stringify(this.base))
    }
  
    async generate(){
      let schema = await this.getSchema()
      let spec = await this.getSpec()
      let newSpec = this.buildSpec()
  
      if(!spec){
        this.spec = newSpec
        await this.storeSpec()
      }else{
        if(!this.freeze){
          if(this.merge){
            this.spec = merge(spec, newSpec)
          }else{
            this.spec = newSpec
          }
          await this.storeSpec()
        }
      }

      let specLoc = this.config?.specFiles?.[this.name] || this.specLoc
      await this.buildBase(specLoc)
      await this.storeBase()
    }
    
    async buildBase(specLoc){
      let baseLoc = this.config?.starterFile || this.outputLoc+'spec.yml'
      let base = (await this.importYml(baseLoc)) || {}
      base = merge(base,
      {
        openapi: '3.0.0',
        info: {},
        security: [],
        paths: {},
        components:{
          securitySchemes:{},
          requestBodies:{},
          responses:{},
          examples:{},
          schemas:{
            "$ref#errors": "./errors.yml#/components/schemas",
            "$ref#shared": "./shared.yml#/components/schemas"  }}})


      if(this.spec.security){
        base.security.push({[`$ref#${base.security.length}`]:`../.${this.specLoc}#/security`})
      }

      const refs = ['paths', 'securitySchemes', 'requestBodies', 'responses', 'examples', 'schemas']

      refs.forEach(ref => {  // loop through the refs array to check if the spec has a value for each of them and set the base accordingly 

        if (this.spec[ref]){ // check if the spec has a value for each of them 
          base[ref][`$ref#${this.name}`] = base[ref][`$ref#${this.name}`] || `../.${this.specLoc}#${ref}` // set the base accordingly 
        } else { delete base[ref]?.[`$ref#${this.name}`] } // delete the reference if there is no value in the spec 

        if (this.spec.components?.[ref]){
            base.components[ref][`$ref#${this.name}`] = base.components[ref][`$ref#${this.name}`] || `../.${this.specLoc}#/components/${ref}`
          } else { delete base.components[ref]?.[`$ref#${this.name}`] } 
  
      })

      this.base = base // set the new base  

    }  

    // async buildBase(specLoc){
    //   let base = (await this.importYml(this.config.starterFile)) || {}
    //   base = merge(base,
    //   {
    //     openapi: '3.0.0',
    //     info: {},
    //     security: {},
    //     paths: {},
    //     components:{
    //       securitySchemes:{},
    //       requestBodies:{},
    //       responses:{},
    //       examples:{},
    //       schemas:{
    //         "$ref#errors": "./errors.yml#/components/schemas",
    //         "$ref#shared": "./shared.yml#/components/schemas"
    //       }
    //     }
    //   })
    //   if(this.spec.security){
    //     base.security[`$ref#${this.name}`] = base.security[`$ref#${this.name}`] || `../.${this.specLoc}#/security`
    //   }else { delete base.security?.[`$ref#${this.name}`] }

    //   if(this.spec.paths){
    //     base.paths[`$ref#${this.name}`] = base.paths[`$ref#${this.name}`] || `../.${this.specLoc}#/paths`
    //   }else { delete base.paths?.[`$ref#${this.name}`] }

    //   if(this.spec.components?.securitySchemes){
    //     base.components.securitySchemes[`$ref#${this.name}`] = base.components.securitySchemes[`$ref#${this.name}`] || `../.${this.specLoc}#/components/securitySchemes`
    //   }else { delete base.components?.securitySchemes?.[`$ref#${this.name}`] }

    //   if(this.spec.components?.requestBodies){
    //     base.components.requestBodies[`$ref#${this.name}`] = base.components.requestBodies[`$ref#${this.name}`] || `../.${this.specLoc}#/components/requestBodies`
    //   }else { delete base.components?.requestBodies?.[`$ref#${this.name}`] }

    //   if(this.spec.components?.responses){
    //     base.components.responses[`$ref#${this.name}`] = base.components.responses[`$ref#${this.name}`]  || `../.${this.specLoc}#/components/responses`
    //   }else { delete base.components?.response?.[`$ref#${this.name}`] }

    //   if(this.spec.components?.examples){
    //     base.components.examples[`$ref#${this.name}`] = base.components.examples[`$ref#${this.name}`]  || `../.${this.specLoc}#/components/examples`
    //   }else { delete base.component?.examples?.[`$ref#${this.name}`] }

    //   if(this.spec.components?.schemas){
    //     base.components.schemas[`$ref#${this.name}`] = base.components.schemas[`$ref#${this.name}`] || `../.${this.specLoc}#/components/schemas`
    //   }else { delete base.components?.schemas?.[`$ref#${this.name}`] }

    //   this.base = base
    // }
  }
  
  