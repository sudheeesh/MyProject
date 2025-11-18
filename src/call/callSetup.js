import { PermissionsAndroid, Platform } from "react-native";

export async function setupCallPermissions() {
  try {
    if (Platform.OS === "android") {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );

      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
    }

    console.log("✅ Call permissions granted");
  } catch (err) {
    console.error("🚨 Permission setup failed:", err);
  }
}
