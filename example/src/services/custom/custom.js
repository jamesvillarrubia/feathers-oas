import { CustomService, getOptions } from './custom.class.js';

export const customPath = 'custom';
export const customMethods = ['find', 'get', 'create', 'patch', 'remove'];

export * from './custom.class.js';

// A configure function that registers the service and its hooks via `app.configure`
export const custom = (app) => {
  // Register our service on the Feathers application
  app.use(customPath, new CustomService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: customMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  });
  // Initialize hooks
  app.service(customPath).hooks({
    around: {
      all: []
    },
    before: {
      all: [],
      find: [],
      get: [],
      create: [],
      patch: [],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  });
};
