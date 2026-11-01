import type { CapacitorConfig } from '@capacitor/cli';

// IMPORTANT: the appId is the app's permanent name on Google Play. Choose it ONCE, before the first upload, and never change it afterwards.
// It must be lower-case, dot-separated, and unique worldwide (a reversed domain you control is the usual choice).
const config: CapacitorConfig = {
  appId: 'com.cardclubarcade.app',
  appName: 'Card Club Arcade',
  webDir: 'dist',
  backgroundColor: '#f4e4bf',
  server: { androidScheme: 'https' },   // the bundled app is served from https://localhost so service workers and WebRTC behave like the website
  android: { allowMixedContent: false },
};
export default config;
