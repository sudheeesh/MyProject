import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Icon } from "react-native-vector-icons/MaterialIcons";


const { width } = Dimensions.get("window");
const CIRCLE_SIZE = width * 0.75;

export default function TalkWithAI({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>TALK WITH AI</Text>

      {/* Outer Circle */}
      <View
        style={[
          styles.circleContainer,
          { width: CIRCLE_SIZE, height: CIRCLE_SIZE },
        ]}
      >
        {/* Center CASP logo */}
        <View style={styles.centerCircle}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.centerLogo}
            resizeMode="contain"
          />
        </View>

        {/* CALL (Top) */}
        <TouchableOpacity
          style={[styles.iconContainer, styles.callPosition]}
          onPress={() => navigation.navigate("VoiceCallScreen")}
        >
          <MaterialIcons name="call" size={28} color="#22c55e" />
          <Text style={styles.iconText}>Call</Text>
        </TouchableOpacity>

        {/* MESSAGE (Left) */}
        <TouchableOpacity
          style={[styles.iconContainer, styles.messagePosition]}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="chatbox-ellipses" size={26} color="#3b82f6" />
          <Text style={styles.iconText}>Message</Text>
        </TouchableOpacity>

        {/* AI BOT (Right) */}
        <TouchableOpacity
          style={[styles.iconContainer, styles.aiPosition]}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="robot" size={26} color="#60a5fa" />
          <Text style={styles.iconText}>AI Bot</Text>
        </TouchableOpacity>

        {/* Gmail (Bottom Left) */}
        <TouchableOpacity
          style={[styles.smallIcon, styles.gmailPosition]}
          onPress={() => navigation.navigate("Integrations")}
        >
          <Icon name="google" size={22} color="#ea4335" />
        </TouchableOpacity>

        {/* Outlook (Bottom Center) */}
        <TouchableOpacity
          style={[styles.smallIcon, styles.outlookPosition]}
          onPress={() => navigation.navigate("Integrations")}
        >
          <MaterialIcons name="email" size={22} color="#1e90ff" />
        </TouchableOpacity>

        {/* Drive (Bottom Right) */}
        <TouchableOpacity
          style={[styles.smallIcon, styles.drivePosition]}
          onPress={() => navigation.navigate("Integrations")}
        >
          <Ionicons name="cloud-outline" size={22} color="#34a853" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 40,
    letterSpacing: 1.2,
  },
  circleContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f1f1f",
    borderRadius: 500,
    backgroundColor: "#111",
  },
  centerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#333",
  },
  centerLogo: {
    width: 50,
    height: 50,
  },
  iconContainer: {
    position: "absolute",
    alignItems: "center",
  },
  iconText: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 4,
  },
  smallIcon: {
    position: "absolute",
    backgroundColor: "#111",
    padding: 8,
    borderRadius: 50,
  },
  // Icon positions around the circle
  callPosition: {
    top: 10,
    alignItems: "center",
  },
  messagePosition: {
    left: 25,
    top: "42%",
  },
  aiPosition: {
    right: 25,
    top: "42%",
  },
  gmailPosition: {
    bottom: 35,
    left: width * 0.3 - 20,
  },
  outlookPosition: {
    bottom: 25,
    alignSelf: "center",
  },
  drivePosition: {
    bottom: 35,
    right: width * 0.3 - 20,
  },
});