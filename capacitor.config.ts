import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.choreQueue.app',
  appName: 'chore-queue',
  webDir: 'dist/chore-queue',
  server: {
    androidScheme: 'https',
    //for live-deployment, app accesses this
    //(run "npx cap copy" for change, then build again in android studio)
    // url: 'http://DEVICEIP:4200',
    // cleartext: true,
  },
};

export default config;
