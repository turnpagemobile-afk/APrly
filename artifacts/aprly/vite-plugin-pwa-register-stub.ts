import type { Plugin } from "vite";

const VIRTUAL_PWA_REGISTER = "virtual:pwa-register";

/**
 * Landing/admin bundles may transitively import cabinet PWA code (e.g. NotFound →
 * CabinetHeader). Stub virtual:pwa-register when vite-plugin-pwa is not enabled.
 */
export function pwaRegisterStubPlugin(): Plugin {
  return {
    name: "aprly-pwa-register-stub",
    resolveId(id) {
      if (id === VIRTUAL_PWA_REGISTER) {
        return "\0" + VIRTUAL_PWA_REGISTER;
      }
    },
    load(id) {
      if (id === "\0" + VIRTUAL_PWA_REGISTER) {
        return `export function registerSW() {
  return async function reload() {};
}`;
      }
    },
  };
}
