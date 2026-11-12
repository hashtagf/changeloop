// Small value predicates shared across runtime domains.

export const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

export const unique = (values) => [...new Set(values)];
