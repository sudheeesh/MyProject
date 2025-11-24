import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/adminSlice";
import Toast from "react-native-toast-message";
import { resetSearch } from "../store/slices/searchSlice";

export default function CustomDrawer({ navigation }) {
  const dispatch = useDispatch();
  const { email } = useSelector((state) => state.admin);

  // Assistant State
  const [assistants, setAssistants] = useState([
    { id: 1, name: "New Assistant" },
    { id: 2, name: "CallAssistant" },
    { id: 3, name: "VoiceAssistant" },
  ]);

  const [modalVisible, setModalVisible] = useState(false);

  const templates = [
    "Gmail",
    "Google Drive",
    "Outlook",
    "SharePoint",
    "Microsoft Teams",
    "Flipkart",
    "Library",
  ];

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

  const handleNewChat = () => {
    dispatch(resetSearch());
    navigation.navigate("Main", { screen: "Home" });
    navigation.closeDrawer();
  };

  const createAssistant = (name) => {
    const newA = { id: Date.now(), name: name + " Assistant" };
    setAssistants([...assistants, newA]);
    setModalVisible(false);

    navigation.navigate("AssistantDetails", { name: newA.name });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerBox}>
        <Text style={styles.headerLogo}>⚡</Text>
        <Text style={styles.headerText}>CASP</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* MAIN MENU */}
        <TouchableOpacity style={styles.item} onPress={handleNewChat}>
          <Feather name="edit-3" size={20} color="#fff" />
          <Text style={styles.itemText}>New Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <Feather name="search" size={20} color="#fff" />
          <Text style={styles.itemText}>Search Chat</Text>
        </TouchableOpacity>

        <Text style={styles.section}>Integrations</Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate("Integrations")}
        >
          <Feather name="plus-circle" size={20} color="#fff" />
          <Text style={styles.itemText}>Add Integrations</Text>
        </TouchableOpacity>


        {/* ASSISTANTS SECTION */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
          <Text style={styles.section}>Assistants</Text>

          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Feather name="plus-circle" size={20} color="#4ade80" />
          </TouchableOpacity>
        </View>

        {assistants.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={styles.item}
            onPress={() => navigation.navigate("AssistantDetails", { name: a.name })}
          >
            <Feather name="user" size={20} color="#fff" />
            <Text style={styles.itemText}>{a.name}</Text>
          </TouchableOpacity>
        ))}
        {/* CHATS */}
        <Text style={styles.section}>Chats</Text>

        <TouchableOpacity style={styles.item}>
          <Feather name="message-square" size={20} color="#fff" />
          <Text style={styles.itemText}>All Chats</Text>
        </TouchableOpacity>

        {/* LOGOUT */}
        <TouchableOpacity style={[styles.item, styles.logoutItem]} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#ef4444" />
          <Text style={[styles.itemText, { color: "#ef4444" }]}>Logout</Text>
        </TouchableOpacity>

        {/* FOOTER */}
        {email && (
          <View style={styles.footer}>
            <Feather name="user" size={16} color="#9ca3af" />
            <Text style={styles.footerText}>{email}</Text>
          </View>
        )}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create Assistant</Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {templates.map((t, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.modalItem}
                  onPress={() => createAssistant(t)}
                >
                  <Text style={styles.modalItemText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Text style={{ color: "#fff", textAlign: "center" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  // HEADER
  headerBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  headerLogo: {
    fontSize: 28,
    color: "#facc15",
    marginRight: 6,
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  // ITEM
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#111",
    borderRadius: 12,
    borderColor: "#222",
    borderWidth: 1,
    marginBottom: 14,
  },
  itemText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 12,
  },

  // SECTION
  section: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 8,
    marginBottom: 8,
  },

  // LOGOUT
  logoutItem: {
    marginTop: 26,
    borderColor: "#3b1c1c",
    backgroundColor: "#1a0000",
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: "#222",
    marginTop: 24,
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
  },
  footerText: {
    color: "#9ca3af",
    fontSize: 13,
    marginLeft: 8,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  modalItem: {
    padding: 14,
    backgroundColor: "#222",
    borderRadius: 10,
    marginBottom: 10,
  },
  modalItemText: {
    color: "#fff",
    fontSize: 16,
  },
  modalClose: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#333",
    borderRadius: 8,
  },
});
