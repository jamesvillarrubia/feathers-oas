// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  booksDataValidator,
  booksPatchValidator,
  booksQueryValidator,
  booksResolver,
  booksExternalResolver,
  booksDataResolver,
  booksPatchResolver,
  booksQueryResolver
} from './books.schema.js'
import { BooksService, getOptions } from './books.class.js'

export const booksPath = 'books'
export const booksMethods = ['find', 'get', 'create', 'patch', 'update', 'remove']

export * from './books.class.js'
export * from './books.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const books = (app) => {
  // Register our service on the Feathers application
  app.use(booksPath, new BooksService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: booksMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(booksPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(booksExternalResolver), schemaHooks.resolveResult(booksResolver)]
    },
    before: {
      all: [schemaHooks.validateQuery(booksQueryValidator), schemaHooks.resolveQuery(booksQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(booksDataValidator), schemaHooks.resolveData(booksDataResolver)],
      patch: [schemaHooks.validateData(booksPatchValidator), schemaHooks.resolveData(booksPatchResolver)],
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
