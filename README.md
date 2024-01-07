# feathers-oas
                    
[![NPM](https://img.shields.io/npm/l/feathers-oas)](https://github.com/jamesvillarrubia/feathers-oas/blob/main/LICENSE) 

[![npm](https://img.shields.io/npm/v/feathers-oas?label=latest)](https://www.npmjs.com/package/feathers-oas)

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/jamesvillarrubia/feathers-oas/npm-publish.yml?branch=main)

[![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/NPM/feathers-oas)]()

<!-- [![Download Status](https://img.shields.io/npm/dm/feathers-oas.svg)](https://www.npmjs.com/package/feathers-oas) -->




This library is a cli to repeatedly generate OpenAPI Specifications from [Feathers Services](https://feathersjs.com/guides/basics/services.html) and [custom methods](https://feathersjs.com/api/services.html#custom-methods). 

## Setting Up

This tool assumes that you are using feathers_v5 and that your services live in the standard `src/services` folder, like the feathers cli generator produces.  Modifications can be made via a configuration object in `package.json` or a `.feathers-oas.json` file in the root of your project.

In the `example` folder, you find multiple feathers projects with the code already in place.

## Generating

Once your feathers app and core services are installed, you can run

```bash
npx foas generate
```

You will see that the script outputs the names of each of your services.  If you inspect your `src/services` folder, you'll find that `{name}.spec.yml` files have been generated for each service in their respective folders.

You will also see a new folder called `specifications` at root.  This is where the final merged OpenAPI specifications will live.

If you open one of the `{name}.spec.yml` files, you'll see that some basic feathers defaults have been setup for you, based on the methods 


## Adding Standard Scripts

```bash
npx foas init
```
This command will add serveral npm scripts to your package.json file.
- "spec:build": "npm run spec:generate; npm run spec:merge; npm run spec:validate; npm run spec:swagger",
- "spec:merge": "npx foas merge",
- "spec:generate": "npx foas generate",
- "spec:validate": "npx swagger-cli validate ./specifications/openapi/_merged.yml",
- "spec:mock": "npx @stoplight/prism-cli mock ./specifications/openapi/_merged.yml",
- "spec:swagger'": "node ./node_modules/swagger-to-static/index.js ./specifications/openapi/_merged.yml ./specifications/build"



## Merging into one Spec

```bash
npx foas merge
```
This command will merge all of your spec files into one _merged.yml file at `./specifications/_merged.yml`.

## Adding a SwaggerUI to your site

Once the specifications have been merged, you can build a swagger UI for the _merged.yml file.  First, run `npm run spec:swagger` which will build a self-contained `index.html` and `spec.json` inside the `/specifications` folder.  To expose this at root, replace the following line in `app.js`.

```javascript
// OLD LINE
// app.use(serveStatic(app.get('public'))) 

// NEW LINE
app.use(serveStatic('specifications/build'))
```

Now when you visit the root `/` it will serve the index.html file.


## Adding Better examples

The spec that you will build make some basic assumptions around the format of FeathersJS APIs.  But the standard information pulled out of your code is not enough to provide good examples.  To add examples, you should add an `examples` object to the service options like so 

```javascript
  app.use(toolPath, new MyService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: toolMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    examples:{    
      tools_post_default: { text:"this is my example" },
      tools_post_array: [{ text:"this is my example" },{ text:"this is the other example" },],
      tools_id_patch_default: { text:"yo I'm patched" },
      tools_id_put_default: { text:"yo I'm overwritten" },
      tools_id_delete_default: {  }
    }
  })
```

## Serving a mock version





## Contributing
Please see https://github.com/jamesvillarrubia/feathers-oas/blob/main/.github/contributing.md



## Config Options

- mergedPath: location of the final merged api specification yml file 
- 