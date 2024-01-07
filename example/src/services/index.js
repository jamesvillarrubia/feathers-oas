import { custom } from './custom/custom.js';

import { ducks } from './ducks/ducks.js';

import { books } from './books/books.js';

export const services = (app) => {
  app.configure(custom);

  app.configure(ducks);

  app.configure(books);

  // All services will be registered here
};
