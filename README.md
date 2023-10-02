# choreQueue

Always know what your current chores are when you want to do chores. Made to remind you of tasks, and repeat them after X Days. Forget Calendar Approaches.

# Android Deployment

Deployment of APK Apps with Capacitor and Android Studio.
Prerequisites (Have to run only once):

- npm install @capacitor/core @capacitor/cli @capacitor/android
- npx cap init (generate config - adjust the dist path in the capacitor.config.ts to link to the current build)

This already happened in this project.
To build an Android APK, make sure to have Android Studio installed on your system. Then, run:

- npm run build
- npx cap add android (adds android project - if android folder exists already, delete it for a fresh build)
  - can also try "npx cap copy" instead to update if an android folder exists already
- optional: configure permissions and more for Android in android/app/src/main/AndroidManifest.xml
- npx cap open android
- build APK through standard Android Studio workflow (Build / build APK)
- install, via ADB for example: adb install app-debug.apk

# Android Live-Tests

run:

- npm run start:network
  This will execute: ng serve -o --host 0.0.0.0

Now you can access the App on your Smartphone-Browser under: DEVICEIP:4200
(Replace DEVICEIP with the IP of your host-system.)

Its also possible to use live reloading within the native app on your phone.
For this, read the comment in the .server attribute in capacitor.config.ts.
Then generate a live-reloading version of the app though another Android deployment as explained above. (You have to generate this live-reload App once - keep permission in mind though)
