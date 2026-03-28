const {
  withAndroidManifest,
  withAppBuildGradle,
  withProjectBuildGradle,
  withGradleProperties,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

function withSmsBroadcastReceiver(config) {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults;

    if (!manifest.manifest["uses-permission"]) {
      manifest.manifest["uses-permission"] = [];
    }

    const smsPermissions = [
      "android.permission.READ_SMS",
      "android.permission.RECEIVE_SMS",
    ];

    for (const perm of smsPermissions) {
      const exists = manifest.manifest["uses-permission"].some(
        (p) => p.$?.["android:name"] === perm
      );
      if (!exists) {
        manifest.manifest["uses-permission"].push({ $: { "android:name": perm } });
      }
    }

    const app = manifest.manifest.application[0];

    if (!app.receiver) {
      app.receiver = [];
    }

    const alreadyAdded = app.receiver.some(
      (r) => r.$?.["android:name"] === ".SmsBroadcastReceiver"
    );

    if (!alreadyAdded) {
      app.receiver.push({
        $: {
          "android:name": ".SmsBroadcastReceiver",
          "android:exported": "true",
          "android:permission": "android.permission.BROADCAST_SMS",
        },
        "intent-filter": [
          {
            $: { "android:priority": "999" },
            action: [{ $: { "android:name": "android.provider.Telephony.SMS_RECEIVED" } }],
          },
        ],
      });
    }

    return mod;
  });
}

// Inject Expo module ProGuard keep rules into proguard-rules.pro
function withExpoProguardRules(config) {
  return withAppBuildGradle(config, (mod) => {
    const proguardPath = path.join(
      mod.modRequest.platformProjectRoot,
      "app",
      "proguard-rules.pro"
    );

    const rules = [
      "# Expo modules",
      "-keep class expo.modules.** { *; }",
      "-keep class expo.modules.kotlin.** { *; }",
      "-dontwarn expo.modules.kotlin.RuntimeContext",
    ].join("\n");

    if (fs.existsSync(proguardPath)) {
      const existing = fs.readFileSync(proguardPath, "utf8");
      if (!existing.includes("-keep class expo.modules.kotlin.**")) {
        fs.writeFileSync(proguardPath, existing + "\n" + rules + "\n");
      }
    }

    return mod;
  });
}

// Inject release signing config via gradle.properties
function withReleaseSigning(config) {
  return withGradleProperties(config, (mod) => {
    const props = mod.modResults;
    const set = (key, val) => {
      const existing = props.find((p) => p.type === "property" && p.key === key);
      if (existing) existing.value = val;
      else props.push({ type: "property", key, value: val });
    };
    set("MYAPP_UPLOAD_STORE_FILE", "../../wealth-reserve.keystore");
    set("MYAPP_UPLOAD_KEY_ALIAS", "wealth-reserve");
    set("MYAPP_UPLOAD_STORE_PASSWORD", "wealthreserve123");
    set("MYAPP_UPLOAD_KEY_PASSWORD", "wealthreserve123");
    return mod;
  });
}

// Wire the release signing config into app/build.gradle
function withReleaseSigningConfig(config) {
  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;
    if (contents.includes("MYAPP_UPLOAD_KEY_ALIAS")) return mod;

    // 1. Add release signing block after the closing brace of the debug signing block
    contents = contents.replace(
      /(storeFile file\('debug\.keystore'\)[\s\S]*?keyPassword 'android'\s*\})/,
      `$1
        release {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }`
    );

    // 2. In the buildTypes release block, replace signingConfig signingConfigs.debug
    //    Find "buildTypes {" then find the "release {" inside it, then replace its signingConfig
    const buildTypesIdx = contents.indexOf("buildTypes {");
    const releaseBuildTypeIdx = contents.indexOf("release {", buildTypesIdx);
    const before = contents.slice(0, releaseBuildTypeIdx);
    const after = contents.slice(releaseBuildTypeIdx).replace(
      "signingConfig signingConfigs.debug",
      "signingConfig signingConfigs.release"
    );
    contents = before + after;

    mod.modResults.contents = contents;
    return mod;
  });
}

// Replace jcenter() with mavenCentral() in project-level build.gradle
function withFixJcenter(config) {
  return withProjectBuildGradle(config, (mod) => {
    mod.modResults.contents = mod.modResults.contents.replace(
      /jcenter\(\)/g,
      "mavenCentral()"
    );
    return mod;
  });
}

module.exports = function withWealthReservePlugins(config) {
  config = withSmsBroadcastReceiver(config);
  config = withExpoProguardRules(config);
  config = withFixJcenter(config);
  config = withReleaseSigning(config);
  config = withReleaseSigningConfig(config);
  return config;
};
