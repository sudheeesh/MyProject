import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import http from "../services/http";
import { logout } from "../store/slices/adminSlice";

const suggestions = [
  "Get me the status for today",
  "Send an email to Johny saying I am busy",
  "Write a report to Gaurav Vasista",
];

export default function HomeScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { token, resource } = useSelector((state) => state.admin);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  // 🔁 Clear chat when coming from Drawer “New Chat”
  useEffect(() => {
    if (route.params?.resetChat) {
      setQuery("");
      setResponse("");
      Toast.show({ type: "info", text1: "Started a new chat session" });
      navigation.setParams({ resetChat: false });
    }
  }, [route.params]);

  // 🚀 Send user query to backend
  const handleSend = async (text) => {
    const prompt = text || query.trim();
    if (!prompt) return;

    setLoading(true);
    setResponse("");

    try {
      if (!token) {
        Toast.show({ type: "error", text1: "Session expired, please log in again" });
        setResponse("⚠️ Session expired. Please log in again.");
        dispatch(logout());
        return;
      }

      console.log("TOKEN CHECK:", token);
      console.log("RESOURCE CHECK:", resource);

      const { data } = await http.post(`/test/${resource}/qna_query`, { query: prompt });

      const aiResponse =
        data?.reply ||
        data?.answer ||
        data?.response ||
        data?.message ||
        "🤖 How can I help you today?";

      setResponse(aiResponse);
    } catch (err) {
      console.error("AI Query failed:", err);
      if (err.response?.status === 401) {
        dispatch(logout());
        Toast.show({ type: "error", text1: "Unauthorized", text2: "Please log in again" });
        setResponse("🚫 Unauthorized. Please log in again.");
      } else if (err.message?.includes("Network")) {
        setResponse("🌐 Network error. Please check your connection.");
      } else {
        const msg = err?.response?.data?.detail || "❌ Failed to get a response from AI.";
        setResponse(msg);
      }
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  // Auto scroll to bottom on new messages
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [response, loading]);

  return (
    <View style={styles.container}>
      {/* HEADER BAR */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Feather name="menu" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <View style={styles.smallBadge}>
            <Ionicons name="logo-react" color="#3b82f6" size={14} />
            <Text style={styles.badgeText}>01</Text>
          </View>
          <TouchableOpacity>
            <Feather name="download" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.trainButton}>
            <Text style={styles.trainText}>Train</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TITLE */}
      <Text style={styles.title}>How can I help you?</Text>

      {/* CHAT INPUT BOX */}
      <View style={styles.inputBox}>
        <TouchableOpacity>
          <Feather name="grid" size={18} color="#999" />
        </TouchableOpacity>

        <TextInput
          placeholder="Type your query....."
          placeholderTextColor="#666"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          onSubmitEditing={() => handleSend()}
        />

        <TouchableOpacity>
          <MaterialIcons name="text-fields" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleSend()} style={{ marginLeft: 10 }}>
          <Ionicons name="mic-outline" size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* RESPONSE AREA */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, marginTop: 20 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <ActivityIndicator color="#3b82f6" size="large" style={{ marginTop: 20 }} />
        )}
        {response ? (
          <View style={styles.responseBox}>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* TALK WITH AI SECTION */}
      <TouchableOpacity
        onPress={() => navigation.navigate("TalkWithAI")}
        style={styles.aiButtonContainer}
      >
        <Ionicons name="chatbubbles-outline" size={18} color="#fff" />
        <Text style={styles.aiButtonText}>Talk With AI</Text>
        <MaterialIcons name="keyboard-arrow-right" size={18} color="#fff" />
      </TouchableOpacity>

      {/* SUGGESTIONS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionScroll}
      >
        {suggestions.map((text, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleSend(text)}
            style={styles.suggestionItem}
          >
            {idx === 0 && <Icon name="calendar-check-o" size={16} color="#fff" />}
            {idx === 1 && <MaterialIcons name="email" size={16} color="#fff" />}
            {idx === 2 && <Ionicons name="paper-plane" size={16} color="#fff" />}
            <Text style={styles.suggestionText}>{text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FLOATING CASPAI BUTTON */}
      <TouchableOpacity style={styles.floatingButton}>
        <Text style={styles.floatingText}>CaspAI</Text>
        <Ionicons name="briefcase" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingHorizontal: 24, paddingTop: 56 },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 48,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  smallBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: "#fff", fontSize: 12, marginLeft: 4 },
  trainButton: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  trainText: { color: "#fff", fontSize: 12 },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 24,
  },
  inputBox: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: { flex: 1, color: "#fff", fontSize: 16, paddingHorizontal: 10 },
  responseBox: {
    marginTop: 12,
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  responseText: { color: "#fff", fontSize: 15, lineHeight: 20 },
  aiButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
  },
  aiButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 6,
  },
  suggestionScroll: { marginTop: 16, paddingBottom: 10 },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
  },
  suggestionText: { color: "#fff", fontSize: 14, marginLeft: 8 },
  floatingButton: {
    position: "absolute",
    bottom: 40,
    right: 24,
    backgroundColor: "#2563eb",
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  floatingText: { color: "#fff", fontWeight: "600", marginRight: 8 },
});