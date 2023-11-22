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

## Installation

Once your feathers app and core services are installed, you can run

```bash
npx foas generate
```

You will see that the script outputs the names of each of your services.  If you inspect your `src/services` folder, you'll find that `{name}.spec.yml` files have been generated for each service in their respective folders.

You will also see a new folder called `specifications` at root.  This is where the final merged OpenAPI specifications will live.

If you open one of the `{name}.spec.yml` files, you'll see that some basic feathers defaults have been setup for you, based on the methods 


```bash
npm install --save feathers-oas
```


## Contributing
Please see https://github.com/jamesvillarrubia/feathers-oas/blob/main/.github/contributing.md

