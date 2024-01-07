import openapiMerger from 'openapi-merger';
import { cosmiconfigSync } from 'cosmiconfig';
import { Generator } from './generator.js';

const libName = 'feathers-openapi';
const searchPlaces = [
  'package.json',
  '.feathers-openapi.json'
];
const explorer = cosmiconfigSync(libName, { searchPlaces });
const config = explorer.search();

const generators = config.entities.map(async name => {
  const gen = new Generator(name, config);
  await gen.generate();
});

await Promise.all(generators);

// swagger-merger -i ./specifications/openapi/spec.yml -o ./specifications/openapi/_merged.yml
openapiMerger({
  input: './specifications/openapi/spec.yml',
  output: './specifications/openapi/_merged.yml',
  compact: false
}).catch(e => {
  console.error(e);
});
