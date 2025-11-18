import { AppRegistry } from "react-native";
import App from "./App";
import messaging from "@react-native-firebase/messaging";
import IncomingCallHandler from "./src/call/IncomingCallHandler"; // we will convert this file
import "react-native-gesture-handler";

AppRegistry.registerComponent("CaspMobile", () => App);

// Background message handler (called when app is killed / background)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  const data = remoteMessage.data;

  console.log("📩 BG FCM:", data);

  if (data?.call === "incoming") {
    await IncomingCallHandler(data);
  }
});


