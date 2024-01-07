#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Generator, getDirectories } from '../src/generator.js';
import openapiMerger from 'openapi-merger';
import { cosmiconfigSync } from 'cosmiconfig';
import Debug from 'debug';
import npmAddScript from 'npm-add-script';
import PostmanConverter from 'openapi-to-postmanv2';
import fs from 'fs';
// import swagToStatic from './static.js'

Debug.colors = [1, 3, 6, 2, 4, 5];
const debug = Debug('foas');

debug('booting %o', 'foas');

// **** Get cli arguments ****//
const argv = yargs(hideBin(process.argv)).option('config', {
  alias: 'c',
  type: 'string',
  description: 'set config file'
}).argv;

debug('argv %O', argv);

const libName = 'feathers-oas';
const searchPlaces = argv.config ? [argv.config] : ['package.json', '.feathers-oas.json'];

const explorer = cosmiconfigSync(libName, { searchPlaces });
const fullConfig = explorer.search() || {};
const { config } = fullConfig;

if (argv._[0] === 'generate') {
  const dirs = config?.entities || (await getDirectories('./src/services')) || [];
  for (const entity of dirs) {
    console.log(entity);
    const gen = new Generator(entity, fullConfig);
    await gen.init();
    await gen.generate();
  }
}

if (argv._[0] === 'merge') {
  openapiMerger({
    input: './specifications/openapi/spec.yml',
    output: config.mergePath || './specifications/openapi/_merged.yml',
    compact: false
  }).catch(e => {
    console.error(e);
  });
}

if (argv._[0] === 'postman') {
  await fs.promises.mkdir('./specifications/postman/', { recursive: true });
  const openapiData = fs.readFileSync('./specifications/openapi/_merged.yml', { encoding: 'UTF8' });
  PostmanConverter.convert({ type: 'string', data: openapiData, parametersResolution: 'Example' }, {}, (err, conversionResult) => {
    if (err) {
      console.error(err);
    }
    if (!conversionResult.result) {
      console.log('Could not convert', conversionResult.reason);
    } else {
      fs.writeFileSync('./specifications/postman/postman.json', JSON.stringify(conversionResult.output[0].data));
      console.log('Postman collection has been written to ./postman/postman.json');
    }
  });
}

// if (argv._[0] === 'swagger') {

// }

if (argv._[0] === 'init') {
  npmAddScript({ key: 'spec:build', value: 'npm run spec:generate; npm run spec:merge; npm run spec:validate; npm run spec:swagger' });
  npmAddScript({ key: 'spec:merge', value: 'npx foas merge' });
  npmAddScript({ key: 'spec:generate', value: 'npx foas generate' });
  npmAddScript({ key: 'spec:validate', value: 'npx @redocly/cli lint --extends=minimal ./specifications/openapi/_merged.yml' });
  npmAddScript({ key: 'spec:mock', value: 'npx @stoplight/prism-cli mock ./specifications/openapi/_merged.yml' });
  npmAddScript({
    key: 'spec:swagger',
    value: 'node ./node_modules/feathers-oas/node_modules/swagger-to-static/index.js ./specifications/openapi/_merged.yml ./specifications/build'
  });
}

// "spec:swagger": "node ./node_modules/swagger-to-static/index.js ./specifications/openapi/_merged.yml ./specifications/build",
