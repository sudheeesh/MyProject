import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/adminSlice";
import Toast from "react-native-toast-message";

export default function CustomDrawer({ navigation }) {
  const dispatch = useDispatch();
  const { email } = useSelector((state) => state.admin);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            dispatch(logout());
            Toast.show({
              type: "info",
              text1: "Logged out successfully",
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  // 🧠 New: triggers HomeScreen to start a fresh chat session
  const handleNewChat = () => {
    navigation.navigate("Home", { resetChat: true });
    navigation.closeDrawer();
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.header}>⚡ CASP</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* NEW CHAT */}
        <TouchableOpacity style={styles.row} onPress={handleNewChat}>
          <Feather name="edit-3" size={18} color="#fff" />
          <Text style={styles.text}>New Chat</Text>
        </TouchableOpacity>

        {/* SEARCH CHAT */}
        <TouchableOpacity style={[styles.row, styles.marginBottom]}>
          <Feather name="search" size={18} color="#fff" />
          <Text style={styles.text}>Search Chat</Text>
        </TouchableOpacity>

        {/* INTEGRATIONS */}
        <Text style={styles.sectionTitle}>Integrations</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate("Integrations")}
        >
          <Feather name="plus-circle" size={18} color="#fff" />
          <Text style={styles.text}>Add Integrations</Text>
        </TouchableOpacity>

        {/* CHATS */}
        <Text style={styles.sectionTitle}>Chats</Text>
        <TouchableOpacity style={styles.row}>
          <Feather name="message-square" size={18} color="#fff" />
          <Text style={styles.text}>All Chats</Text>
        </TouchableOpacity>

        {/* LOGOUT */}
        <TouchableOpacity
          style={[styles.row, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={18} color="#ef4444" />
          <Text style={[styles.text, { color: "#ef4444" }]}>Logout</Text>
        </TouchableOpacity>

        {/* USER FOOTER */}
        {email && (
          <View style={styles.footer}>
            <Feather name="user" size={16} color="#9ca3af" />
            <Text style={styles.footerText}>{email}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 24,
  },
  header: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  marginBottom: {
    marginBottom: 24,
  },
  text: {
    color: "white",
    fontSize: 16,
    marginLeft: 12,
  },
  sectionTitle: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 8,
    marginTop: 12,
  },
  logoutButton: {
    marginTop: 32,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#222",
    marginTop: 24,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    color: "#9ca3af",
    fontSize: 13,
    marginLeft: 8,
  },
});
