// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import { Type, getValidator, querySyntax } from '@feathersjs/typebox';
import { dataValidator, queryValidator } from '../../validators.js';

// Main data model schema
export const ducksSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'Ducks', additionalProperties: false }
);
export const ducksValidator = getValidator(ducksSchema, dataValidator);
export const ducksResolver = resolve({});

export const ducksExternalResolver = resolve({});

// Schema for creating new entries
export const ducksDataSchema = Type.Pick(ducksSchema, ['text'], {
  $id: 'DucksData'
});
export const ducksDataValidator = getValidator(ducksDataSchema, dataValidator);
export const ducksDataResolver = resolve({});

// Schema for updating existing entries
export const ducksPatchSchema = Type.Partial(ducksSchema, {
  $id: 'DucksPatch'
});
export const ducksPatchValidator = getValidator(ducksPatchSchema, dataValidator);
export const ducksPatchResolver = resolve({});

// Schema for allowed query properties
export const ducksQueryProperties = Type.Pick(ducksSchema, ['id', 'text']);
export const ducksQuerySchema = Type.Intersect(
  [
    querySyntax(ducksQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
);
export const ducksQueryValidator = getValidator(ducksQuerySchema, queryValidator);
export const ducksQueryResolver = resolve({});
