import { builtinEnvironments, type Environment } from 'vitest/environments';

/** Keep fetch Request and AbortSignal in the same realm for React Router navigation. */
const environment: Environment = {
  name: 'jsdom-native-fetch',
  transformMode: 'web',
  async setup(global, options) {
    const native = { AbortController: global.AbortController, AbortSignal: global.AbortSignal };
    const result = await builtinEnvironments.jsdom.setup(global, options);
    Object.assign(global, native);
    return result;
  },
};
export default environment;
