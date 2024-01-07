/** ************ UTILITIES */
export const isObject = value => value !== null && typeof value === 'object';

// A "plain" object is an object who's a direct instance of Object
// (or, who has a null prototype).
export const isPlainObject = value => {
  if (!isObject(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
};

// NOTE: This mutates `object`.
// It also may mutate anything that gets attached to `object` during the merge.
export function merge (object, ...sources) {
  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) {
        continue;
      }

      // These checks are a week attempt at mimicking the various edge-case behaviors
      // that Lodash's `_.merge()` exhibits. Feel free to simplify and
      // remove checks that you don't need.
      if (!isPlainObject(value) && !Array.isArray(value)) {
        object[key] = value;
      } else if (Array.isArray(value) && !Array.isArray(object[key])) {
        object[key] = value;
      } else if (!isObject(object[key])) {
        object[key] = value;
      } else {
        merge(object[key], value);
      }
    }
  }

  return object;
}

export function snakeToCamel (str) {
  return str.toLowerCase().replace(/([-_][a-z])/g, group =>
    group
      .toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );
}
