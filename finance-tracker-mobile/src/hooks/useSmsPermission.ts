import { useCallback, useEffect, useState } from "react";
import { Alert, PermissionsAndroid, Platform } from "react-native";

type PermissionStatus = "granted" | "denied" | "never_ask_again" | "pending";

export function useSmsPermission() {
  const [status, setStatus] = useState<PermissionStatus>("pending");

  const request = useCallback(async () => {
    if (Platform.OS !== "android") {
      setStatus("denied");
      return;
    }

    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: "SMS Permission",
          message:
            "Finance Tracker needs access to your SMS to automatically detect bank transactions.",
          buttonPositive: "Allow",
          buttonNegative: "Deny",
        }
      );

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        setStatus("granted");
      } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        setStatus("never_ask_again");
        Alert.alert(
          "Permission Required",
          "SMS permission was permanently denied. Please enable it in Settings → Apps → Finance Tracker → Permissions.",
          [{ text: "OK" }]
        );
      } else {
        setStatus("denied");
      }
    } catch {
      setStatus("denied");
    }
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  return { status, request };
}
