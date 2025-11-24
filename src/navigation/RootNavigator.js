import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "./NavigationService";
import { useSelector } from "react-redux";
import Toast from "react-native-toast-message";

// Screens
import LoginScreen from "../screens/LoginScreen";
import DrawerNavigator from "./DrawerNavigator";
import VoiceCallScreen from "../screens/VoiceCallScreen";
import AddUserScreen from "../screens/AddUserScreen";
import TalkWithAI from "../screens/TalkWithAI";
import IncomingCallScreen from "../screens/IncomingCallScreen";
import ChatScreen from "../screens/ChatScreen"
import SubscriptionPlansScreen from "../account/SubscriptionPlansScreen"
import AccountScreen from "../account/AccountScreen"
import AssistantDetailsScreen from "../screens/AssistantDetailsScreen"

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
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
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="Account" component={AccountScreen} />
            <Stack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />
            <Stack.Screen name="AssistantDetails" component={AssistantDetailsScreen} />


          </>
        )}
      </Stack.Navigator>

      <Toast />
    </NavigationContainer>
  );
}

