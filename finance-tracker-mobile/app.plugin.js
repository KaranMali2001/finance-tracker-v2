const {
  withAndroidManifest,
  withAppBuildGradle,
  withProjectBuildGradle,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

function withSmsBroadcastReceiver(config) {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults;
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
  return config;
};
