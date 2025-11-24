import React, { useEffect } from "react";
import { PermissionsAndroid, Platform, Alert } from "react-native";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./src/store";
import RootNavigator from "./src/navigation/RootNavigator";
import Toast from "react-native-toast-message";
import { setupVoipSignal } from "./src/call/VoIPSignal";

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

function AppContent() {
  const user = useSelector((state) => state.admin);

  useEffect(() => {
    const initialize = async () => {
      try {
        // =====================================
        // 🔐 REQUEST ANDROID PERMISSIONS
        // =====================================
        if (Platform.OS === "android") {
          const permissions = [
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ];

          const granted = await PermissionsAndroid.requestMultiple(
            permissions
          );

          if (
            granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !==
            PermissionsAndroid.RESULTS.GRANTED
          ) {
            Alert.alert(
              "Microphone Required",
              "Allow microphone access to make and receive calls."
            );
          }
        }

        // =====================================
        // 🌐 SETUP VOIP SIGNALING DIRECTLY
        // (CallKeep removed)
        // =====================================
        const userId = user?.email || "guest-" + Date.now();
        console.log("🔗 Connecting VoIP signaling as:", userId);
        setupVoipSignal(userId);

      } catch (err) {
        console.warn("⚠️ Initialization failed:", err);
      }
    };

    const timer = setTimeout(initialize, 800);
    return () => clearTimeout(timer);
  }, [user]);

  return (
    <>
      <RootNavigator />
      <Toast />
    </>
  );
}
