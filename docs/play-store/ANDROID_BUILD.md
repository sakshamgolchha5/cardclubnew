# Making the Android app (.aab) - three ways

The project already contains a ready Android app in `android/` (Capacitor 8, Android 16 / API 36 as Google Play now requires, landscape-only, full-screen, real icon and splash). The web build is bundled inside, so bot games work offline.

## Way 1 (recommended): Android Studio on your PC - free
1. Install **Android Studio** (free, developer.android.com/studio). First start: accept the defaults; it installs the Android SDK.
2. Install **Node.js 22 LTS** (nodejs.org) if it is not installed.
3. In a terminal in the project folder: `npm install`, then `npm run android:sync` (builds the web app and copies it into the Android project).
4. `npm run android:open` (or in Android Studio: File -> Open -> choose the `android` folder). Wait until the bottom bar says Gradle sync finished.
5. Test: plug in a phone with USB debugging (or use Device Manager -> create a phone emulator), press the green Run button.
6. Release: Build -> Generate Signed App Bundle / APK -> Android App Bundle -> Next -> Create new keystore (store the file and passwords safely: lose them and you cannot update the app) -> Release -> Create. The file is `android/app/release/app-release.aab`.

## Way 2: build in the cloud with GitHub Actions - free
Push the project to GitHub, then Actions -> "Android build" -> Run workflow. Download the artifact (`.apk` for testing, `.aab` for Play). Add the four ANDROID_* secrets (see the workflow file) to get a signed bundle. If the first run fails, send me the log - cloud Gradle builds usually need one round of fixes.

## Way 3: PWABuilder (no install at all)
pwabuilder.com -> enter the website address -> Package for stores -> Android -> fill the package id, name and version -> Generate. Download the zip (it contains the signed .aab, the signing key and an `assetlinks.json` snippet). Put the snippet in `public/.well-known/assetlinks.json`, redeploy the site, then upload the .aab. This route opens the live website inside Chrome, so it needs internet; Way 1 is more reliable.

## Before the FIRST upload
- Decide the permanent app id (package name). Default: `com.cardclubarcade.app`. To change it, edit `capacitor.config.ts` (appId) **and** `android/app/build.gradle` (namespace and applicationId) and move the folders under `android/app/src/main/java/`. You cannot change it after publishing.
- Each new release needs a higher `versionCode` in `android/app/build.gradle` (1, 2, 3 ...).
- Keep your keystore OUT of Git (the .gitignore already blocks it) and back it up in two places.
