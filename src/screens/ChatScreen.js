// src/screens/ChatScreen.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import Markdown from "react-native-markdown-display";

import {
  getChatSession,
  streamChat,
  setAuthToken,
  setXResource,
} from "../services/api";

import ChatMessage from "../components/ChatMessage";

export default function ChatScreen({ route, navigation }) {
  const { sessionId, configId, initialSearchData } = route.params || {};

  const admin = useSelector((s) => s.admin);
  const token = admin?.token;
  const resource = admin?.resource;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");

  const scrollRef = useRef();

  useEffect(() => {
    if (token) setAuthToken(token);
    if (resource) setXResource(resource);
  }, [token, resource]);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
  if (!sessionId) {
    setLoading(false);
    return;
  }

  setLoading(true);

  try {
    // conf_names required exactly like web
    const confs =
      initialSearchData?.conf_names && initialSearchData.conf_names.length
        ? initialSearchData.conf_names
        : [resource];

   
console.log("🧪 FOLLOWUP URL:", `/test/${resource}/chatconfigs/stream/${sessionId}`);
console.log("🧪 LOAD SESSION URL:", `/test/${resource}/chatconfigs/session/${sessionId}`);

    const res = await getChatSession(resource, sessionId, confs);

    const data = Array.isArray(res.data) ? res.data : res.data?.messages || [];

    const formatted = data.map((m) => ({
      agent: m.agent,
      message: m.message || m.text || "",
      html_message: m.html_message || m.message_html || null,
      sources: m.sources || m.context_sources || [],
      title: m.title || "",
      files: m.files || [],
    }));

    setMessages(formatted);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 200);
  } catch (err) {
    console.log("LOAD SESSION ERROR:", err);
    Toast.show({ type: "error", text1: "Failed to load session" });
  } finally {
    setLoading(false);
  }
};

  const sendFollowup = async () => {
    const text = input.trim();
    if (!text) return;

    setSending(true);
    try {
      const body = {
        message: text,
        loadchat: false,
        config_id: configId,
        conf_names: initialSearchData?.conf_names || [resource],
        timePeriod: initialSearchData?.timePeriod || "60 Days",
        search_folder: initialSearchData?.search_folder || [],
        selected_files: initialSearchData?.selected_files || [],
        allitems: initialSearchData?.allitems || [],
        titles_only: false,
        web_search: false,
        audioFile: null,
        llm: initialSearchData?.llm,
      };

      const res = await streamChat(resource, sessionId, body);

      const arr = Array.isArray(res.data) ? res.data : [];
      const formatted = arr.map((m) => ({
        agent: m.agent,
        message: m.message,
        sources: m.sources || [],
        title: m.title || "",
        files: m.files || [],
      }));

      setMessages((prev) => [...prev, ...formatted]);
      setInput("");

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 200);
    } catch (err) {
      console.log("💥 FOLLOWUP ERROR RESPONSE:", err?.response?.data);
  console.log("💥 FOLLOWUP ERROR:", err);
      Toast.show({ type: "error", text1: "Failed to send" });
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 8 }}>
            Loading conversation...
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.messagesWrap}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, index) => {
              const isUser =
                msg.agent === "user" || msg.agent === "USER" || msg.agent === "User";

              return (
                <ChatMessage
                  key={index}
                  msg={msg}
                  isUser={isUser}
                  onSourcePress={(src) =>
                    navigation.navigate("SourceDetail", { source: src })
                  }
                />
              );
            })}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              placeholder="Ask follow-up..."
              placeholderTextColor="#888"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendFollowup}
              style={styles.input}
            />

            <TouchableOpacity
              onPress={sendFollowup}
              style={styles.sendBtn}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Feather name="send" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingTop: 56, paddingHorizontal: 12 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  loaderWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  messagesWrap: { paddingBottom: 200 },
  inputRow: {
    position: "absolute",
    bottom: 20,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#111",
    color: "#fff",
    borderColor: "#333",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
