#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import { Generator, getDirectories } from '../src/generator.js';
import swaggerMerger from 'swagger-merger'
import { cosmiconfigSync } from 'cosmiconfig'
import Debug from 'debug';
import npmAddScript from 'npm-add-script'


// import swagToStatic from './static.js'

Debug.colors = [1,3,6,2,4,5];
const debug = Debug('foas')

debug('booting %o', 'foas');


// **** Get cli arguments ****//
const argv = yargs(hideBin(process.argv))
.option('config', {
    alias: 'c',
    type: 'string',
    description: 'set config file'
  })
.argv

debug('argv %O', argv)


const libName = 'feathers-oas'
const searchPlaces = argv.config ? [argv.config] : [
  'package.json',
  '.feathers-oas.json'
]

const explorer = cosmiconfigSync(libName,{searchPlaces});
const fullConfig = explorer.search() || {}
let { config } = fullConfig


if(argv._[0] === 'generate'){

    let dirs = config?.entities || await getDirectories('./src/services') || []
    for (const entity of dirs){
        console.log(entity)
        let gen = new Generator(entity, fullConfig)
        await gen.init()
        await gen.generate()
    }

}

if(argv._[0] == 'merge'){
    swaggerMerger({
        input: './specifications/openapi/spec.yml',
        output: './specifications/openapi/_merged.yml',
        compact: false
    }).catch(e => {
        console.error(e)
    })
}

if(argv._[0] == 'swagger'){


}

if(argv._[0] == 'init'){
    npmAddScript({key: "spec:build" , value: "npm run spec:generate; npm run spec:merge; npm run spec:validate; npm run spec:swagger"})
    npmAddScript({key: "spec:merge" , value: "npx foas merge"})
    npmAddScript({key: "spec:generate" , value: "npx foas generate"})
    npmAddScript({key: "spec:validate" , value: "npx swagger-cli validate ./specifications/openapi/_merged.yml"})
    npmAddScript({key: "spec:mock" , value: "npx @stoplight/prism-cli mock ./specifications/openapi/_merged.yml"})
    npmAddScript({key: "spec:swagger'" , value: "node ./node_modules/swagger-to-static/index.js ./specifications/openapi/_merged.yml ./specifications/build"})
}

// "spec:swagger": "node ./node_modules/swagger-to-static/index.js ./specifications/openapi/_merged.yml ./specifications/build",
