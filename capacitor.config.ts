// import type { CapacitorConfig } from '@capacitor/cli';

// const config: CapacitorConfig = {
//   appId: 'io.ionic.starter',
//   appName: 'krabs-front',
//   webDir: 'www'
// };

// export default config;

import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "io.ionic.starter",
  appName: "krabs-front",
  webDir: "www",
  server: {
    androidScheme: "https",
    // Autoriser la navigation vers votre nouveau domaine
    allowNavigation: ["karabs-front.vercel.app", "karabs-backend1.up.railway.app", "localhost", "127.0.0.1"],
  },
  plugins: {
    Browser: {
      androidBrowserMode: "webview",
      enableJavaScript: true,
    },
    App: {
      appUrlOpen: {
        enabled: true,
      },
    },
  },
}

export default config


 