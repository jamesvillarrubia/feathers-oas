// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema';
import { dataValidator, queryValidator } from '../../validators.js';

// Main data model schema
export const booksSchema = {
  $id: 'Books',
  type: 'object',
  additionalProperties: false,
  required: ['id', 'text'],
  properties: {
    id: { type: 'number' },
    firstName: { type: 'string' },
    lastName: { type: 'string' }
  }
};

export const schemaSupport = {
  examples: [
    {
      id: 12345678,
      firstName: 'Jane',
      lastName: 'Smith',
      createdAt: '2012-11-11T23:36:55.994Z',
      updatedAt: '2005-01-02T10:54:59.531Z'
    },
    {
      id: 3456788,
      firstName: 'Bob',
      lastName: 'Smith',
      createdAt: '2012-11-11T23:36:55.994Z',
      updatedAt: '2005-01-02T10:54:59.531Z'
    }
  ],
  patchedFields: {
    firstName: 'Janet'
  },
  freeze: false,
  merge: true
};

export const booksValidator = getValidator(booksSchema, dataValidator);
export const booksResolver = resolve({});

export const booksExternalResolver = resolve({});

// Schema for creating new data
export const booksDataSchema = {
  $id: 'BooksData',
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    ...booksSchema.properties
  }
};
export const booksDataValidator = getValidator(booksDataSchema, dataValidator);
export const booksDataResolver = resolve({});

// Schema for updating existing data
export const booksPatchSchema = {
  $id: 'BooksPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...booksSchema.properties
  }
};
export const booksPatchValidator = getValidator(booksPatchSchema, dataValidator);
export const booksPatchResolver = resolve({});

// Schema for allowed query properties
export const booksQuerySchema = {
  $id: 'BooksQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(booksSchema.properties)
  }
};
export const booksQueryValidator = getValidator(booksQuerySchema, queryValidator);
export const booksQueryResolver = resolve({});
