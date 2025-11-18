import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef, navigate } from "./NavigationService";
import { useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import messaging from "@react-native-firebase/messaging";  // NEW

// Screens
import LoginScreen from "../screens/LoginScreen";
import DrawerNavigator from "./DrawerNavigator";
import VoiceCallScreen from "../screens/VoiceCallScreen";
import AddUserScreen from "../screens/AddUserScreen";
import TalkWithAI from "../screens/TalkWithAI";
import IncomingCallScreen from "../screens/IncomingCallScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {

  useEffect(() => {
    // Ask permission (Android 13+)
    messaging().requestPermission();

    // Register device
    messaging().registerDeviceForRemoteMessages();

    // Get FCM token (use this for backend)
    messaging()
      .getToken()
      .then((token) => {
        console.log("🔥 FCM Token:", token);
      });

    // Foreground message handler
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      const data = remoteMessage.data;

      if (data?.caller) {
        navigate("IncomingCallScreen", {
          callId: data.callId,
          caller: data.caller,
          ws_url: data.ws_url,
        });
      }
    });

    return unsubscribe;
  }, []);

  const { isAuthenticated } = useSelector((state) => state.admin);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={DrawerNavigator} />
            <Stack.Screen
              name="AddUser"
              component={AddUserScreen}
              options={{
                headerShown: true,
                title: "Add User",
                headerStyle: { backgroundColor: "#000" },
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen name="TalkWithAI" component={TalkWithAI} />
            <Stack.Screen name="VoiceCallScreen" component={VoiceCallScreen} />
            <Stack.Screen name="IncomingCallScreen" component={IncomingCallScreen} />
          </>
        )}
      </Stack.Navigator>

      <Toast />
    </NavigationContainer>
  );
}
