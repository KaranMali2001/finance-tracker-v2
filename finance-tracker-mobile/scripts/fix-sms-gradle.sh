#!/bin/sh
# Fixes react-native-get-sms-android for AGP 8+ / Gradle 9+:
# 1. Removes jcenter() and outdated buildscript block from build.gradle
# 2. Removes deprecated package attribute from AndroidManifest.xml

PKG_DIR="node_modules/react-native-get-sms-android"

# Handle pnpm content-addressable layout
if [ -d "node_modules/.pnpm" ]; then
  PNPM_DIR=$(find node_modules/.pnpm -maxdepth 1 -type d -name "react-native-get-sms-android*" | head -1)
  if [ -n "$PNPM_DIR" ]; then
    PKG_DIR="$PNPM_DIR/node_modules/react-native-get-sms-android"
  fi
fi

GRADLE_FILE="$PKG_DIR/android/build.gradle"
MANIFEST_FILE="$PKG_DIR/android/src/main/AndroidManifest.xml"

cat > "$GRADLE_FILE" << 'EOF'
apply plugin: 'com.android.library'

def safeExtGet(prop, fallback) {
    rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}

android {
    compileSdkVersion safeExtGet('compileSdkVersion', 34)

    defaultConfig {
        minSdkVersion safeExtGet('minSdkVersion', 24)
        targetSdkVersion safeExtGet('targetSdkVersion', 34)
        versionCode 1
        versionName "1.0.0"
    }
    lintOptions {
        abortOnError false
    }
    namespace "com.react"
}

repositories {
    google()
    mavenCentral()
    maven {
        url "$rootDir/../node_modules/react-native/android"
    }
}

dependencies {
    compileOnly "com.facebook.react:react-native:${safeExtGet('reactNativeVersion', '+')}"
}
EOF

cat > "$MANIFEST_FILE" << 'EOF'
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
</manifest>
EOF
