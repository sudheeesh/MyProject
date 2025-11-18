import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../screens/HomeScreen";
import IntegrationsScreen from "../components/IntegrationsScreen";
import TalkWithAI from "../screens/TalkWithAI";
import CustomDrawer from "../components/CustomDrawer";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: "#000", // black drawer background
          width: "75%", // takes 3/4 of screen
        },
        sceneContainerStyle: { backgroundColor: "#000" }, // keeps transitions dark
        lazy: true,
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      {/* Home Screen */}
      <Drawer.Screen name="Home" component={HomeScreen} />

      {/* Talk With AI */}
      <Drawer.Screen name="TalkWithAI" component={TalkWithAI} />

      {/* Integrations */}
      <Drawer.Screen name="Integrations" component={IntegrationsScreen} />
    </Drawer.Navigator>
  );
}
