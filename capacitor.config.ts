import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.linhtinhapp.tools',
  appName: 'Kho Tools Tiện Ích',
  webDir: 'dist/linhtinhapp/browser',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#6366f1",
      showSpinner: true,
      spinnerColor: "#ffffff"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: "#6366f1"
    },
    Keyboard: {
      resize: 'body'
    }
  }
};

export default config;
