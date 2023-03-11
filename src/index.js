import swaggerMerger from 'swagger-merger'
import { cosmiconfigSync } from 'cosmiconfig'
import { Generator } from './generator.js'

const libName = 'feathers-openapi'
const searchPlaces = [
  'package.json',
  '.feathers-openapi.json'
]
const explorer = cosmiconfigSync(libName,{searchPlaces});
const fullConfig = explorer.search()



let generators = config.entities.map(async name=>{
  let gen = new Generator(name, fullConfig)
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

