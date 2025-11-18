import { createNavigationContainerRef } from "@react-navigation/native";

// Create a global ref to hold our navigation instance
export const navigationRef = createNavigationContainerRef();

// A helper function you can call from anywhere (like VoIPSignal.js)
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.log("⚠️ Navigation not ready yet");
  }
}
