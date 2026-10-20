const { ModuleFederationPlugin } = require("webpack").container;

const DEV_BASE = "https://dev1980.starsellersworld.com/ssw/_mfe";

// Funzione helper per remotes dinamici con controllo duplicati e fallback
const createRemote = (globalVar, url) => {
  return `promise new Promise((resolve) => {

    // Se il container è già presente → usa quello
    if (window['${globalVar}'] && window['${globalVar}'].__initialized) {
      resolve(window['${globalVar}']);
      return;
    }

    // Se lo script è già presente in pagina → aspetta che venga caricato
    const existingScript = [...document.querySelectorAll("script")]
      .find(s => s.src === '${url}');
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        resolve(window['${globalVar}']);
      });
      return;
    }

    // Carica lo script remoto
    const script = document.createElement('script');
    script.src = '${url}';
    script.onload = () => {
      if (!window['${globalVar}']) {
        // fallback container vuoto
        window['${globalVar}'] = {
          get: () => Promise.resolve(() => ({})),
          init: () => {},
        };
      }
      window['${globalVar}'].__initialized = true;
      resolve(window['${globalVar}']);
    };
    script.onerror = () => {
      console.error('Errore caricamento remote ${globalVar} da ${url}');
      window['${globalVar}'] = {
        get: () => Promise.resolve(() => ({})),
        init: () => {},
      };
      window['${globalVar}'].__initialized = true;
      resolve(window['${globalVar}']);
    };
    document.head.appendChild(script);

  })`;
};

module.exports = new ModuleFederationPlugin({
  name: "host",
  filename: "item_manager_ligth_mfe.js",

  remotes: {
    ssw_reducers: createRemote(
      "ssw_reducers",
      `${DEV_BASE}/reducers/ssw_reducers_mfe.js`
    ),
    ssw_navigation: createRemote(
      "ssw_navigation",
      `${DEV_BASE}/ssw_navigation/ssw_navigation_mfe.js`
    ),
    price_simulator: createRemote(
      "price_simulator",
      `${DEV_BASE}/price-simulator/price_simulator_mfe.js`
    ),
    ssw_table: createRemote(
      "ssw_table",
      `${DEV_BASE}/ssw-table/ssw_table_mfe.js`
    ),
    ssw_notify: createRemote(
      "ssw_notify",
      `${DEV_BASE}/ssw-notify/ssw-notify_mfe.js`
    )
  },

  exposes: {
    "./App": "./src/App.tsx"
  },

  shared: {
    react: { singleton: true, requiredVersion: "^18.3.1", eager: false },
    "react-dom": { singleton: true, requiredVersion: "^18.3.1", eager: false },
    "react-redux": { singleton: true, requiredVersion: false, eager: false },
    redux: { singleton: true, requiredVersion: false, eager: false },
    "redux-observable": {
      singleton: true,
      requiredVersion: false,
      eager: false
    },
    rxjs: { singleton: true, requiredVersion: false, eager: false }
  }
});
