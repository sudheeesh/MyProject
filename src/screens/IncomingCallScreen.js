// src/screens/IncomingCall.jsx
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, BackHandler, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { sendSignal } from "../call/VoIPSignal";

export default function IncomingCallScreen({ route, navigation }) {
  const { caller, callId } = route.params || {};
  const [connecting, setConnecting] = useState(false);
  const timeoutRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // Prevent hardware back while incoming UI is showing
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);

    return () => {
      isMounted.current = false;
      clearTimeout(timeoutRef.current);
      backHandler.remove();
    };
  }, []);

  async function handleAccept() {
    if (connecting) return; // prevent double taps
    setConnecting(true);
    console.log("✅ Accepting call from:", caller);

    // Send accept to signalling server. include callId if server expects it.
    sendSignal({ type: "accept_call", from: caller, callId });

    // Wait for server to reply with 'call_ready' or 'call_accepted' (VoIPSignal.js handles navigation on those).
    // If the server doesn't reply within 20s, assume failure and go back.
    timeoutRef.current = setTimeout(() => {
      if (!isMounted.current) return;
      console.warn("⏱️ Accept timed out — no response from server");
      setConnecting(false);
      // Optionally tell server we gave up
      try { sendSignal({ type: "reject_call", from: caller, callId, reason: "accept-timeout" }); } catch(e) {}
      Alert.alert("No response", "Caller did not respond. Try again later.");
      navigation.goBack();
    }, 20000);

    // Optional optimistic navigation (uncomment if you want the UI to go straight to call UI while server prepares)
    // navigation.replace("VoiceCallScreen", { ws_url: null, peer: caller });
  }

  function handleReject() {
    if (connecting) return; // don't reject while connecting
    console.log("❌ Rejected call from:", caller);
    sendSignal({ type: "reject_call", from: caller, callId });
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Ionicons name="call" size={72} color="#4ade80" />
      <Text style={styles.callerText}>{caller || "Unknown Caller"}</Text>
      <Text style={styles.subtitle}>Incoming Voice Call...</Text>

      {connecting ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={handleReject}
            style={[styles.btn, styles.reject]}
            accessibilityLabel="Reject call"
            accessibilityHint="Reject incoming call"
          >
            <Ionicons name="close" size={42} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAccept}
            style={[styles.btn, styles.accept]}
            accessibilityLabel="Accept call"
            accessibilityHint="Accept incoming call"
          >
            <Ionicons name="call" size={42} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  callerText: {
    color: "#fff",
    fontSize: 24,
    marginTop: 16,
    fontWeight: "600",
  },
  subtitle: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 40,
    gap: 60,
  },
  btn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  accept: { backgroundColor: "#22c55e" },
  reject: { backgroundColor: "#ef4444" },
});