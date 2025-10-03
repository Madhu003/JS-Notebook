// Core-js internal mocks to fix build issues
// These are no-op implementations for missing core-js internals

export function defineGlobalThisProperty() {
  // No-op
}

export function globalThisThis() {
  // No-op
}

export default {
  defineGlobalThisProperty,
  globalThisThis
};
