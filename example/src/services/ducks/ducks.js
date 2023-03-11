// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  ducksDataValidator,
  ducksPatchValidator,
  ducksQueryValidator,
  ducksResolver,
  ducksExternalResolver,
  ducksDataResolver,
  ducksPatchResolver,
  ducksQueryResolver
} from './ducks.schema.js'
import { DucksService, getOptions } from './ducks.class.js'

export const ducksPath = 'ducks'
export const ducksMethods = ['find', 'get', 'create', 'patch', 'remove']

export * from './ducks.class.js'
export * from './ducks.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const ducks = (app) => {
  // Register our service on the Feathers application
  app.use(ducksPath, new DucksService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: ducksMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(ducksPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(ducksExternalResolver), schemaHooks.resolveResult(ducksResolver)]
    },
    before: {
      all: [schemaHooks.validateQuery(ducksQueryValidator), schemaHooks.resolveQuery(ducksQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(ducksDataValidator), schemaHooks.resolveData(ducksDataResolver)],
      patch: [schemaHooks.validateData(ducksPatchValidator), schemaHooks.resolveData(ducksPatchResolver)],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
