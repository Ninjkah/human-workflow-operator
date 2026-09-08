# Build the Android APK (beginner method)

The easiest method is GitHub Actions. You do not need to install Android Studio, Rust, or Node.js on your computer for this route.

## 1. Create a GitHub account
Go to https://github.com/ and create/sign into an account.

## 2. Create a repository
Click the + button in the upper-right -> New repository.
Name it `human-workflow-operator`. For the simplest build, make it Public. Leave README, .gitignore, and license unchecked because this ZIP already contains them. Click Create repository.

## 3. Upload this project
Extract the ZIP on your computer. On the new GitHub repository page, click Add file -> Upload files. Drag the CONTENTS of the extracted folder into the page (including the `.github` folder). Click Commit changes.

Important: the `.github/workflows/android-apk.yml` file must be present in the repository.

## 4. Start the build
Open the repository's Actions tab. You should see `Android APK` in the left-hand workflow list. Click it. Click `Run workflow`, select `main`, then click `Run workflow` again.

## 5. Wait for the green check
Open the new workflow run. When it finishes successfully, scroll to the bottom to the `Artifacts` section. Download `human-workflow-apks`.

GitHub stores workflow artifacts so build files can be downloaded after the workflow completes.

## 6. Install the APK on Android
Unzip the downloaded artifact. You should find an `.apk` file. Send it to your Android phone (USB, Drive, email to yourself, etc.). Open it on the phone and allow installation from that source when Android asks.

## If the workflow fails
Open the failed workflow run and look for the step marked with a red X. Copy the error text and give it to the coding AI together with the repository URL.

## What this build contains
The app is the human-in-the-loop version. It does not automate the YouTube engagement click, collect Google passwords, rotate proxies/VPNs, or manipulate identity state to disguise coordinated activity.
