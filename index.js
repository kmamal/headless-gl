import { createContext as createContextNode } from './src/javascript/node-index.js';
import { createContext as createContextBrowser } from './src/javascript/browser-index.js';
export { WebGLRenderingContext } from './src/javascript/webgl-rendering-context.js';

export let createContext

if (typeof WebGLRenderingContext !== 'undefined') {
  createContext = createContextBrowser;
} else {
  createContext = createContextNode;
}
