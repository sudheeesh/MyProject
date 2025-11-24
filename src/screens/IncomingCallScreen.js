// src/screens/IncomingCall.jsx
// src/screens/IncomingCallScreen.jsx
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, BackHandler, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { sendSignal } from "../call/VoIPSignal";

export default function IncomingCallScreen({ route, navigation }) {
  const { caller, callId } = route.params || {};
  const myUserId = useSelector((state) => state.admin.email || state.admin.username);

  const [connecting, setConnecting] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => backHandler.remove();
  }, []);

  const handleAccept = () => {
    if (connecting) return;
    setConnecting(true);

    sendSignal({
      type: "accept_call",
      from: myUserId,
      to: caller,
      callId
    });

    timeoutRef.current = setTimeout(() => {
      Alert.alert("No response", "Caller did not respond.");
      navigation.goBack();
    }, 15000);
  };

  const handleReject = () => {
    if (connecting) return;
    sendSignal({
      type: "reject_call",
      from: myUserId,
      to: caller,
      callId
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Ionicons name="call" size={72} color="#4ade80" />
      <Text style={styles.callerText}>{caller}</Text>
      <Text style={styles.subtitle}>Incoming Voice Call...</Text>

      {connecting ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.btn, styles.reject]} onPress={handleReject}>
            <Ionicons name="close" size={42} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.accept]} onPress={handleAccept}>
            <Ionicons name="call" size={42} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  callerText: { color: "#fff", fontSize: 24, marginTop: 16, fontWeight: "600" },
  subtitle: { color: "#aaa", fontSize: 16, marginTop: 4 },
  buttonRow: { flexDirection: "row", marginTop: 40, gap: 60 },
  btn: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  accept: { backgroundColor: "#22c55e" },
  reject: { backgroundColor: "#ef4444" }
});
