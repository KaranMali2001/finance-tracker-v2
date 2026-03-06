const { withAndroidManifest } = require("expo/config-plugins");

module.exports = function withSmsBroadcastReceiver(config) {
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
};
